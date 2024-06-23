# trigrr

Script to schedule requests to URLs using Cron syntax.
Made because DigitalOcean function triggers are in beta and limited to 3.

### Usage

```bash
bun index.js [--config path-to-file]
```
The configuration string can be supplied in the environment variable `TRIGRR_CONFIG`.

### Configuration

Supply the Basic authentication token in the environment variable `TRIGRR_AUTH_TOKEN`.

The configuration file should be in the following format:

```
0 * * * * POST https://abcd-doserverless.com/api/v1/web/namespace/package/function_a?blocking=false
0/5 * * * * POST https://abcd-doserverless.com/api/v1/web/namespace/package/function_b?blocking=false
```

To receive activation logs on DigitalOcean, the query parameter `blocking=false` should be supplied in the URL.

