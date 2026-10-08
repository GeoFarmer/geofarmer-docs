---
title: Core architecture
---

# Core architecture

Core contains the shared Laravel API, Angular dashboard and GeoFarmer Keycloak
extension. Optional modules live in separate repositories and integrate with Core
at build time. See [modules and delivery](./architecture-modules-and-delivery.md)
and [environments and hosting](./architecture-environments-and-hosting.md) for
platform deployment boundaries.

## API host

`apps/api` is the `geofarmer/core` Composer project. Core classes use the
`GeoFarmer\Core` namespace in `app/`. Optional API modules require that package and
use Composer package discovery; Core providers are registered in
`bootstrap/providers.php`. Core migrations use `database/migrations`, and enabled
modules register their own migration paths. Core factories and seeders use
`Database\Factories` and `Database\Seeders`.

Composer path repositories expect sibling module checkouts such as
`geofarmer-forum/api` and `geofarmer-surveys/api`. The Core compatibility version
in Composer is independent of deployment image versions and build identifiers.
`GEOFARMER_MODULES` selects optional runtime modules; portal/channel activation
is a separate effective-configuration decision.

Authentication is delegated to a standalone OpenID Connect provider. The API
synchronizes local user identities on sign-in and implements domain authorization;
it is not an independent credential or account-login service. The supplied IDP is
a GeoFarmer-specific Keycloak distribution.

## Dashboard host

Domain features live directly under `apps/dashboard/src/app`, including auth,
channels, places, portals, species, species-wiki, layout and shared UI. The root
`src/app.routes.ts` composes routes and `src/app/core.routes.ts` supplies built-in
management routes. `src/app/addons` connects optional modules to host services and
routes. Module packages consume `@geofarmer/dashboard-sdk` from `sdk/`.

Runtime deployment URLs come from `public/config.js`, loaded before Angular starts.
The container generates this file from `GEOFARMER_API_URL`,
`GEOFARMER_OIDC_ISSUER` and `GEOFARMER_DASHBOARD_URL`. Missing required configuration
fails explicitly. The production image serves the built assets through Nginx as
an unprivileged user on port 8080.

Portal branding/build selection is separate from deployment addresses. The
`geofarmer` Angular configuration selects the default GeoFarmer portal; it does
not grant permissions or enable modules for channels.

## Domain references

- [Channel configuration, hierarchy and authorization](./architecture-core-channel-hierarchy.md)
- [Place membership API and synchronization](./architecture-core-place-memberships.md)
- [Geographic reference data](./architecture-core-geographic-data.md)
- [Surveys module](./architecture-surveys.md)

For setup and administration, see [Core local development](./operations-core-development.md)
and [identity provider operations](./operations-core-identity.md).

## Historical diagram sources

These editable diagrams were moved from Core's former `apps/api/.architecture`
directory. They are retained as historical design references, not authoritative
representations of the current schema. Current code, migrations and the domain
references above take precedence.

- [Architecture drawing](pathname:///diagrams/core/geofarmer_architecture.drawio)
- [Entity relationship drawing](pathname:///diagrams/core/geofarmer_er.drawio)
- [Version 1 drawing](pathname:///diagrams/core/geofarmer_V1.drawio)
