# GitOps contract

The GitOps repository owns Kubernetes, ingress, mesh, and environment values.
This repository publishes the application image and defines its runtime
interface.

## Workload

- Image: `ghcr.io/dgkim-lab/rmovie` using a commit-SHA tag or digest, not
  `latest`.
- Port: `3000`, named `http` in the Kubernetes Service.
- Run as non-root and allow outbound HTTPS to Google APIs and the OIDC issuer.
- Liveness: `GET /api/health/live`.
- Readiness: `GET /api/health/ready`.

## Configuration

| Variable | Storage | Purpose |
| --- | --- | --- |
| `AUTH_PROVIDER` | ConfigMap | `keycloak` or `cognito` |
| `AUTH_ISSUER`, `AUTH_URL` | ConfigMap | OIDC issuer and public application URL |
| `AUTH_CLIENT_ID`, `AUTH_CLIENT_SECRET`, `AUTH_SECRET` | Secret | OIDC and session secrets |
| `AUTH_SCOPES` | ConfigMap | OIDC scopes; default `openid` |
| `AUTH_LOGOUT_URL` | ConfigMap | Required Cognito managed-login `/logout` URL; optional for Keycloak |
| `AUTH_ACCOUNT_URL` | ConfigMap | Optional account-management page; Keycloak derives its console URL |
| `GOOGLE_SHEETS_SPREADSHEET_ID`, `GOOGLE_SHEETS_RANGE` | ConfigMap | Sheet source |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Secret | Google service-account JSON |
| `REDIRECT_DELAY_MS` | ConfigMap | Redirect delay; default `4000` |

The OIDC client callback is
`${AUTH_URL}/api/auth/callback/${AUTH_PROVIDER}`. Credentials may instead be
mounted as a Secret file and referenced by `GOOGLE_CREDENTIALS_FILE`.

## Observability

Set `OTEL_SERVICE_NAME=rmovie`, `OTEL_EXPORTER_OTLP_ENDPOINT` to the in-cluster
collector, and `OTEL_RESOURCE_ATTRIBUTES` for the environment and namespace.
Preserve W3C trace headers through ingress and Istio so Jaeger and Kiali can
correlate traffic.

The authenticated `GET /api/debug/random-error` endpoint is enabled with
`ENABLE_DEBUG_ENDPOINTS=true`; `RANDOM_ERROR_RATE` defaults to `0.5`. Never use
it as a health probe.

Each application release must hand off its immutable image reference and note
changes to environment variables, callbacks, probes, or telemetry.
