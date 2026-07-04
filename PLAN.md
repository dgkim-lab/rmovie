# Implementation plan

1. Scaffold a TypeScript Next.js App Router application using npm and MUI.
2. Port the Google Sheets parser and random selection into framework-neutral
   modules with tests.
3. Add the authenticated random-item page and configurable redirect controls.
4. Support Keycloak or Cognito through one configurable Auth.js OIDC setup.
5. Add health checks, a protected random-error endpoint, and OpenTelemetry
   tracing through a shared span helper.
6. Add a non-root production image and a local Docker Compose stack with an
   OpenTelemetry Collector and Jaeger.
7. Add GitHub Actions for validation and publishing immutable GHCR images.
8. Document local setup, configuration, and the GitOps deployment contract.
9. Verify linting, types, tests, production build, and container configuration.

