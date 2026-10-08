---
title: Core channel hierarchy
---

# Channel hierarchy inheritance standard

For dashboard guidance, see [channel settings](./usage-core-channel-settings.md).
Module-specific distribution of published definitions, such as [Surveys](./architecture-surveys.md), is separate from ownership of Core records.

This document is the source of truth for hierarchy-aware configuration and channel-owned data in the API and dashboard. Module-specific work should use the shared contracts described here instead of defining its own inheritance behavior.

## Core invariants

- Configuration flows from broader to more specific scopes: system defaults, portal defaults, root channel, each intermediate ancestor, and finally the target channel.
- Data never inherits. A record keeps its owning `channel_id` for its entire lifetime unless an explicit transfer workflow is designed for that record type.
- A parent can act on data in its subtree only when the actor has the required permission for the owning channel. Hierarchy position alone is not authorization.
- A descendant cannot read or mutate ancestor or sibling data through hierarchy access.
- Mutations use the owning channel in the route and authorization context. Acting from a parent must not rewrite the record's owner.
- Permission grants flow downward independently of configuration. Effective permissions are the union of applicable portal and ancestor grants; ordinary child configuration cannot subtract an ancestor grant.

## Configuration categories

Every hierarchy-aware namespace, and exceptional fields within it, must declare one of these categories before it is integrated.

| Category | Behavior |
| --- | --- |
| `inherited` | Live layered configuration. A more specific layer may override a value unless an upstream source locks its path. |
| `governed` | Live layered configuration with one or more paths locked by the governing source. Conflicting descendant overrides are invalid rather than silently ignored. |
| `local` | Only system/portal defaults and the target channel participate. Ancestor channel layers are excluded. |
| `forked` | Authored or curated content is copied/forked explicitly and has no live inheritance relationship after the copy. It is not processed by the effective-config resolver. |

The PHP enum is `GeoFarmer\Core\Configuration\ConfigurationCategory`; the dashboard uses the matching string union. A namespace can be broadly `inherited` while declaring selected JSON Pointer paths as governed.

## Resolution and merge semantics

The backend is authoritative. Layers are passed to `EffectiveConfigurationResolver` from broadest to most specific.

1. System defaults are required to provide a valid baseline where the namespace has defaults.
2. Portal overrides apply next.
3. Channel layers apply root-first, with the target channel last. The closure-table query must order by `channel_closure.depth DESC` for a target channel.
4. JSON objects merge recursively.
5. Lists replace as a whole; list items are never merged by index or identity.
6. Scalars, booleans, and explicit `null` replace the previous value.
7. A missing key means “inherit.” Reset-to-inherited removes the key from the stored override; it does not write `null`.
8. `false`, `0`, an empty string when valid, and an empty list are explicit overrides and must not be treated as missing.

Each stored layer must be validated as a JSON object. Configuration keys may contain `/` or `~`; provenance and locks therefore use RFC 6901 JSON Pointers rather than dot notation.

## Governance locks

A per-parent lock mechanism is part of the provisional foundation, not yet a final product decision. Its usefulness and persistence model must be reassessed during the first real module integrations.

A layer can declare JSON Pointer paths that subsequent layers may not override. The locking layer's own values are applied before its locks take effect, so a governing channel can define a value and lock it for descendants.

A lock covers the named value and its descendants. Replacing a parent branch that contains a locked descendant is also invalid. Persisted conflicting overrides raise `LockedConfigurationOverrideException`; they are not ignored. Write endpoints should prevent these conflicts during validation, while the resolver remains a final consistency guard for stale data or hierarchy moves.

Moving a subtree can introduce a new lock conflict. The move workflow must pre-resolve affected namespaces inside the transaction and reject the move with a validation error until conflicting local overrides are reset or deliberately migrated.

## Effective configuration contract

`EffectiveConfiguration` serializes a resolved document and leaf-level provenance:

```json
{
  "config": {
    "topics": {
      "enabled": false
    }
  },
  "provenance": {
    "/topics/enabled": {
      "source": {
        "type": "channel",
        "id": "a-channel-uuid"
      },
      "inherited": true,
      "locked": true,
      "lock_source": {
        "type": "channel",
        "id": "a-channel-uuid"
      }
    }
  }
}
```

`source.type` is `system`, `portal`, or `channel`; the system source has a null ID. `inherited` is relative to the requested target channel. `locked` means the target channel cannot override the value. A lock declared by the target is included as `lock_source` but is not locked for the target itself; it governs descendants.

Controllers must redact a source channel ID when the caller cannot view that source. A redacted source keeps its type, uses a null ID, and must not expose a name or link. Effective values still apply even when their source is not visible.

Module endpoints should keep stored and resolved state distinct. The standard response names are:

- `config_override`: the target channel's stored sparse override, or null;
- `effective_config`: the `EffectiveConfiguration` payload;
- `effective_enabled`: whether the module is active for the target channel;
- `inherited_enabled`: the activation that would apply without the target channel's override;
- activation provenance is separate from configuration provenance because module activation has `inherit`, `enabled`, and `disabled` states.

## Authorization and channel context

- Resolve the owning channel from the route and require every loaded record to match it. Nested route binding or an explicit ownership assertion is mandatory.
- Authorize the requested action against the owning channel. The existing effective-permission resolver supplies grants inherited from ancestors.
- For subtree listings, first authorize access from the governing channel, then restrict returned records to descendant channels for which the relevant permission is effective. Do not interpret subtree membership as a blanket grant.
- Use the closure table for ancestor/descendant checks. Avoid recursive per-record queries and in-memory tree walks.
- Portal scope, soft-delete state, channel visibility, and archived-state rules remain applicable to every hierarchy query.
- Parent-initiated writes remain audited against the record's concrete owning channel; ancestor visibility is resolved through the channel closure.

## Core channel decisions

The base channel fields are local rather than inherited: slug, name and translations, description and translations, cover image, access, child capacity, geometry, and assigned tags. `parent_channel_id` defines hierarchy position and is never resolved as configuration. The former untyped `channels.configs` JSON bag and the coarse `is_community` flag are intentionally removed; operational capabilities are represented by effective modules instead.

Channel languages use overrideable live inheritance. Rows in `channel_language` are sparse local overrides with an `enabled` or `disabled` state; an absent row means inherit. For each language, the nearest override on the target-to-root path wins. A child can therefore add a language, disable an inherited language, re-enable a language disabled by an ancestor, or remove its local row to reset to inherited. API channel responses expose the stored rows as `language_overrides`, the active set as `effective_languages`, and the nearest state/source as `language_provenance` keyed by language ID.

Tags have two distinct local concepts. A tag definition is owned either by the portal (`channel_id` is null) or by one channel. A channel may be assigned portal-global definitions and definitions owned by that same channel. Neither channel-owned definitions nor channel tag assignments inherit. A parent administrator can manage a descendant's tags only through authorization for that owning descendant channel.

## Module activation and configuration

`modules.is_active` controls whether code installed in the application is globally available. `modules.default_enabled` is the system activation default. Portal and channel overrides use `inherit`, `enabled`, or `disabled`; the nearest explicit override wins. An `inherit` row does not become an activation source. Channel-module rows are not soft-deleted because reset-to-inherited and explicit disablement are different states.

Module configuration uses `default_config`, an optional sparse portal override, and sparse channel overrides ordered from root to target. The shared effective-configuration resolver supplies values and leaf provenance. Activation provenance remains separate. Resetting an entire module removes the target channel row; resetting only configuration or a nested setting removes its stored override without changing activation.

Channel memberships and places are built-in Core configuration modules, not separate Composer or frontend packages. Disabling memberships prevents new admission and acceptance while retaining existing membership records and their authorization identity. Disabling places prevents operational mutations while retaining existing data. Every operation checks the effective state of the record's owning channel.

## Module-owned custom fields

Custom-field schemas live below a module's `custom_fields` configuration object, keyed by an immutable field key. Every schema is owned by the channel where it is created. Descendants inherit that complete schema unchanged: they cannot override, disable, or delete it, but may add fields of their own. An owning channel may update or disable its fields, and those changes govern the entire descendant subtree. Select options follow the same stable-key rule.

There is deliberately no global custom-field catalogue or separate schema HTTP resource. Clients read schemas from the module's effective configuration and manage locally owned schemas through the channel-module configuration endpoint. Module-owned validation rejects attempts to override inherited schemas before configuration is persisted.

Custom-field values remain relational data owned by the related record's channel. A value is identified by `module_key`, `field_key`, relation type, and relation ID. Writes resolve the owning channel's effective module configuration, reject disabled or unknown fields, validate required/type/option constraints, and preserve values when a schema or module is disabled. The former definition, channel-definition, option, and option-override tables are removed.

## Channel memberships and subtree batches

Memberships and their custom values remain owned by exactly one channel. Linked profiles are editable by their owning user, limited to fields whose effective schema is `user_editable`; membership managers may create and edit guest profiles. An inherited management grant allows the same operation in a descendant, but the mutation still uses that descendant as the owning channel.

The channel in a batch route is the governing subtree context rather than the owner of every row. New guest-profile rows carry an explicit `channel_id`. Existing-record batches submit membership IDs, and the server derives each owning channel from the records instead of trusting a duplicated client value. Before mutation, the server requires every owner to be inside the route channel's closure, authorizes the action against every owner, and resolves module configuration and custom-field validation per owner.

Role assignments created from a parent context retain the membership's owning channel as `grant_scope_id`. A common role batch may use system roles across multiple owning channels; a channel-owned custom role is valid only when every affected membership belongs to that role's owner channel. Membership-card issuance and bulk printing are intentionally handled by their own work package because cards are security credentials, not ordinary membership profile data.

## Access roles, permissions, and MFA

Permissions are additive grants, not configuration. A channel's effective permissions are the union of applicable portal grants and grants at the channel or any active ancestor. There are no child-level deny assignments, so a descendant cannot weaken an ancestor's governance. The effective-permission snapshot and runtime policy checks use the same active ancestor chain and exclude archived ancestors.

System roles are reusable at every matching scope. A custom channel role remains owned by one channel and is assigned only within that channel; an authorized ancestor administrator manages it by explicitly targeting the owning child channel. Assignments retain their concrete `grant_scope_id`, and hierarchy inheritance is resolved when permissions are checked rather than by copying assignments into descendants.

MFA is required when any active role assignment grants an enabled permission marked `requires_mfa`. Role composition changes, assignment or revocation, and membership activation changes refresh the affected user's stored MFA requirement. The dashboard reloads its effective-permission snapshot after role or assignment mutations so navigation and action visibility do not retain stale grants.

## Places and place groups

Places and place groups are local data owned by exactly one channel; neither record type is inherited or copied into descendants. An authorized parent listing may aggregate records from its subtree, but detail views and mutations use the owning channel in the route. Parent-level batch creation is the exception at the transport layer: the route channel is the governing subtree context, each row supplies its target `channel_id`, and the server validates subtree membership, permission, effective module activation, and custom values against that target before creating the record.

Place groups are likewise visible in aggregate to an authorized parent but remain local to their owner. A group can contain only places owned by the same channel, and assignment requests are made in that channel's context. A mixed-channel place selection must be split by owner before group assignment. The separate place membership/access model is intentionally deferred to its own work package and is not part of these hierarchy semantics.

## Forum configuration and channel-owned discussions

Forum activation and settings use the shared module resolver. System defaults, portal overrides, and root-to-target channel overrides produce the effective configuration used by every Forum policy and mutation. Clearing a local setting restores the inherited effective value; disabling the module blocks operational mutations without deleting existing discussions.

Forum topics, posts, replies, polls, options, votes, reactions, flags, and their membership statistics remain local to one owning channel. Threads and their dependent records cannot cross channel boundaries. Ordinary members browse only the forum of their active channel because member visibility, role restrictions, reactions, and voting depend on a membership in that exact channel. A user with an effective Forum moderation grant at a governing channel may receive an aggregate post and flag view across its active subtree. Aggregate responses expose each post's owning channel, and links and mutations switch to that channel's route context. Topics remain channel-local even in a parent moderation view so composing or editing a post cannot attach a descendant's topic to another channel's post.

Managing Forum module configuration and moderating Forum content are separate permissions. Inherited configuration-management permission allows an administrator to configure a child through the child's module route; it does not grant moderation. Inherited Forum moderation permission allows content governance in descendants, while participation actions such as posting as a member, reacting, flagging, and voting still require an active membership in the owning channel where required by Forum policy.

Creating or updating a channel persists its local language and tag selections in the same transaction as the channel. Hierarchy moves immediately change effective languages because resolution reads the closure table; no copied rows require synchronization. Archiving a channel is allowed only after active direct children have been moved or archived, and restoration revalidates the active parent and its child capacity.

## Species activation, configuration, and authored content

The portal catalogue keeps species naming deliberately compact. `scientific_name` is the stable identity, while `name` and `name_i18n` provide the preferred display name. Additional unstructured names live in the species `aliases` JSONB array; aliases have no language or category metadata and are treated as searchable values within the species synchronization aggregate. A generated, GIN-indexed PostgreSQL `tsvector` combines scientific name, preferred names, translations, aliases, and slug. Varieties use the same preferred `name` and `name_i18n` fields and an equivalent search vector, but do not maintain a separate alias collection.

Species and variety activation is inherited live. The system baseline is disabled, and each channel may store `inherit`, `enabled`, or `disabled`; the nearest explicit channel state wins. A descendant can therefore disable an inherited catalogue entry, re-enable one disabled by an ancestor, enable a newly published portal entry, or remove its local state to resume inheritance. A variety is effectively available only while both it and its parent species are published and effectively enabled.

The `channel_species` and `channel_species_variants` rows are sparse channel layers. Local display names remain explicit `name_override` and `name_override_i18n` columns so they use the shared i18n model trait. The resolver converts those columns into an in-memory name document only while calculating the effective value and provenance; names are not persisted as nested configuration JSON. API responses expose the stored name columns and `activation_override` separately from `effective_enabled`, `activation_source`, and the computed `effective_config`. Empty `inherit` rows are soft-deleted rather than physically removed, and later writes restore the same row, preserving tombstones for offline synchronization.

Species activation and names are overrideable rather than governed: descendants are intentionally allowed to disable, re-enable, and rename inherited entries. Species rows therefore do not store `locked_paths`, and hierarchy moves require no species-specific conflict scan. The shared lock mechanism remains available to configuration namespaces with an actual governance requirement. Catalogue draft, review, archived, merged, and soft-deleted records cannot be made effectively available even if a stale channel override says enabled.

Species articles and restoration/agriculture profiles are authored data, so they never live-inherit. Portal content may be explicitly forked into a channel; the copy is an independent local record with source ID and fork timestamp provenance. Editing or deleting either side does not mutate the other. Article reads and writes use the concrete portal or channel owner scope, and local article operations additionally require the species or variety to be effectively enabled. Profile tables use the same normalized portal/channel and species/variety scopes with fork lineage; their domain fields and editing endpoints remain deferred until those profile schemas are defined.

Species sets are reusable selection snapshots, not configuration layers. A set belongs to the portal or one channel and contains species and variety IDs. A public channel-owned set can be discovered and applied by otherwise unrelated channels in the same portal; private sets remain visible only in their owning context. Sharing cannot cross portals because set membership references the portal's species catalogue. Applying a set once writes ordinary `enabled` overrides to the target channel. The caller explicitly chooses whether direct local activation rows are overwritten or skipped. Applying a set never disables entries absent from the set, never copies articles or profile data, and creates no dependency on future set changes. Set membership and removal use soft-delete tombstones.

## Caching approach

The pure resolver does not read from or write to the cache. Each integrated namespace may cache its final `EffectiveConfiguration` using a key containing the namespace, portal ID, and target channel ID. Authorization and source redaction happen after retrieving the permission-independent cached value.

Invalidation is explicit and subtree-aware:

- changing system or portal defaults invalidates that namespace for every affected portal channel;
- changing a channel override or lock invalidates that namespace for the channel and all descendants, including self (`depth >= 0`);
- moving a channel invalidates every inherited namespace for the entire moved subtree;
- resetting or explicitly disabling a setting follows the same invalidation path as any other update.

The namespace integration owns its cache key and invalidator so writes cannot forget a generic hidden cache. Production should use a shared cache suitable for Octane workers; request-local or process-local static caches must not be the source of truth. Cache failures must fall back to resolution, never to stale configuration.

## Integration checklist

Before a module or core setting is considered hierarchy-aware, it must declare:

1. its configuration category and system/portal defaults;
2. its sparse override schema and validator;
3. its ordered layer provider and any governed JSON Pointer paths;
4. reset-to-inherited and explicit-disable behavior;
5. its effective response and provenance exposure/redaction rules;
6. its cache namespace and all invalidation triggers;
7. data ownership, subtree read scope, owning-channel mutation checks, and audit context;
8. hierarchy-move validation for locks and other module invariants.

The shared resolver deliberately does not infer these decisions from database shape. A table having `channel_id` does not make its records inherited, and a JSON column does not imply that every key is overrideable.
