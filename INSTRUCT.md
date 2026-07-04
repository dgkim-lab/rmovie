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
- Include github actions script to build and publish to github packages.
- I will use .env file for defining environment variables

## Further questions asked by codex


