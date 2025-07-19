---
sidebar_position: 2
---

# Port Assignments

This document outlines port usage for local development, testing, and CI environments.  
All services should define ports via `.env.*` files to ensure consistent configuration.

## Used Ports

| Service              | Dev Port | Test Port | CI Port | Notes                       |
| -------------------- | -------- | --------- | ------- | --------------------------- |
| `@repo/math-service` | 3200     | ?         | ?       | Calculates math expressions |
| `docs`               | 6100     | –         | –       | Developer documentation     |
| `infra`              | 7000     | –         | –       | API Gateway start-api port  |

## Port Ranges

| Range     | Purpose                                           |
| --------- | ------------------------------------------------- |
| 3000–3999 | Development (hot reload, etc.)                    |
| 4000–4999 | Local testing (integration, E2E)                  |
| 5000–5999 | CI/automated testing                              |
| 6100–6999 | Documentation/tools (e.g., Docusaurus, Storybook) |
| 7000–7999 | Mock services, dev DBs                            |
| 8000+     | Reserved / staging / future                       |

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
