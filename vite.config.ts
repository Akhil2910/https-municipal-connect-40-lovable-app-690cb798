// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// DEPLOY_TARGET=node  -> build a plain Node.js server (used for AWS EC2).
// Unset               -> Lovable's default edge build (used by Lovable hosting).
export default defineConfig(
  process.env.DEPLOY_TARGET === "node"
    ? { nitro: { preset: "node-server" } }
    : {},
);
