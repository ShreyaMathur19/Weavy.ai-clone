import { defineConfig } from "@trigger.dev/sdk";

export default defineConfig({
  project: "proj_tkamrraubblkahbasdvz",

  runtime: "node", // ✅ MUST be string now

  maxDuration: 60, // ✅ required (minimum 5)
});
