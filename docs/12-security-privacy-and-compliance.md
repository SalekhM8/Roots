# 12-security-privacy-and-compliance.md

## Core: Treat consultation data as special category data (UK GDPR).

## Data Classification
Public: marketing/products. Account: name/email/address. Sensitive: consultation answers, metrics, medications, conditions, uploads, prescriber notes, prescriptions.

## Rules
- No PHI in URLs, logs, analytics, error messages
- Zod validation on ALL server writes
- Presigned S3 uploads: private bucket, short-lived URLs, ownership verified
- Stripe: verify webhooks, idempotency keys, no client secrets
- RBAC server-side everywhere
- Audit logs: append-only, all privileged actions
- Rate limiting: auth, consultation submit, upload presign, checkout, admin actions
- Secrets in env vars only. Rotate if exposed.
- Neon: TLS, PITR, least-privilege users

## Regulatory Note
System security posture. GPhC/UK GDPR compliance requires operational and legal review beyond software.
