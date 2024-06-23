# trigrr

Script to schedule requests to URLs using Cron syntax.
Made because DigitalOcean function triggers are in beta and limited to 3.

### Usage

```bash
bun index.js [--config path-to-file]
```
The configuration string can be supplied in the environment variable `TRIGRR_CONFIG`.

### Configuration format

```
0 * * * * GET https://example.com
*/5 * * * * POST https://example.com
```

