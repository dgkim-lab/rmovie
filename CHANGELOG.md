# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Add administrator user-role management and application-wide history
  management, including soft deletion, restoration, and permanent deletion.
- Add PostgreSQL OpenTelemetry instrumentation.
- Add `enduser.id` and optional `user.email` attributes to authenticated request
  and application spans for user-level trace searches in Jaeger.
- Add Docker-based Prisma Studio support and database bootstrap improvements.

### Security

- Document that trace user identifiers and email addresses are PII and require
  restricted Jaeger access or Collector-side redaction.

## [1.0.0] - 2026-07-05

### Added

- Persist movie suggestion and acceptance activity in PostgreSQL with Prisma.
- Add per-user activity history, individual soft deletion, and history clearing.
- Persist provider-qualified OIDC subjects for stable activity ownership.
- Display authenticated user profiles and application build versions.
- Publish container images from feature branches and dispatch image updates to
  the GitOps repository.

### Fixed

- Fix Cognito login through Google federation.
- Use a single application image for database migrations.

## [0.1.0] - 2026-07-04

### Added

- Add the initial authenticated random-movie application backed by a private
  Google Sheet.
- Support Keycloak and Amazon Cognito authentication and provider-aware logout.
- Add health checks, a protected deliberate-error endpoint, OpenTelemetry trace
  export, local Jaeger integration, and GitOps deployment guidance.
- Correlate handled application errors with error IDs, trace IDs, span status,
  and exception events.
- Add the initial image publishing and GitOps dispatch workflow.

### Fixed

- Stabilize the authentication login flow.

[Unreleased]: https://github.com/dgkim-lab/rmovie/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/dgkim-lab/rmovie/compare/v0.1.0...v1.0.0
[0.1.0]: https://github.com/dgkim-lab/rmovie/releases/tag/v0.1.0
