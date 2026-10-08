---
slug: /
title: Overview
---

# GeoFarmer Documentation

Architecture documentation and usage guides for the GeoFarmer platform.

## Core

- **Architecture:** [host applications](./architecture-core.md),
  [channel hierarchy](./architecture-core-channel-hierarchy.md) and
  [place membership API](./architecture-core-place-memberships.md).
- **Usage:** [channel settings](./usage-core-channel-settings.md) and
  [place memberships](./usage-core-place-memberships.md).
- **Operations:** [local development](./operations-core-development.md) and
  [identity provider](./operations-core-identity.md).

## Platform and Surveys

- **Architecture:** [platform overview](./architecture.md),
  [Surveys design](./architecture-surveys.md),
  [Surveys operations](./architecture-surveys-operations.md) and
  [compatibility / remaining work](./architecture-surveys-compatibility.md).
- **Usage:** [create and publish surveys](./usage-surveys-authoring.md),
  then [review results and export responses](./usage-surveys-results.md).

## Docusaurus Examples

### Admonitions (Info boxes)

:::note
This is a note admonition.
:::

:::tip
This is a tip for best practices.
:::

:::info
This is information that might be useful.
:::

:::warning
This is a warning about potential issues.
:::

:::danger
This is a danger alert for critical information.
:::

### Code Blocks

```javascript
// JavaScript example
const platform = "GeoFarmer";
console.log(`Welcome to ${platform}`);
```

```php
// PHP example
$platform = 'GeoFarmer';
echo "Welcome to $platform";
```

```bash
# Shell commands
npm install
npm run build
```

### Code Blocks with Line Highlighting

```javascript {2,4-6}
function greet(name) {
  // This line is highlighted
  const message = `Hello, ${name}`;
  // These lines are also highlighted
  console.log(message);
  return message;
}
```

### Mermaid Diagrams

```mermaid
graph TD
    A[Client] -->|HTTP Request| B[API Server]
    B --> C{Authentication}
    C -->|Valid| D[Process Request]
    C -->|Invalid| E[Return 401]
    D --> F[Database]
    F --> G[Response]
```

### Tables

| Component  | Technology | Status |
| ---------- | ---------- | ------ |
| API Server | Laravel    | Active |
| Database   | PostgreSQL | Active |
| Queue      | SQS        | Active |

### Links

- Internal link: [Architecture](/docs/architecture)
- External link: [Docusaurus Documentation](https://docusaurus.io)

### Images

![Example Image](/img/docusaurus.png)

### Tabs (requires plugin)

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
  <TabItem value="js" label="JavaScript" default>

```javascript
console.log("Hello from JavaScript");
```

  </TabItem>
  <TabItem value="php" label="PHP">

```php
echo 'Hello from PHP';
```

  </TabItem>
</Tabs>

### Task Lists

- [x] Create documentation structure
- [x] Add Mermaid diagrams
- [ ] Complete API documentation
- [ ] Add deployment guides
