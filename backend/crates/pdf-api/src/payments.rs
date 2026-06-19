use axum::{
    extract::{State},
    http::{HeaderMap, StatusCode},
    response::IntoResponse,
    Json,
};
use serde::{Deserialize, Serialize};
use crate::state::AppState;
use std::env;
use hmac::{Hmac, Mac};
use sha2::Sha256;

type HmacSha256 = Hmac<Sha256>;

#[derive(Debug, Deserialize)]
pub struct CreateCheckoutRequest {
    pub plan: String,
}

#[derive(Debug, Serialize)]
pub struct CreateCheckoutResponse {
    pub url: String,
}

#[derive(Debug, Serialize)]
struct LocalErrorBody {
    error: String,
}

pub async fn create_checkout_session(
    State(state): State<AppState>,
    headers: HeaderMap,
    Json(payload): Json<CreateCheckoutRequest>,
) -> impl IntoResponse {
    let user = match crate::authenticate_user(&state, &headers).await {
        Some(u) => u,
        None => return (StatusCode::UNAUTHORIZED, Json(LocalErrorBody { error: "Authentication required".into() })).into_response(),
    };

    let plan = payload.plan.trim();
    if plan != "Pro" && plan != "Enterprise" {
        return (StatusCode::BAD_REQUEST, Json(LocalErrorBody { error: "Invalid plan selected".into() })).into_response();
    }

    let stripe_secret = match env::var("STRIPE_SECRET_KEY") {
        Ok(k) if !k.is_empty() => k,
        _ => return (StatusCode::INTERNAL_SERVER_ERROR, Json(LocalErrorBody { error: "Stripe secret key not configured".into() })).into_response(),
    };

    let redirect_url = env::var("CLIENT_REDIRECT_URL")
        .unwrap_or_else(|_| "https://pdfmount.online/pricing".into());

    let unit_amount = if plan == "Pro" { "1900" } else { "2900" };
    let product_name = format!("PDFMount {}", plan);

    let client = reqwest::Client::new();
    
    // Construct form data manually for Stripe's url-encoded API format
    let form_data = [
        ("payment_method_types[0]", "card"),
        ("line_items[0][price_data][currency]", "usd"),
        ("line_items[0][price_data][product_data][name]", &product_name),
        ("line_items[0][price_data][unit_amount]", unit_amount),
        ("line_items[0][price_data][recurring][interval]", "month"),
        ("line_items[0][quantity]", "1"),
        ("mode", "subscription"),
        ("success_url", &format!("{}?session_id={{CHECKOUT_SESSION_ID}}", redirect_url)),
        ("cancel_url", &redirect_url),
        ("metadata[user_id]", &user.id),
        ("metadata[plan]", plan),
    ];

    let response = match client
        .post("https://api.stripe.com/v1/checkout/sessions")
        .basic_auth(&stripe_secret, Some(""))
        .form(&form_data)
        .send()
        .await
    {
        Ok(res) => res,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(LocalErrorBody { error: format!("Failed to reach Stripe: {}", e) })).into_response(),
    };

    if !response.status().is_success() {
        let err_text = response.text().await.unwrap_or_default();
        return (StatusCode::BAD_GATEWAY, Json(LocalErrorBody { error: format!("Stripe returned error: {}", err_text) })).into_response();
    }

    #[derive(Deserialize)]
    struct StripeSession {
        url: String,
    }

    match response.json::<StripeSession>().await {
        Ok(session) => (StatusCode::OK, Json(CreateCheckoutResponse { url: session.url })).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(LocalErrorBody { error: format!("Failed to parse Stripe response: {}", e) })).into_response(),
    }
}

pub async fn stripe_webhook(
    State(state): State<AppState>,
    headers: HeaderMap,
    body: axum::body::Bytes,
) -> impl IntoResponse {
    let webhook_secret = match env::var("STRIPE_WEBHOOK_SECRET") {
        Ok(k) if !k.is_empty() => k,
        _ => {
            eprintln!("Stripe webhook secret is not configured in environment.");
            return StatusCode::INTERNAL_SERVER_ERROR;
        }
    };

    let signature = match headers.get("Stripe-Signature").and_then(|v| v.to_str().ok()) {
        Some(s) => s,
        None => {
            eprintln!("Missing Stripe-Signature header.");
            return StatusCode::BAD_REQUEST;
        }
    };

    // 1. Cryptographically verify Stripe webhook signature (Hack-proof wall)
    if !verify_stripe_signature(&body, signature, &webhook_secret) {
        eprintln!("Stripe Webhook signature verification failed!");
        return StatusCode::BAD_REQUEST;
    }

    // 2. Parse Webhook Event JSON payload
    #[derive(Deserialize)]
    struct StripeEvent {
        #[serde(rename = "type")]
        event_type: String,
        data: StripeEventData,
    }

    #[derive(Deserialize)]
    struct StripeEventData {
        object: StripeSessionObject,
    }

    #[derive(Deserialize)]
    struct StripeSessionObject {
        id: String,
        metadata: Option<StripeSessionMetadata>,
    }

    #[derive(Deserialize)]
    struct StripeSessionMetadata {
        user_id: Option<String>,
        plan: Option<String>,
    }

    let event: StripeEvent = match serde_json::from_slice(&body) {
        Ok(ev) => ev,
        Err(e) => {
            eprintln!("Failed to parse Stripe webhook JSON: {}", e);
            return StatusCode::BAD_REQUEST;
        }
    };

    if event.event_type == "checkout.session.completed" {
        let session = event.data.object;
        if let Some(meta) = session.metadata {
            if let (Some(user_id), Some(plan)) = (meta.user_id, meta.plan) {
                println!("Processing Stripe subscription upgrade for user: {}, plan: {}", user_id, plan);
                
                let now = chrono::Utc::now().to_rfc3339();
                // Subscriptions are monthly, expires 30 days from now
                let expires_at = (chrono::Utc::now() + chrono::Duration::days(30)).to_rfc3339();
                let sub_id = format!("stripe_{}", session.id);

                // Upsert subscription in database
                let result = sqlx::query(
                    "INSERT INTO subscriptions (id, user_id, plan, promo_code_used, activated_at, expires_at)
                     VALUES (?, ?, ?, ?, ?, ?)
                     ON CONFLICT(user_id) DO UPDATE SET
                       plan = excluded.plan,
                       promo_code_used = excluded.promo_code_used,
                       activated_at = excluded.activated_at,
                       expires_at = excluded.expires_at"
                )
                .bind(&sub_id)
                .bind(&user_id)
                .bind(&plan)
                .bind("STRIPE")
                .bind(&now)
                .bind(&expires_at)
                .execute(&state.db)
                .await;

                match result {
                    Ok(_) => {
                        // Upgrade user tier in users table
                        if let Err(e) = state.upgrade_user_plan(&user_id, &plan).await {
                            eprintln!("Stripe webhook: Failed to upgrade user plan in users table: {}", e);
                        } else {
                            println!("Stripe webhook: Successfully upgraded user {} to plan {}", user_id, plan);
                        }
                    }
                    Err(e) => {
                        eprintln!("Stripe webhook: Failed to write subscription to DB: {}", e);
                        return StatusCode::INTERNAL_SERVER_ERROR;
                    }
                }
            }
        }
    }

    StatusCode::OK
}

pub(crate) fn verify_stripe_signature(payload: &[u8], signature_header: &str, secret: &str) -> bool {
    let mut t = "";
    let mut v1 = "";
    for part in signature_header.split(',') {
        let mut kv = part.splitn(2, '=');
        if let (Some(k), Some(v)) = (kv.next(), kv.next()) {
            match k.trim() {
                "t" => t = v.trim(),
                "v1" => v1 = v.trim(),
                _ => {}
            }
        }
    }
    
    if t.is_empty() || v1.is_empty() {
        return false;
    }
    
    let t_bytes = t.as_bytes();
    let dot = b".";
    let mut message = Vec::with_capacity(t_bytes.len() + 1 + payload.len());
    message.extend_from_slice(t_bytes);
    message.extend_from_slice(dot);
    message.extend_from_slice(payload);
    
    let mut mac = match HmacSha256::new_from_slice(secret.as_bytes()) {
        Ok(m) => m,
        Err(_) => return false,
    };
    mac.update(&message);
    let result = mac.finalize();
    let computed_bytes = result.into_bytes();
    
    let mut expected_bytes = Vec::with_capacity(v1.len() / 2);
    for i in 0..(v1.len() / 2) {
        if let Ok(byte) = u8::from_str_radix(&v1[i*2..i*2+2], 16) {
            expected_bytes.push(byte);
        } else {
            return false;
        }
    }
    
    if computed_bytes.len() != expected_bytes.len() {
        return false;
    }
    
    let mut equal = 0;
    for (a, b) in computed_bytes.iter().zip(expected_bytes.iter()) {
        equal |= a ^ b;
    }
    equal == 0
}

#[cfg(test)]
mod tests {
    use super::*;
    use hmac::Mac;

    #[test]
    fn test_verify_stripe_signature_valid() {
        let payload = b"{\"id\": \"evt_test\"}";
        let secret = "whsec_test_secret";
        let timestamp = "1700000000";
        
        // Compute correct signature
        let mut message = Vec::new();
        message.extend_from_slice(timestamp.as_bytes());
        message.extend_from_slice(b".");
        message.extend_from_slice(payload);
        
        let mut mac = HmacSha256::new_from_slice(secret.as_bytes()).unwrap();
        mac.update(&message);
        let expected_bytes = mac.finalize().into_bytes();
        let expected_hex: String = expected_bytes.iter().map(|b| format!("{:02x}", b)).collect();
        
        let signature_header = format!("t={},v1={}", timestamp, expected_hex);
        assert!(verify_stripe_signature(payload, &signature_header, secret));
    }

    #[test]
    fn test_verify_stripe_signature_invalid() {
        let payload = b"{\"id\": \"evt_test\"}";
        let secret = "whsec_test_secret";
        
        // Missing signature or incorrect
        assert!(!verify_stripe_signature(payload, "t=1700000000", secret));
        assert!(!verify_stripe_signature(payload, "v1=abcd", secret));
        assert!(!verify_stripe_signature(payload, "t=1700000000,v1=badhex", secret));
    }
}
