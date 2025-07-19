---
sidebar_label: 'Ports Assignments'
sidebar_position: 0
---

# Port Assignments

This document outlines port usage for local development, testing, and CI environments.  
All services should define ports via `.env.*` files to ensure consistent configuration.

---

## Port Ranges (Convention)

| Range     | Purpose                                           |
| --------- | ------------------------------------------------- |
| 3000–3999 | Development (hot reload, etc.)                    |
| 4000–4999 | Local testing (integration, E2E)                  |
| 5000–5999 | CI/automated testing                              |
| 6000–6999 | Documentation/tools (e.g., Docusaurus, Storybook) |
| 7000–7999 | Mock services, dev DBs                            |
| 8000+     | Reserved / staging / future                       |

## Service Port Assignments

Right now below are just examples.
TODO add ports of actual services

| Service      | Dev Port | Test Port | CI Port | Notes                   |
| ------------ | -------- | --------- | ------- | ----------------------- |
| Web frontend | 3000     | 4000      | 5000    | Next.js app             |
| API backend  | 3100     | 4100      | 5100    | Express / Node API      |
| Docusaurus   | 6000     | –         | –       | Developer documentation |

> All values are loaded via `.env` or `.env.*` files, not hardcoded.

## Example .env.development

```env
APP_PORT=3000
API_PORT=3100
DOCUSAURUS_PORT=6000
```

## Example .env.test

```env
APP_PORT=4000
API_PORT=4100
```

## Best Practices

- Never hardcode ports in source files, always read from environment variables.
- Use consistent ranges so ports are predictable and avoid conflicts.
- Document new services and tools as you add them to the repo.
