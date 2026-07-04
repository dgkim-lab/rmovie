# Instruction to Codex

I want to create an app called `rmovie`
The basic idea of the app is to show random item from the google sheet.
The prototype project is currently in ../example/serverless/rmovie

## Architectural design

If its possible I want it to be deployable to both `k3s` and aws `lambda` with `serverless` framework.
BUT!! AT THE CURRENT STAGE, THE CODE SHOULD NOT DEPEND ON SERVERLESS OR AWS APIGATEWAY FRAMEWORK NOW.

- NextJS for frontend and partial backend. (I think I don't need separate API server for this small project)
- Docker image can be deployed to github packages.
- Authentication and Authorization
  - The prototype app doesn't include any access control.
  - I want this project to support both keycloak authentication and aws cognito userpool.
  - but it could be configurable by developer.
  - So, main functionality should be provided to a authenticated user only.
- For Basic UI element, use MUI. and if it is possble, use shadcn/ui
- There is a separate gitops repo.
- Maintain `GITOPS.md` as the deployment contract that the separate GitOps
  repository can reference.
- Include github actions script to build and publish to github packages.
- I will use .env file for defining environment variables
- I want to monitor it with jaeger and kiali. it can be out of scope. but, add and random error generating api endpoint, so that I can observe at jaeger.

## Further questions asked by codex

1. Should authentication use Auth.js with generic OIDC configuration for both
   Keycloak and AWS Cognito?
   - Recommended default: Yes. Select the provider through
     `AUTH_PROVIDER=keycloak|cognito`.
   - Answer: If it supports both keycloak and cognito, and it's simple to maintain. yes.

2. Should the observability test endpoint require authentication?
   - Recommended default: Add `GET /api/debug/random-error`, require
     authentication, disable it unless `ENABLE_DEBUG_ENDPOINTS=true`, and make
     its failure rate configurable.
   - Answer: ok.

3. Should OpenTelemetry instrumentation be included now?
   - A random-error endpoint alone will not provide useful application spans in
     Jaeger.
   - Recommended default: Add OTLP export configured through environment
     variables, but leave Jaeger and Kiali deployment to the GitOps repository.
   - Answer: Yes, I want to test locally with docker compose. and I think I need a single place to configure spans. like wrapping essential functions to be a `span`

4. Should a selected item redirect automatically, as it does in the prototype?
   If so, what should the delay be?
   - Recommended default: Make the delay configurable, default it to 4 seconds,
     and include Stop and Next controls.
   - Answer: Yes Make the delay configurable

5. May the same item be selected twice consecutively?
   - Recommended default: Yes, initially, so the application can remain
     stateless.
   - Answer: yes

6. Which package manager should the project use?
   - Recommended default: npm, matching the prototype.
   - Answer: yes

7. Should Kubernetes manifests be maintained in this repository?
   - Recommended default: No. This repository should provide the Docker image,
     health endpoints, and deployment documentation. Kubernetes manifests
     should remain in the separate GitOps repository.
   - Answer: no, this project should be runnable with `npm run` style and `docker compose up` style
