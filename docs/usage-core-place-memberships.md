---
title: Manage place memberships
---

# Manage place memberships

A place belongs to one channel. Its members are profiles from that same channel,
including guests who do not yet have a linked login account. Membership connects
an existing channel profile to the place; it does not copy that profile.

## Add people and choose roles

With place-membership management permission, use the member controls on the place
detail or manage-places page to select profiles and assign roles. Available actions
depend on your permissions and the person's current membership state.

An invitation requires an account-linked profile and waits for that person to
accept. An authorized manager can directly assign either an account-linked profile
or a guest. A pending invitation/request does not grant place access.

| Default role | Allows |
| --- | --- |
| Place manager | Update/delete the place and manage its memberships |
| Place content manager | Manage content associated with the place |

Multiple roles may be selected. Channel role administrators can define additional
place roles. Active membership permits viewing; editing and other management
powers depend on the assigned roles. Creating a place does not automatically grant
its creator membership or ongoing access.

## Requests, invitations and removal

A person's join request requires manager approval. An invited person can accept
or decline; requesters can withdraw their own requests. Managers can reject a
request, cancel an invitation or remove an active member. Members can leave.

Closing a membership revokes its role assignments but preserves its history and
channel profile. Reopening uses a fresh role selection instead of silently
restoring old access. If another person changed the membership meanwhile, reload
before retrying the action.

A guest who later claims their account keeps their place memberships. Suspending
the channel profile disables membership-derived access without deleting its
place associations.

## Manage several places

Select places and open the membership assignment controls. The selection shows
whether a person belongs to all selected places, some of them, or none. Save
applies only pairs you explicitly changed. People outside the current search page
and untouched selections are preserved.

Existing active memberships keep their roles. The selected roles apply to newly
added or reopened memberships. Review partial failures after a batch operation:
some assignments may succeed while others require attention.

The place list's Members filter matches active memberships for the selected
channel profile. Pending or closed memberships do not match that filter.

## Notifications and history

Account-linked people receive notifications about invitations, assignments and
decisions made by someone else. Join requests also notify authorized managers.
Membership transitions and role changes retain audit information, including who
changed the state and any supplied reason.

For endpoints, payloads, guest creation, authorization and offline retry semantics,
see the [place membership API reference](./architecture-core-place-memberships.md).
