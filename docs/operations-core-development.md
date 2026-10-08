---
title: Core local development
---

# Core local development

The normal development workflow serves the API natively with Laravel Herd, uses
local PostgreSQL/PostGIS, runs the Angular dashboard with Node, and containerizes
only Keycloak. A full container stack is a separate workflow owned by
`geofarmer-deployment`. See [environments and hosting](./architecture-environments-and-hosting.md).

## Workspace and prerequisites

Check out `geofarmer-core`, `geofarmer-forum` and `geofarmer-surveys` as sibling
repositories. The API uses Composer path dependencies for the module packages.
Use PHP 8.4 with Laravel's required extensions, Composer, Node/npm, PostgreSQL with
PostGIS, and Docker for the supplied identity provider. Dependency manifests and
`.env.example` files remain the source for exact application requirements.

## API

From `geofarmer-core/apps/api`:

```sh
composer install
npm install
cp .env.example .env
php artisan key:generate
```

Configure the database and OIDC settings in the new `.env`. The standard local
identity-provider addresses are:

```dotenv
OIDC_ISSUER=http://localhost:8080/realms/geofarmer
OIDC_JWKS_URL=http://localhost:8080/realms/geofarmer/protocol/openid-connect/certs
OIDC_ACCOUNT_URL=http://localhost:8080/realms/geofarmer/account
GEOFARMER_MODULES=forum,surveys
```

The issuer must be reachable and match token issuers exactly. Do not overwrite an
existing local `.env` when repeating setup. Module code must be installed before
it is enabled; Core is always included. Then run:

```sh
php artisan config:clear
php artisan geofarmer:upgrade --dry-run
php artisan geofarmer:upgrade
```

The upgrade command applies migrations and reference seeders for enabled modules.
Use `--example-data` when sample data is wanted. `--fresh --example-data` rebuilds
all tables and destroys existing data; use it only for an intentional disposable
local reset. Editing an already-run migration does not itself update the database.
Portal and channel activation are configured separately from deployment enablement.

Serve the API with Herd. Alternatively, `composer run dev` starts the bundled
API development server, queue listener, logs and Vite processes. `npm run build`
builds API-hosted frontend assets. `.env.example` documents database/cache, OIDC,
storage, AI-provider and Octane/RoadRunner integration settings.

## Dashboard

From `geofarmer-core/apps/dashboard`:

```sh
npm install
npm start
```

Open `http://localhost:4200`. The checked-in `public/config.js` development settings
use `https://geofarmer-api.test/api`, issuer
`http://localhost:8080/realms/geofarmer`, and client `geofarmer-dashboard`. Configure
the Keycloak client's redirect URLs to match the dashboard, and use the same realm
for API token verification.

`npm run build:sdk` builds the host SDK; the start/build scripts invoke it through
npm lifecycle hooks. The production bundle is built with `npm run build`.

## Identity provider and combined startup

Follow [identity provider operations](./operations-core-identity.md) to create the
local Keycloak database and configure `apps/idp/.env`. Then, from `apps/idp`:

```sh
docker compose up --build
```

The container reaches the host database through `host.docker.internal` and the
Herd API through `geofarmer-api.test`. In VS Code, the repository's **Local
development** launch starts the dashboard, API queue listener and IDP together;
Herd remains independently managed.

Do not run the full preview IDP and local IDP on the same default port 8080 at the
same time. `geofarmer-deployment/targets/local/compose.yaml` owns the full local
container stack, with the dashboard at `http://localhost:8082`.
`targets/aws-preview/compose.yaml` owns the hosted internal preview. The IDP-only
Compose file is not a complete deployment stack.

## Bootstrap administrator access

Have the intended administrator sign in through the identity provider once so
the API has synchronized their user identity. From `apps/api`:

```sh
php artisan geofarmer:bootstrap-admin --email=admin@example.com --dry-run
php artisan geofarmer:bootstrap-admin --email=admin@example.com
```

Use `--help` to inspect portal and role options. This assigns authorization to an
existing identity; it does not create credentials in the identity provider.

## Development commands

| Directory | Command | Purpose |
| --- | --- | --- |
| `apps/api` | `composer test` | Existing backend test suite |
| `apps/api` | `vendor/bin/pint` | PHP formatting |
| `apps/dashboard` | `npm test` | Existing Angular tests |
| `apps/dashboard` | `npm run watch` | Development bundle watch |
| `apps/dashboard` | `npm run format` | JavaScript, TypeScript and HTML formatting |
| `apps/idp` | `docker compose logs -f idp` | Identity-provider logs |

Application Dockerfiles build images; source selection, image publication and
complete-stack deployment are owned by the deployment repository.
