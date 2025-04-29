import tsconfigPaths from "vite-tsconfig-paths";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";
import { defineConfig } from "vite";
import { EXTERNAL_DEPENDENCIES } from "@patchwork/sdk/shared-dependencies";

export default defineConfig({
  plugins: [tsconfigPaths(), wasm(), topLevelAwait()],
  build: {
    rollupOptions: {
      external: EXTERNAL_DEPENDENCIES,
      input: {
        main: "src/patchwork/index.ts",
      },
      output: {
        entryFileNames: (chunkInfo) => {
          return chunkInfo.name === "main"
            ? "patchwork.js"
            : "[name].[hash].js";
        },
      },
      preserveEntrySignatures: "strict",
    },
  },
});
