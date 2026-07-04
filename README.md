# rmovie

`rmovie` selects a random `name` and `url` row from a private Google Sheet,
shows it to an authenticated user, and redirects after a configurable delay.
Keycloak and Amazon Cognito are supported as selectable OIDC providers.
Signing out clears both the local Auth.js session and the configured provider
session. Keycloak exposes its account console automatically; Cognito account
management requires an optional application-owned `AUTH_ACCOUNT_URL`.

## Local development

Requirements: Node.js 22+, npm, a Google service account, and an OIDC client.
The sheet must have case-insensitive `name` and `url` headers and be shared with
the service-account email.

```bash
cp .env.example .env
npm install
npm run dev
```

Fill in `.env` and place the Google key at `credentials.json`, or set
`GOOGLE_SERVICE_ACCOUNT_JSON`. See [SETUP.md](SETUP.md) for complete Keycloak,
Cognito, Google Sheets, and Argo CD instructions.

Useful checks:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Docker and tracing

With a completed `.env`, start the application, OpenTelemetry Collector, and
Jaeger:

```bash
docker compose up --build
```

Compose mounts the ignored local `credentials.json` read-only at
`/app/credentials.json`.

The application is at <http://localhost:3000> and Jaeger is at
<http://localhost:16686>. Set `ENABLE_DEBUG_ENDPOINTS=true`, sign in, and call
`GET /api/debug/random-error` to generate observable success and error spans.
Kiali requires Kubernetes and Istio and is therefore configured in GitOps.

## Runtime endpoints

- `GET /api/health/live`: unauthenticated liveness check.
- `GET /api/health/ready`: unauthenticated configuration readiness check.
- `GET /api/random-item`: authenticated random item.
- `GET /api/debug/random-error`: authenticated and disabled by default.

See [GITOPS.md](GITOPS.md) for the deployment contract and `.env.example` for
all runtime settings.

The container publishing workflow emits an `image-published` repository
dispatch after a successful `main` image push. Configure `GITOPS_REPOSITORY`
and `GITOPS_REPO_TOKEN` as described in [GITOPS.md](GITOPS.md).
