---
title: Channel settings and inheritance
---

# Channel settings and inheritance

Channel settings can combine platform defaults, portal defaults and settings from
parent channels. The channel's name, description, cover image, geometry and tags
belong to that channel; they are not copied from its parent.

## Module activation

Where module settings offer **Inherit**, **Enabled** and **Disabled**:

- **Inherit** follows the nearest configured parent or default.
- **Enabled** explicitly enables the module for this channel.
- **Disabled** explicitly disables it for this channel.

The module must also be available in the deployment. An enabled switch cannot
install missing module code. Disabling a module does not delete its stored records.
For built-in memberships it prevents new admission/acceptance while retaining
existing membership records; for places it prevents operational changes while
retaining the data.

## Local overrides

Inherited values remain linked to their source until overridden. Resetting a value
to inherited removes the local override. An explicit empty list, false or zero is
still a local value, not a request to inherit. Lists replace inherited lists rather
than adding individual entries to them.

If a value is governed or locked upstream, descendants cannot override it. Change
it at the owning scope or ask an authorized administrator there. Lock behavior is
a provisional platform foundation; individual modules determine which settings
actually use it.

Language settings can enable or disable each language locally, or reset it to the
inherited state. Parent changes apply when no nearer override exists. Tags are
local assignments and do not propagate down the channel hierarchy.

Custom fields are owned by the channel that created their schema. Descendants use
that inherited schema unchanged, but can add fields of their own. Only the owner
can change or disable an inherited field.

## Working from a parent channel

Parent-level access does not change record ownership. You need the relevant
permission for the child channel to manage its records. Editing a child's record
from a parent context still changes that child's record and uses that child's
configuration.

Configuration inheritance and permission inheritance are separate. Changing a
setting is not a way to revoke permissions granted by an ancestor. Likewise,
receiving a shared survey does not imply permission to edit its definition or see
its responses.

For precise merge rules and developer contracts, see
[Core channel hierarchy](./architecture-core-channel-hierarchy.md).
