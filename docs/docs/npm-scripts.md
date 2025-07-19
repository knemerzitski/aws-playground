---
sidebar_label: 'NPM Scripts'
sidebar_position: 0
---

# NPM Scripts Naming Convention

Scripts follow this pattern:

```
<task>[:<scope>][:<mode>]
```

Avoid setting environment variables directly inside scripts.  
Instead, use tools like [`dotenv-cli`](https://www.npmjs.com/package/dotenv-cli) or shell syntax:

```sh
NODE_ENV=test npm run test
dotenv -e .env.test -- npm run test:e2e
```

## Tasks

| Task        | Description                                                                                                  |
| ----------- | ------------------------------------------------------------------------------------------------------------ |
| `clean`     | Remove all build artifacts, caches, or generated files                                                       |
| `dev`       | Start the app in **local development mode** (hot reload, optional DB startup). Should be a one-command setup |
| `start`     | Start the **built app** (for production or testing, depending on `NODE_ENV`)                                 |
| `build`     | Compile/transpile code for production or CI                                                                  |
| `test`      | Run **all** test types (unit, integration, E2E)                                                              |
| `lint`      | Run linters like ESLint to detect issues                                                                     |
| `typecheck` | Type-check code without emitting output (`tsc --noEmit`)                                                     |
| `format`    | Check or fix code formatting (e.g. Prettier)                                                                 |
| `db`        | Interact with the database (start, stop, seed)                                                               |
| `check`     | Run all static analysis tasks (`typecheck`, `lint`, `format`)                                                |
| `validate`  | Run all checks **and** tests                                                       |

## Scope

Use scope to narrow what a task affects:

| Script      | Description                      |
| ----------- | -------------------------------- |
| `test:unit` | Run unit tests only              |
| `test:int`  | Run integration tests only       |
| `test:e2e`  | Run end-to-end tests only        |
| `db:start`  | Start local development database |
| `db:stop`   | Stop local development database  |

## Mode

Use mode to modify _how_ a task runs:

| Mode           | Description                                               |
| -------------- | --------------------------------------------------------- |
| `:w`, `:watch` | Watch mode (e.g. `test:unit:w`)                           |
| `:only`        | Run a filtered or focused set (e.g. `test:e2e:only`)      |
| `:ci`          | Run a CI-optimized version (e.g. headless, no watch mode) |

> `watch` or `w` are interchangeable. Keep it consistent per project.

## Examples

| Script        | Description                                             |
| ------------- | ------------------------------------------------------- |
| `dev`         | Start app with hot reload and development DB            |
| `start`       | Run transpiled app in production or test mode           |
| `test:unit:w` | Watch-mode unit tests                                   |
| `check`       | Run all static analysis tasks (lint, typecheck, format) |
| `validate`    | Run `check` + all tests             |

## Tips

- Keep frequently used scripts like `dev`, `build`, and `test` at the top level
- Avoid creating unnecessary variants like `start:dev`, `start:e2e`; instead use `NODE_ENV` or `.env` files
- Use `.env` files like `.env.development`, `.env.test`, and `.env.production` to handle configuration differences cleanly
