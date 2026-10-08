---
title: Surveys operations
---

# Surveys operations

For the model and permission boundaries, see [Surveys architecture](./architecture-surveys.md).

## Host setup

Keep `geofarmer-core` and `geofarmer-surveys` as sibling repositories. The Core API
uses a Composer path repository for `geofarmer/surveys`. Install host dependencies
from `geofarmer-core/apps/api`, enable Surveys in the deployment, and review the
upgrade plan:

```sh
composer install
# Set GEOFARMER_MODULES=surveys (or include surveys in the existing module list).
php artisan config:clear
php artisan geofarmer:upgrade --dry-run
php artisan geofarmer:upgrade
```

`SurveysServiceProvider` registers the module, migrations, routes, policies and
commands when enabled. Reference seeding supplies module permissions and roles.
Deployment enablement does not replace portal/channel activation. The module uses
PHP 8.4+, Laravel 12, PostgreSQL and PostGIS.

Development survey data is currently disposable. Schema changes may be made in the
original migrations without conversion migrations. Editing a migration does not
modify a database where it has already run: rebuild disposable development data
or align the local schema deliberately before testing. This is not a production
migration policy.

Build the Angular package from `geofarmer-surveys/dashboard`:

```sh
npm ci
npm run build
```

## Queues and private CSV storage

Run a queue worker using the same application code as the API. The API and worker
must share private Laravel `local` storage. CSV files are not uploaded to S3.

`ExportSurveyResultsCsvJob` reads responses in chunks of 200, writes a temporary
CSV and stores the completed file locally. It includes one row per answer, repeat
paths, original values and available normalized unit values. Empty responses still
receive a row. The requester receives a notification and, if a verified email is
available, an email link.

Export requests are serialized per requester. An active export is reused; a ready
file can be reused for up to one hour when the authorized channel set and response
data have not changed. At most three new exports per requester per hour are
allowed across surveys. Reuse does not consume that allowance.

Signed download links expire after seven days. On database/Redis queues, a delayed
cleanup job removes the file after eight days and marks the export expired. Other
queue drivers need an equivalent cleanup arrangement. The worker job timeout is
540 seconds; the queue's retry interval must exceed it. Export records distinguish
queued, running, ready, failed and expired work.

## Recovering result projections

Pending or failed projection does not mean the canonical response was lost. After
investigating the failure, use the host API command to queue missing projections:

```sh
php artisan surveys:project-responses --form=SURVEY_UUID
```

To explicitly rebuild derived rows for that survey:

```sh
php artisan surveys:project-responses --form=SURVEY_UUID --sync --rebuild
```

`--rebuild` requires `--sync`. There is currently no dashboard rebuild action.
Exports read canonical responses and include records whose projections are pending
or failed.

## Developer verification

From `geofarmer-surveys`:

```sh
npm run test:publication --prefix dashboard
npm run test:xlsform --prefix dashboard
npm run build --prefix dashboard
php api/tests/submission-flags.php
```

The PHP command also runs `review-workflow.php`. It boots the local Core API and
requires its configured PostgreSQL database, the current survey schema, and at
least two existing users and a channel. Test fixtures are rolled back; mail,
notifications and queued jobs are faked. Checks cover moderation, revisions,
aggregate exclusion, complete CSV export, target limits, duplicates, offline
retries, clock tolerance, places and mapped areas.

Passing these checks does not establish full ODK behavior parity. Before closing
the dashboard phase, perform an end-to-end acceptance pass with representative
forms, parent/child channel permissions, version changes, attachment transfer,
moderation and exports. See the [compatibility checklist](./architecture-surveys-compatibility.md).
