import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// No incremental cache configured: every page is `force-dynamic`, so nothing is ISR-cached.
export default defineCloudflareConfig({});
