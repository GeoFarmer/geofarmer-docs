---
title: Surveys compatibility and remaining work
---

# Surveys compatibility and remaining work

The target is XLSForm interchange and equivalent supported collection behavior.
Preserving a source property is not proof that the answering engine implements it.
The dashboard is primarily an authoring and testing environment; mobile collection
is still planned.

## Current authoring and collection coverage

The builder supports native drafts, XLSForm import/export, independent cloning,
publication checks, groups and repeats, reusable version-owned choice lists,
translations, conditional logic, survey assets and external CSV datasets.

The current answering capability catalog includes text, integer, decimal, range,
single/multiple choices (including external-file variants), rank, date, time,
dateTime, note, calculate, hidden, acknowledge/trigger, barcode, geopoint, geotrace,
geoshape, image, audio, video and file. Support for a base type does not imply
support for every appearance, parameter or expression associated with it.

Drawing, signature and annotation are appearances of an `image` question, not
separate types. The dashboard uses Signature Pad and stores confirmed drawings as
PNG attachments. Annotation can start from a respondent-selected image or a survey
asset referenced by the question's `default` value, including `jr://images/` names.
The dashboard currently requires a confirmed drawing before treating the template
as an answer; unchanged-default behavior still needs parity verification.

## Interchange boundaries

XLSForm import/export handles ordered questions and groups, nested repeats, choice
values and attributes, translated text, media filenames, expressions, defaults,
parameters, settings and retained extra properties/worksheets. Export uses the
active editable draft, including unsaved changes.

Known boundaries:

- Actual media and dataset bytes are not bundled with the exported workbook.
- Excel formatting is not retained; imported formulas export their cached values.
- Unknown source properties can be preserved without being executable.
- Forced-camera appearances, media encoding/resizing parameters, unsupported
  metadata/question types and unsupported expression behavior can block dashboard
  publication. Such forms can remain editable drafts.
- XLSForm export is not ODK compiler validation. Full behavior parity has not been
  established, and direct Central/OpenRosa integration is not implemented.

## Validation boundaries

The builder's Issues tab and publish dialog reuse frontend publication checks.
They cover supported types/settings, expression references, circular dependencies
and other known incompatible behavior. Invalid drafts remain saveable; publication
checks run again before publishing. Runtime answer-dependent conditions and
constraints are evaluated while filling.

These checks are not an API security boundary. The API retains authorization,
request-shape, graph and file-reference checks, but a duplicate full server-side
answering/validation engine is not currently planned.

## Remaining work

| Work | Current state / next step |
| --- | --- |
| ODK verification | Exercise representative forms through import, edits, export and reimport; validate exports with ODK tooling and compare collection behavior. |
| Pending edit review UI | Backend stores and reviews late/conflicting collector edits; dashboard inspection and resolution are missing. |
| Missing attachment flags | Add checks only after an offline-upload grace period; distinguish pending transfer from persistent failure. |
| Dashboard acceptance | Verify channel scope, historical versions, attachments, review/flag lifecycle and full CSV output end to end. |
| Mobile collection | Implement the collector, offline drafts/recovery, asset downloads, upload retries and conflict handling. |

The ODK verification pass should cover nested repeats, relevance, required and
constraint expressions, calculations, defaults, translations, external choice
filters, media and invalid forms. Frontend validation is the current product
choice; adding a mandatory server-side ODK compilation gate is not an agreed task.

## Deferred ideas

- Dashboard answer-draft recovery: not needed for its current testing role.
- AI summaries of free-text answers and additional statistical flagging heuristics.
- Automatic inference of units from unrelated imported numeric/unit questions.
- Direct ODK Collect/OpenRosa or Central integration, if a concrete integration
  requirement arises.
- Separate collection scheduling and finer per-channel inclusion/exclusion rules.

A mobile integration idea is to use ODK external-app appearances on ordinary text
questions to select GeoFarmer places, species or mapped areas. This is not an
implemented contract. Before adopting it, define stable returned IDs, filter and
channel context, offline lookup, cancellation, display-label resolution and
behavior when the required app/platform is unavailable. It must not silently turn
an arbitrary text value into an authorized GeoFarmer reference.

For implementation boundaries, see [architecture](./architecture-surveys.md).
For verification commands, see [operations](./architecture-surveys-operations.md).
