# NBMEcalc MCP

A remote Model Context Protocol server exposing deterministic, offline
educational score conversion from [NBMEcalc](https://nbmecalc.com).

The Streamable HTTP endpoint is `/mcp`. The server exposes
`convert_practice_score` and returns the estimate together with the `v1.1`
algorithm identifier and a required disclaimer.

It has no database, account system, analytics call, or learner-data storage.
Mappings are independent model assumptions, not official conversions or
examination guarantees. Do not use outputs for clinical decisions.

```shell
npm install
npm test
npm run check
npm run deploy:dry
```

Apache-2.0 licensed.
