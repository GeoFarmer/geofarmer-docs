---
title: Identity provider operations
---

# Identity provider operations

Paths and commands on this page are relative to `geofarmer-core/apps/idp` unless stated otherwise.
For the whole development environment, see [Core local development](./operations-core-development.md).

The GeoFarmer Keycloak extension belongs to the Core repository. It contains
the custom Java providers, themes, and the initial `geofarmer` realm.

The deployment image is built from this directory. Its multi-stage Dockerfile:

- builds the provider JAR with Maven;
- packages the provider and themes into an optimized Keycloak image;
- embeds the sanitized realm as `/opt/keycloak/data/import/geofarmer-realm.json`;
- imports that realm when Keycloak starts against an empty database.

Use `geofarmer-deployment/targets/local/compose.yaml` to run the complete local
Docker stack. The Compose file in this directory is only for running the IDP
alongside the native Herd API, host PostgreSQL, and Node dashboard. The hosted
preview has its own complete definition under `targets/aws-preview`.

## Local development

Create a `keycloak` database on the local PostgreSQL server and create the
ignored local settings file:

```powershell
Copy-Item .env.example .env
```

Update the database credentials and application secrets in `.env`, then start
the IDP:

```powershell
docker compose up --build
```

Local configuration explicitly sets `GEOFARMER_ALLOW_TEST_OTP=true`. In that
mode, email, SMS, and WhatsApp each generate a random six-digit code, print it
to the IDP output, and verify that exact code. Follow the output with:

```powershell
docker compose logs -f idp
```

The provider itself defaults test OTP mode to disabled. Shared and hosted
environments must set `GEOFARMER_ALLOW_TEST_OTP=false`; missing delivery
credentials then cause delivery to fail instead of enabling a test fallback.

Email, SMS, and WhatsApp are configured as complete account routes rather than
separate login and OTP capabilities:

- `GEOFARMER_EMAIL_ENABLED`
- `GEOFARMER_SMS_ENABLED`
- `GEOFARMER_WHATSAPP_ENABLED`

`PHONE_VERIFICATION_PROVIDER` selects `twilio` (the default) or `aws`. Twilio
Verify supports both SMS and WhatsApp using `TWILIO_ACCOUNT_SID`,
`TWILIO_AUTH_TOKEN`, and `TWILIO_VERIFY_SERVICE_SID`. WhatsApp must also be
enabled for that Verify service and connected to an approved WhatsApp Sender
in the Twilio console.

The AWS adapter uses AWS End User Messaging SMS and currently supports SMS
only. Set `AWS_REGION` and, when required by the AWS account, an
`AWS_SMS_ORIGINATION_IDENTITY` and `AWS_SMS_CONFIGURATION_SET`. The AWS SDK uses
its standard credential chain, so hosted environments should use an instance,
task, or pod role instead of static access keys. Grant that role only
`sms-voice:SendTextMessage`, scoped to the configured origination identity
where possible. With AWS, GeoFarmer generates and verifies the OTP; with Twilio
Verify, Twilio owns the OTP lifecycle.

Disabling email removes email sign-in, registration verification, and email
password recovery together. Phone sign-in remains available when either SMS or
WhatsApp is enabled. Disabled methods are rejected by the provider as well as
hidden from its forms.

OTP email uses Keycloak's realm SMTP provider, so it shares configuration with
Keycloak's built-in mail. The realm baseline reads `SMTP_HOST`, `SMTP_PORT`,
`SMTP_FROM`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_AUTH`, `SMTP_STARTTLS`, and
`SMTP_SSL` from the runtime environment. Keep real credentials out of this
repository; blank values are sufficient for local test-OTP mode.

The container reaches PostgreSQL through `host.docker.internal` and the Herd
API through `geofarmer-api.test`. VS Code's `Local development` launch starts
this Compose service, the API queue listener, and `npm start` for the dashboard;
Herd remains managed independently.
The local IDP and complete preview IDP both default to host port 8080, so run
only one at a time.

The image leaves proxy and transport decisions to its runtime environment. The
local Compose file enables internal HTTP, strict `localhost` hostname handling,
a local single-node cache, and a ten-connection database pool. The hosted
deployment additionally enables `xforwarded` proxy headers because Caddy
terminates TLS. Keycloak's management port `9000` remains container-internal and
is used for health checks only.

An existing realm is not overwritten by `--import-realm`. An intentional reset of the disposable local
`keycloak` database is required for a fresh baseline import; this removes local accounts and realm changes.

## Realm configuration

`realm-export.json` is an initial-state artifact, not a database backup. It may
contain clients, roles, groups, authentication flows, and theme selections. It
must not contain human users or literal secrets. The one retained user is
Keycloak's non-human service account for the `geofarmer-deployment` client.

After replacing the file with a new Keycloak export, sanitize it before
committing:

```powershell
node scripts/sanitize-realm.mjs realm-export.json
```

The sanitizer removes exported human users and provider secrets, restores the
deployment service account's narrow `realm-management` role mapping, and
normalizes its client for service-account-only authentication. It also replaces
the confidential client secrets, dashboard URLs, and every realm SMTP value
with environment placeholders. The deployment must provide:

- `GEOFARMER_IDP_API_CLIENT_SECRET`
- `GEOFARMER_IDP_DEPLOYMENT_CLIENT_SECRET`
- `GEOFARMER_DASHBOARD_URL`
- `GEOFARMER_DASHBOARD_ALT_URL`
- the `SMTP_*` values listed above when email is enabled outside test mode

Keycloak resolves those placeholders during the first realm import. Startup
import skips a realm that already exists, so changing this JSON does not update
an existing environment. For local development, reset only the disposable local Keycloak database to
import a new baseline or apply the change in the admin console. The AWS preview
deployment reconciles the SMTP map, confidential API client secret, and
dashboard client URLs after startup. It authenticates as the realm-local
`geofarmer-deployment` service account, which has only `manage-realm` and
`manage-clients`; human administrator credentials are not used by automation.
Broader changes in long-lived environments will need explicit, versioned realm
migrations rather than database wipes.

## Build the image directly

From this directory:

```powershell
docker build -t geofarmer-idp:internal-full-local .
```

The complete preview workflow builds it through the deployment repository.
