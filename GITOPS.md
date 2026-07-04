# GitOps deployment contract

This document is the interface between `rmovie` and its separate GitOps
repository. The application repository owns the container image and this
runtime contract. The GitOps repository owns Kubernetes resources, ingress,
service-mesh configuration, and environment-specific values.

## Container

- Image: `ghcr.io/dgkim-lab/rmovie`
- Listen port: `3000/TCP`
- Run as a non-root user.
- Use an immutable release tag or image digest in GitOps. Do not deploy
  `latest`.
- The container needs outbound HTTPS access to Google APIs and the configured
  OIDC issuer.

The GitHub Actions workflow will publish a commit-SHA tag for every published
image. Release tags may additionally publish a matching semantic-version tag.

## Health checks

Configure Kubernetes probes against these unauthenticated endpoints:

| Purpose | Method and path | Expected result |
| --- | --- | --- |
| Liveness | `GET /api/health/live` | `200` when the process is running |
| Readiness | `GET /api/health/ready` | `200` when required configuration is valid |

Readiness must not call Google Sheets or the OIDC provider on every probe. This
prevents an external dependency outage from continuously restarting or
removing every application replica.

## Required configuration

Store non-sensitive values in a ConfigMap and sensitive values in a Secret or
external secret provider.

| Variable | Source | Description |
| --- | --- | --- |
| `AUTH_PROVIDER` | ConfigMap | `keycloak` or `cognito` |
| `AUTH_ISSUER` | ConfigMap | OIDC issuer URL for the selected provider |
| `AUTH_CLIENT_ID` | Secret | OIDC application client ID |
| `AUTH_CLIENT_SECRET` | Secret | OIDC application client secret |
| `AUTH_SECRET` | Secret | High-entropy session-signing secret |
| `AUTH_URL` | ConfigMap | Public application URL, such as `https://rmovie.example.com` |
| `GOOGLE_SHEETS_SPREADSHEET_ID` | ConfigMap | Source spreadsheet ID |
| `GOOGLE_SHEETS_RANGE` | ConfigMap | Sheet name or range, for example `Sheet1!A:Z` |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Secret | Complete Google service-account JSON document |
| `REDIRECT_DELAY_MS` | ConfigMap | Redirect delay in milliseconds; default `4000` |

The OIDC client must allow this callback URL:

```text
${AUTH_URL}/api/auth/callback/${AUTH_PROVIDER}
```

The exact callback identifier will be verified against the implemented Auth.js
provider configuration before the first release. GitOps should treat the
application's documented callback path as authoritative.

Instead of `GOOGLE_SERVICE_ACCOUNT_JSON`, GitOps may mount the credential JSON
as a read-only Secret volume and set `GOOGLE_CREDENTIALS_FILE` to its path.
Never put Google credentials in a ConfigMap or committed values file.

## Optional debug endpoint

| Variable | Default | Description |
| --- | --- | --- |
| `ENABLE_DEBUG_ENDPOINTS` | `false` | Enables authenticated observability test endpoints |
| `RANDOM_ERROR_RATE` | `0.5` | Failure probability from `0` through `1` |

When enabled, `GET /api/debug/random-error` returns a deliberate mixture of
successful and error responses. It requires normal user authentication. Do not
use it as a health probe.

## OpenTelemetry and service mesh

The application exports OTLP telemetry using standard OpenTelemetry variables:

| Variable | Suggested value |
| --- | --- |
| `OTEL_SERVICE_NAME` | `rmovie` |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | Cluster-local OpenTelemetry Collector endpoint |
| `OTEL_EXPORTER_OTLP_PROTOCOL` | `http/protobuf` or the protocol supported by the collector |
| `OTEL_RESOURCE_ATTRIBUTES` | `deployment.environment.name=<environment>,service.namespace=<namespace>` |

Send application telemetry to an OpenTelemetry Collector rather than directly
to Jaeger. The GitOps repository should configure the collector exporter,
sampling policy, and credentials.

For Kiali and Istio:

- Inject the service-mesh sidecar according to cluster policy.
- Preserve W3C `traceparent` and `tracestate` headers through ingress and mesh
  proxies.
- Configure the mesh and application to use the same trace backend.
- Keep the application Service port named `http` so protocol detection and
  traffic metrics work reliably.

## Ingress and scaling

- Terminate TLS at the ingress or service-mesh gateway.
- Forward the original scheme and host headers to the application.
- Do not expose the container port directly outside the cluster.
- No sticky sessions are required; authentication sessions and random-item
  selection are stateless from the application's perspective.
- Start with one replica and define resource requests before enabling
  autoscaling. Scale based on measured traffic rather than the deliberate debug
  endpoint failures.

## Release handoff

For each deployment, the application pipeline supplies an immutable image tag
or digest. The GitOps change should record:

1. image tag or digest;
2. required configuration additions or removals;
3. authentication callback changes;
4. health endpoint changes;
5. telemetry schema or collector requirement changes.

