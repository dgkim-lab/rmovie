# Setup

Use either Keycloak or Cognito. Both use the same `.env` variable names; only
the provider, issuer, client credentials, and registered callback differ.

## 1. Google Sheets

1. Enable the Google Sheets API in a Google Cloud project.
2. Create a service account and a JSON key named `credentials.json`.
3. Open the JSON and copy its `client_email` value.
4. Share the spreadsheet with that email as a Viewer.
5. Put these values in `.env`:

```dotenv
GOOGLE_SHEETS_SPREADSHEET_ID=the-id-between-d-and-edit-in-the-sheet-url
GOOGLE_SHEETS_RANGE=Sheet1!A:Z
GOOGLE_CREDENTIALS_FILE=credentials.json
```

The first row of the range must contain `name` and `url`. The file is ignored
by Git and must never be committed.

## 2A. Keycloak

In the Keycloak administration console:

1. Create or select a realm, for example `rmovie`.
2. Create an OpenID Connect client with client ID `rmovie`.
3. Enable **Client authentication** and **Standard flow**. Disable flows the
   application does not use.
4. Add this exact development redirect URI:
   `http://localhost:3000/api/auth/callback/keycloak`.
5. For production, add
   `https://rmovie.example.com/api/auth/callback/keycloak` using the real host.
6. Add `http://localhost:3000/login` and the equivalent production URL to
   **Valid post logout redirect URIs**.
7. Copy the client secret from the client's Credentials tab.
8. Create a realm user and set a non-temporary password for testing.

Configure `.env`:

```dotenv
AUTH_PROVIDER=keycloak
AUTH_ISSUER=http://localhost:8080/realms/rmovie
AUTH_CLIENT_ID=rmovie
AUTH_CLIENT_SECRET=the-keycloak-client-secret
AUTH_SCOPES=openid
AUTH_SECRET=replace-with-output-from-openssl-rand-base64-32
AUTH_URL=http://localhost:3000
AUTH_TRUST_HOST=true
```

`AUTH_ISSUER` is the realm URL, not the administration-console URL. Confirm it
by opening `${AUTH_ISSUER}/.well-known/openid-configuration`.
The application derives the account console as `${AUTH_ISSUER}/account` and
the logout endpoint from the issuer. Both may be overridden with
`AUTH_ACCOUNT_URL` and `AUTH_LOGOUT_URL`.

## 2B. Amazon Cognito

In the Cognito console:

1. Create or select a user pool.
2. Configure a user-pool domain so Cognito can provide its managed login page.
3. Create an app client for a traditional server-rendered web application and
   generate a client secret.
4. Enable the authorization-code grant and the `openid` scope. The application
   does not require `email` or `profile` by default.
5. Add `http://localhost:3000/api/auth/callback/cognito` as an allowed callback
   URL. Add the equivalent HTTPS production URL separately.
6. Add `http://localhost:3000/login` and its production equivalent as allowed
   sign-out URLs.
7. Select the Cognito user pool as an identity provider for the app client and
   create a test user.

Configure `.env`:

```dotenv
AUTH_PROVIDER=cognito
AUTH_ISSUER=https://cognito-idp.ap-northeast-2.amazonaws.com/ap-northeast-2_POOLID
AUTH_CLIENT_ID=the-cognito-app-client-id
AUTH_CLIENT_SECRET=the-cognito-app-client-secret
AUTH_SCOPES=openid
AUTH_SECRET=replace-with-output-from-openssl-rand-base64-32
AUTH_URL=http://localhost:3000
AUTH_TRUST_HOST=true
AUTH_LOGOUT_URL=https://your-domain.auth.ap-northeast-2.amazoncognito.com/logout
# Optional: Cognito has no built-in general account console.
# AUTH_ACCOUNT_URL=https://your-application.example/account
```

Replace the region and user-pool ID in `AUTH_ISSUER`. This is the user-pool
issuer; it is not the Cognito managed-login domain. Cognito accepts HTTP only
for localhost testing; production callbacks must use HTTPS.

`AUTH_LOGOUT_URL` uses the domain configured under Cognito **Branding > Domain**,
not `AUTH_ISSUER`. Cognito has no Keycloak-style account console, so the Manage
account link appears only if `AUTH_ACCOUNT_URL` points to a page supplied by
your application or another account-management system.

## 3. Run locally

Create the session secret and complete the environment file:

```bash
cp .env.example .env
openssl rand -base64 32
npm install
npm run dev
```

Open <http://localhost:3000>. Alternatively, after creating both `.env` and
`credentials.json`, run:

```bash
docker compose up --build
```

The application is on port 3000 and Jaeger is on port 16686.

## 4. Argo CD and GitOps credentials

Do not commit `credentials.json`, a plaintext Kubernetes Secret, or a base64
copy of the key. Argo CD should deploy a reference to a secret managed outside
Git, preferably through the cluster's existing external-secret or sealed-secret
solution.

For a simple initial deployment, create the Secret directly in the target
cluster (this Secret is intentionally not managed by Argo CD):

```bash
kubectl -n rmovie create secret generic rmovie-secrets \
  --from-literal=AUTH_CLIENT_ID='rmovie' \
  --from-literal=AUTH_CLIENT_SECRET='replace-me' \
  --from-literal=AUTH_SECRET='replace-me' \
  --from-file=google-service-account.json=credentials.json
```

The GitOps Deployment should consume the authentication values and mount the
Google key:

```yaml
env:
  - name: AUTH_CLIENT_ID
    valueFrom:
      secretKeyRef: { name: rmovie-secrets, key: AUTH_CLIENT_ID }
  - name: AUTH_CLIENT_SECRET
    valueFrom:
      secretKeyRef: { name: rmovie-secrets, key: AUTH_CLIENT_SECRET }
  - name: AUTH_SECRET
    valueFrom:
      secretKeyRef: { name: rmovie-secrets, key: AUTH_SECRET }
  - name: GOOGLE_CREDENTIALS_FILE
    value: /var/run/secrets/rmovie/google-service-account.json
volumeMounts:
  - name: google-service-account
    mountPath: /var/run/secrets/rmovie
    readOnly: true
volumes:
  - name: google-service-account
    secret:
      secretName: rmovie-secrets
      items:
        - key: google-service-account.json
          path: google-service-account.json
```

Keep `AUTH_PROVIDER`, `AUTH_ISSUER`, `AUTH_URL`, spreadsheet ID/range, and
telemetry settings in a ConfigMap. Set `AUTH_URL` to the public HTTPS ingress
URL, and register its matching callback with Keycloak or Cognito. See
[GITOPS.md](GITOPS.md) for the complete runtime contract.
