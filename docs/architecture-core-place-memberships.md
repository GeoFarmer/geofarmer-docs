---
title: Core place memberships API
---

# Place memberships API

For dashboard workflows, see [managing place memberships](./usage-core-place-memberships.md).

All routes below are under `/api`, require authentication and the normal `X-Portal`
header, and use UUIDs. A place belongs to one channel. Its members reference
`channel_memberships` in that same channel, enforced by composite foreign keys.
Guests have `channel_memberships.user_id = null`; there is no separate guest role
or copy of their profile on a place membership.

## Roles and authorization

There are exactly two system roles with `grant_scope_type = place`:

| Key | Permissions |
| --- | --- |
| `place_manager` | `places.update`, `places.delete`, `places.memberships.manage` |
| `place_content_manager` | `places.content.manage` |

Multiple roles can be assigned together. An omitted `access_role_ids` defaults to
the content role on ordinary membership creation. Empty role selections are
rejected. Membership itself permits viewing the place; editing, deleting and
managing its content depend on the selected roles. `created_by` grants no access.

`places.memberships.manage` permits invitations, direct assignments, guest
registration, reviewing requests, removing members and changing their roles.
It can be granted at place, channel or portal scope. It does not permit editing
role definitions or administering arbitrary channel profiles.

Channel role administrators can create additional place roles through
`POST /access-roles` with `grant_scope_type: "place"`, `owner_type: "channel"`
and `owner_id: <channel UUID>`. Existing role update/delete APIs use the same
context. Only permissions supporting place scope are accepted. There is no
place-owned role editor and no per-role delegation matrix.

Assignments use `assignee_type: "place_membership"`, the place membership UUID as
`assignee_id`, and that membership's place UUID as `grant_scope_id`. Both the
generic assignment API and membership role editing support this model. Pending
memberships may hold selected role assignments, but those assignments grant no
access until both the place membership and channel membership are active.
Deleted places or memberships grant no membership-based access. These checks also
apply to `/me/permissions` snapshots and MFA requirement calculation.

## Creation and mobile synchronization

`PUT /channels/{channel}/places/{client-generated-place-uuid}` creates a place
without adding the caller as a member. Batch place creation behaves the same way.

Mobile clients can explicitly include the membership they created locally:

```json
{
  "name": "North farm",
  "geometry": { "type": "Point", "coordinates": [-74.1, 4.6] },
  "creator_membership": {
    "id": "<client-generated-membership-uuid>",
    "access_role_ids": ["<place-manager-role-uuid>", "<content-role-uuid>"]
  }
}
```

The caller must have an active membership in the channel. The place and creator
membership commit atomically, including custom fields and role assignments.
Creator role selection is limited to the two system defaults; omitting the role
list selects both. No membership is inferred from the client type or user agent.
The response includes `creator_membership` and its active role assignments.

A repeated create with the same place and creator membership IDs returns the
existing records without changing them. Later place edits omit
`creator_membership` and require `places.update`. An existing place cannot be used
to bootstrap a new creator membership. Batch place creation rejects
`creator_membership`.

Local membership state is provisional until the server accepts synchronization.
Client-generated IDs are supported on all membership creation actions. Reusing
an ID for another association returns 409. If a person already has a membership
at a place, use that membership's ID. Retrying a creation does not reset accepted
or closed memberships or overwrite their roles.

## Discovery and reading

| Method and route | Purpose |
| --- | --- |
| `GET /channels/{channel}/places/discover` | Minimal place directory for join requests: ID, channel ID, name, code |
| `GET /channels/{channel}/places/roles` | Two default roles and channel-owned custom place roles; usable before creating a place |
| `GET /channels/{channel}/place-memberships` | Caller's own memberships, including pending invitations and closed associations |
| `GET /channels/{channel}/places/{place}/memberships` | Membership inbox/list for authorized place managers |
| `GET /channels/{channel}/places/{place}/memberships/candidates` | Minimal active channel profile directory for managers |
| `GET /channels/{channel}/places/{place}/memberships/{membership}` | A membership visible to its account holder or a place manager |

Lists are paginated (`page`, `per_page`, maximum 100). Membership lists support
`status` and inclusive `updated_since` filters, ordered by update time and ID.
Discovery and candidates support `search`; candidates additionally support
`has_user`. Candidates return ID, display name, avatar and optional user ID, not
contact information or profile custom fields. Discovery does not expose geometry.

Membership responses include the minimal channel profile and place, plus
`access_role_assignments` with role definitions and permissions. Active assignment
records on a pending membership describe the proposed roles, not effective access.
The generic `/access-role-assignments/users` directory rejects place scope; use
the candidates endpoint instead.

## Membership creation

The following routes share the prefix
`/channels/{channel}/places/{place}/memberships`:

| POST suffix | Payload | Initial status |
| --- | --- | --- |
| `/request` | Optional client `id`; target is always the caller's channel membership | `requested` |
| `/invite` | `channel_membership_id`, optional `id`, optional `access_role_ids` | `invited` |
| `/assign` | `channel_membership_id`, optional `id`, optional `access_role_ids` | `active` |
| `/guests` | `guest`, optional membership `id`, optional `access_role_ids` | `active` |

Every target must be an active member of the place's channel. Join requests cannot
set their own roles. Invitations require an account-linked profile. Authorized
managers can directly assign either guests or account-linked profiles without
acceptance. Assigning an existing pending membership activates it explicitly;
ordinary invite/request retries preserve its state.

`guest` contains a required client-generated `id` and `display_name`, and optional
`avatar_url` and `custom_field_values`. Its ID is the **channel membership** ID;
the outer ID is the **place membership** ID. Guest registration and assignment
commit together. Replaying the same operation does not duplicate or overwrite
the guest, including if the guest has since claimed their account. Existing
profiles are added through `/assign`. Claiming a profile retains its place links.

Creation returns 201; retries and changes to existing associations return 200.
The response is the resulting membership, so clients must inspect its status.

## Decisions and removal

POST to `.../memberships/{membership}/{action}`:

| Action | Required actor | Transition |
| --- | --- | --- |
| `accept` | Invited account holder | invited → active |
| `decline` | Invited account holder | invited → closed, declined |
| `approve` | Place membership manager | requested → active |
| `reject` | Place membership manager | requested → closed, rejected |
| `withdraw` | Requesting account holder | requested → closed, withdrawn |
| `cancel` | Place membership manager | invited → closed, cancelled |
| `leave` | Member's account holder | active → closed, left |
| `remove` | Place membership manager | active → closed, removed |

An optional `reason` is limited to 255 characters. Approval can also select
`access_role_ids`; acceptance cannot change the invitation's roles. Repeated
decisions already reflected by the membership are harmless. Invalid transitions
return 409; unauthorized decisions return 403. Closing revokes role assignments
and retains the membership record and audit history.

To reopen a closed association, use request/invite/assign with the existing `id`,
`reopen: true` and `expected_updated_at` from the latest membership response.
The server rejects stale versions. Reopening selects fresh roles through the
normal rules; it never restores old revoked grants implicitly.

`PATCH .../memberships/{membership}/roles` accepts a required, nonempty
`access_role_ids` list and replaces the selection. Generic assignment creation
and deletion can add/remove individual roles but cannot remove the final role.

## Batch assignment

`POST /channels/{channel}/places/memberships/batch` accepts up to 500 rows:

```json
{
  "memberships": [
    {
      "id": "<optional-client-membership-uuid>",
      "place_id": "<place-uuid>",
      "channel_membership_id": "<channel-membership-uuid>",
      "access_role_ids": ["<role-uuid>"]
    }
  ]
}
```

Places may belong to the context channel or its descendants. Each target profile
must belong to its place's exact channel. Management permission is checked for
each place. Each row commits independently. Responses contain `total_count`,
`success_count`, `failure_count`, `memberships` (index and resulting membership)
and `failures` (index, HTTP-style status and errors). Use IDs when retrying imports.

Rows may set `action: "remove"` instead of the default `"assign"`. Removal requires
the existing membership `id` and `expected_updated_at`. It closes the membership
and revokes its roles, preserving the channel profile and membership history.
Stale removals return 409; retries of an already removed membership are harmless.
Assignment rows can reopen a closed membership using `reopen: true` and its
latest `expected_updated_at`, as with the single-place endpoint.

`POST /channels/{channel}/places/memberships/candidates` accepts `place_ids`
(up to 10,000, all in this channel), `search`, `page`, and `per_page` (up to 50).
It requires membership-management permission for every selected place and returns
a paged minimal channel directory with `place_memberships` containing only
`id`, `place_id`, `channel_membership_id`, `status`, and `updated_at` for those
places. Active profiles are available for addition. Inactive or deleted profiles
with active place memberships remain visible so managers can remove them.

The dashboard uses this state for checked (all places), mixed (some places), and
unchecked (no places) checkboxes. Save submits only explicitly changed pairs;
untouched members, including those outside the current search page, are preserved.
Existing active memberships retain their roles. Role selection applies to added
or reopened memberships.

## Filtering places by member

The place list accepts `channel_membership_id` to match an active place
membership for that exact channel profile. It combines with the existing search,
channel, and group filters. Closed, invited, and requested memberships do not match.
`GET /channels/{channel}/places/member-options` supplies the dashboard's Members
column picker. It accepts `search`, `page`, and `per_page` and returns minimal
member labels and channel names for active memberships of visible places,
including child channels when the viewer can manage the hierarchy.

## Notifications, audit and deployment

Account-linked targets receive database notifications for invitations,
assignments and decisions performed by someone else. Join requests also queue a
notification to authorized managers. Run the normal queue worker for these
manager notifications. Notification type is `place_membership_changed` and
message keys use `notifications.place_membership.{event}`.

Membership transitions and role changes are audited. `status_changed_at`,
`updated_by`, closure reason and optional reason are retained. Profile suspension
disables membership-derived access without deleting place associations.

The original migrations were edited because development data is disposable.
An existing database needs a fresh migration/reseed; `migrate` alone cannot rename
the old `place_members` table or change its columns. The old creator auto-role
rule and `place_admin` default have been removed. The dashboard supports member
synchronization on the manage-places and place-detail pages.
