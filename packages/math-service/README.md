# Echo Service

A express.js server that exposes endpoints to calculate math expressions.

- GET endpoint `/eval?expr=2+3` (query arg to be encoded)

Response json format:

```json
{
  "result": 5
}
```
