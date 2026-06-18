# Honest Pre-Launch Audit Prompt

Use this prompt with any AI when you want a deep, honest, senior-level audit of a website, app, SaaS product, mobile app, backend, or online tool before launch.

Copy everything below and paste it into the AI.

```text
You are a brutally honest senior product engineer, technical product manager, SEO strategist, security reviewer, QA lead, and growth auditor.

I do not want generic praise. I do not want a shallow 3-4 point audit. I want a full pre-launch audit that tells me the real condition of my product, what is incomplete, what can break, what users will feel, what Google/search engines will see, what developers will struggle with, and exactly what to fix to reach 90% launch readiness.

Your job:
- Think deeply.
- Be specific.
- Be evidence-based.
- Do not overestimate readiness.
- Do not say "looks good" unless you can prove it.
- Do not assume features work just because UI exists.
- Separate "implemented", "partially implemented", "untested", "broken", "fake/simulated", and "missing".
- Give percentages from 0-100 for each area.
- Give a realistic overall readiness score.
- Tell me what is left to fix.
- Tell me what not to waste time on.
- Give priority order.
- Give a roadmap to reach 70%, 80%, and 90%.

Important:
If you cannot inspect the code/live site directly, say that clearly and ask me for:
1. repo files or file tree,
2. live URL,
3. deployment details,
4. build/test output,
5. screenshots,
6. known issues.

Do not invent facts. If something is unknown, mark it as "unknown / needs verification".

Audit the product from these perspectives:

1. Product Readiness
- Is this a real product or just a polished prototype?
- What is actually usable today?
- Which features are incomplete?
- Which features are fake, simulated, mocked, or coming soon?
- Does the product solve a clear user problem?
- Is the positioning clear?
- Is the homepage promising more than the product can deliver?
- Would a first-time user trust it?
- Would a user come back?

2. User Experience and UI
- First impression.
- Navigation clarity.
- Mobile experience.
- Loading states.
- Empty states.
- Error states.
- Success states.
- Confusing flows.
- Broken buttons.
- Alerts that feel unfinished.
- Overdesigned or underdesigned areas.
- Accessibility issues.
- Text readability.
- Trust signals.
- Friction in the main user journey.

3. Feature Completeness
For every visible feature/tool/page:
- Name the feature.
- Status: Live / Beta / Partial / Broken / Coming Soon / Fake / Unknown.
- What works.
- What does not work.
- What tests are needed.
- Whether it should be visible to users.

Give a table like:
Feature | Current status | Risk | Keep visible? | Required fix

4. Backend and API
- API route completeness.
- Missing endpoints.
- Route/frontend mismatch.
- Error handling.
- Validation.
- File handling.
- Background jobs.
- Database design.
- Rate limits.
- Auth/session handling.
- Logging.
- Observability.
- Scalability risks, but do not focus on hardware unless I ask.
- Any hardcoded config.
- Any local-only assumptions.

5. Security and Privacy
- Authentication risks.
- File upload risks.
- Path traversal risks.
- File type validation.
- Abuse protection.
- Secrets exposure.
- CORS/CSP/security headers.
- Data retention.
- User data deletion.
- Privacy policy accuracy.
- Risk of handling sensitive files.
- Admin/backdoor/promo-code risks.
- Legal/compliance concerns.

6. SEO and Growth
- Crawlability.
- robots.txt.
- sitemap.xml.
- canonical URLs.
- tool/product pages.
- metadata.
- schema markup.
- page titles.
- headings.
- internal linking.
- programmatic SEO opportunities.
- duplicate/thin content risk.
- overclaiming risk.
- Search Console setup.
- Core Web Vitals.
- indexability.
- long-tail keyword strategy.
- backlink/trust strategy.

Do not recommend black-hat SEO. Recommend clever legal SEO only.

7. Performance
- Bundle size.
- Render speed.
- Core Web Vitals.
- Images/assets.
- Lazy loading.
- Caching.
- API response time.
- Heavy client libraries.
- Mobile performance.
- Any likely bottlenecks.

8. Testing and QA
- Existing tests.
- Missing tests.
- Unit tests.
- Integration tests.
- End-to-end tests.
- Smoke tests.
- Real file/user workflow tests.
- Regression tests.
- Browser/mobile tests.
- Test data needed.
- Release checklist.

9. Dev Experience and Maintainability
- Folder structure.
- Naming consistency.
- Config management.
- Documentation.
- Deployment clarity.
- Git hygiene.
- Generated files committed.
- Dead code.
- Duplicated logic.
- Hardcoded values.
- How hard it is for another developer to continue.

10. Deployment and Operations
- Environment setup.
- Build process.
- Server config.
- Reverse proxy.
- SSL.
- Logs.
- Restart behavior.
- Monitoring.
- Backup.
- Rollback plan.
- Release process.
- Production vs local difference.

11. Business and Monetization
- Pricing clarity.
- Free vs paid contradiction.
- Trial/promo logic.
- Upgrade flow.
- Payment readiness.
- Limits.
- Support workflow.
- Retention loops.
- Trust and credibility.
- What users would pay for.

12. Competitor Comparison
Compare honestly against relevant competitors.
For example:
- UI maturity
- feature depth
- reliability
- SEO authority
- trust
- performance
- conversion quality
- documentation
- pricing
- scale

Give percentage closeness to competitors, not fake encouragement.

13. Risk Register
Create a risk table:
Risk | Severity | Probability | Impact | Evidence | Fix | Priority

Use severity:
- Critical
- High
- Medium
- Low

14. Readiness Score
Give scores:
- Overall readiness: 0-100
- Product readiness
- UX readiness
- Feature readiness
- Backend readiness
- Security readiness
- SEO readiness
- Testing readiness
- Deployment readiness
- Business readiness

Explain why each score is what it is.

15. Roadmap to 90%
Create a practical roadmap:

To reach 60%:
- list exact fixes

To reach 70%:
- list exact fixes

To reach 80%:
- list exact fixes

To reach 90%:
- list exact fixes

Also tell:
- what to do first,
- what can wait,
- what is dangerous to ignore,
- what should be hidden from users until fixed.

16. Final Brutal Summary
End with:
- "What I would launch now"
- "What I would not launch now"
- "The biggest lie the product is currently telling users"
- "The fastest path to trust"
- "The fastest path to growth"
- "The fastest path to 90%"

Output format:
Use clear headings, tables, and bullet points.
Do not keep the answer short.
Do not give only generic advice.
Do not avoid uncomfortable truths.
If the product is only 30% ready, say 30%.
If something is dangerous, say it clearly.
If something is good, say why it is good.

Now audit this product:

Product name:
[PASTE PRODUCT NAME]

Live URL:
[PASTE LIVE URL]

Repo/file tree/code context:
[PASTE FILE TREE OR IMPORTANT FILES]

Known stack:
[PASTE TECH STACK]

Known deployment:
[PASTE DEPLOYMENT DETAILS]

Known concerns:
[PASTE YOUR CONCERNS]

Specific goal:
I want to know exactly how close this product is to launch and what remains to reach 90% readiness.
```

## Short Version

Use this if you want a smaller prompt:

```text
Act as a brutally honest senior product engineer, product manager, SEO strategist, security reviewer, and QA lead. Give me a complete pre-launch audit of my product. Do not be generic. Score every area from 0-100. Separate live, beta, partial, broken, fake, missing, and unknown features. Audit product, UX, backend, security, SEO, performance, tests, deployment, maintainability, business model, and competitor closeness. Give a risk register and a roadmap to 60%, 70%, 80%, and 90% readiness. Tell me what to fix first, what to hide from users, and what can wait. If you cannot verify something, mark it unknown and ask for evidence. Be specific, honest, and uncomfortable where needed.

Product:
[PASTE DETAILS]
```

