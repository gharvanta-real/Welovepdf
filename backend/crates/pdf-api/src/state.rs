use pdf_engine::{EngineConfig, JobOutput, ToolRegistry};
use serde::Serialize;

#[derive(Clone)]
pub struct AppState {
    pub registry: ToolRegistry,
    pub config: EngineConfig,
    pub db: sqlx::SqlitePool,
}

#[derive(Debug, Clone, Serialize)]
pub struct User {
    pub id: String,
    pub email: String,
    pub name: String,
    pub plan: String,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct JobRecord {
    pub job_id: String,
    pub tool_id: String,
    pub status: String,
    pub output_path: String,
    pub bytes: u64,
    pub progress: u8,
}

impl AppState {
    pub fn new(db: sqlx::SqlitePool) -> Self {
        Self {
            registry: ToolRegistry::production_default(),
            config: EngineConfig::from_env(),
            db,
        }
    }

    pub async fn record_output(
        &self,
        output: &JobOutput,
        user_id: Option<&str>,
        ip_address: Option<&str>,
    ) -> Result<JobRecord, sqlx::Error> {
        let record = JobRecord {
            job_id: output.job_id.clone(),
            tool_id: output.tool_id.clone(),
            status: "completed".into(),
            output_path: output.output_path.display().to_string(),
            bytes: output.bytes,
            progress: 100,
        };

        sqlx::query(
            "INSERT INTO jobs (id, user_id, ip_address, tool_id, status, output_path, bytes, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
        )
        .bind(&record.job_id)
        .bind(user_id)
        .bind(ip_address)
        .bind(&record.tool_id)
        .bind(&record.status)
        .bind(&record.output_path)
        .bind(record.bytes as i64)
        .bind(chrono::Utc::now().to_rfc3339())
        .execute(&self.db)
        .await?;

        Ok(record)
    }

    pub async fn get_job(&self, job_id: &str) -> Option<JobRecord> {
        let row: Option<(String, String, String, String, i64)> = sqlx::query_as(
            "SELECT id, tool_id, status, output_path, bytes FROM jobs WHERE id = ?"
        )
        .bind(job_id)
        .fetch_optional(&self.db)
        .await
        .ok()
        .flatten();

        row.map(|(id, tool_id, status, output_path, bytes)| JobRecord {
            job_id: id,
            tool_id,
            status,
            output_path,
            bytes: bytes as u64,
            progress: 100,
        })
    }

    pub async fn create_user(
        &self,
        id: &str,
        email: &str,
        name: &str,
        password_hash: &str,
    ) -> Result<(), sqlx::Error> {
        sqlx::query(
            "INSERT INTO users (id, email, name, password_hash, plan, created_at)
             VALUES (?, ?, ?, ?, 'Free', ?)"
        )
        .bind(id)
        .bind(email)
        .bind(name)
        .bind(password_hash)
        .bind(chrono::Utc::now().to_rfc3339())
        .execute(&self.db)
        .await?;
        Ok(())
    }

    pub async fn find_user_by_email(&self, email: &str) -> Option<UserDB> {
        sqlx::query_as::<_, (String, String, String, String, String, String)>(
            "SELECT id, email, name, password_hash, plan, created_at FROM users WHERE email = ?"
        )
        .bind(email)
        .fetch_optional(&self.db)
        .await
        .ok()
        .flatten()
        .map(|(id, email, name, password_hash, plan, created_at)| UserDB {
            id,
            email,
            name,
            password_hash,
            plan,
            created_at,
        })
    }

    pub async fn create_session(
        &self,
        token: &str,
        user_id: &str,
        expires_at: chrono::DateTime<chrono::Utc>,
    ) -> Result<(), sqlx::Error> {
        sqlx::query(
            "INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)"
        )
        .bind(token)
        .bind(user_id)
        .bind(expires_at.to_rfc3339())
        .execute(&self.db)
        .await?;
        Ok(())
    }

    pub async fn find_user_by_token(&self, token: &str) -> Option<User> {
        sqlx::query_as::<_, (String, String, String, String, String)>(
            "SELECT u.id, u.email, u.name, u.plan, u.created_at
             FROM users u
             JOIN sessions s ON u.id = s.user_id
             WHERE s.token = ? AND s.expires_at > ?"
        )
        .bind(token)
        .bind(chrono::Utc::now().to_rfc3339())
        .fetch_optional(&self.db)
        .await
        .ok()
        .flatten()
        .map(|(id, email, name, plan, created_at)| User {
            id,
            email,
            name,
            plan,
            created_at,
        })
    }

    pub async fn delete_session(&self, token: &str) -> Result<(), sqlx::Error> {
        sqlx::query("DELETE FROM sessions WHERE token = ?")
            .bind(token)
            .execute(&self.db)
            .await?;
        Ok(())
    }

    pub async fn upgrade_user_plan(&self, user_id: &str, plan: &str) -> Result<(), sqlx::Error> {
        sqlx::query("UPDATE users SET plan = ? WHERE id = ?")
            .bind(plan)
            .bind(user_id)
            .execute(&self.db)
            .await?;
        Ok(())
    }

    pub async fn get_job_count_last_24h(
        &self,
        user_id: Option<&str>,
        ip_address: Option<&str>,
    ) -> Result<i32, sqlx::Error> {
        let threshold = (chrono::Utc::now() - chrono::Duration::hours(24)).to_rfc3339();

        let count: (i32,) = if let Some(uid) = user_id {
            sqlx::query_as(
                "SELECT COUNT(*) FROM jobs WHERE (user_id = ? OR ip_address = ?) AND created_at > ?"
            )
            .bind(uid)
            .bind(ip_address)
            .bind(&threshold)
            .fetch_one(&self.db)
            .await?
        } else {
            sqlx::query_as(
                "SELECT COUNT(*) FROM jobs WHERE ip_address = ? AND user_id IS NULL AND created_at > ?"
            )
            .bind(ip_address)
            .bind(&threshold)
            .fetch_one(&self.db)
            .await?
        };

        Ok(count.0)
    }

    pub async fn get_user_jobs(&self, user_id: &str) -> Result<Vec<JobRecord>, sqlx::Error> {
        let rows: Vec<(String, String, String, String, i64)> = sqlx::query_as(
            "SELECT id, tool_id, status, output_path, bytes FROM jobs WHERE user_id = ? ORDER BY created_at DESC LIMIT 50"
        )
        .bind(user_id)
        .fetch_all(&self.db)
        .await?;

        let records = rows
            .into_iter()
            .map(|(id, tool_id, status, output_path, bytes)| JobRecord {
                job_id: id,
                tool_id,
                status,
                output_path,
                bytes: bytes as u64,
                progress: 100,
            })
            .collect();

        Ok(records)
    }
}

// Helper struct for internal database mappings with password hash
#[derive(Debug, Clone)]
pub struct UserDB {
    pub id: String,
    pub email: String,
    pub name: String,
    pub password_hash: String,
    pub plan: String,
    pub created_at: String,
}
