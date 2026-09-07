import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import kvIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache";
import { withRegionalCache } from "@opennextjs/cloudflare/overrides/incremental-cache/regional-cache";

/**
 * The pages are dynamic (every one reads the locale cookie), but the API
 * responses behind them are not: categories, settings and product pages change
 * when an admin edits them, not per visitor. This wires Next's data cache to a
 * KV namespace, so a response is fetched from the origin once per revalidate
 * window instead of on every single page view, and `withRegionalCache` keeps a
 * copy in the colo that served it so repeat hits never leave the region.
 */
export default defineCloudflareConfig({
  incrementalCache: withRegionalCache(kvIncrementalCache, { mode: "long-lived" }),
});
