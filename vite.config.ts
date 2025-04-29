import tsconfigPaths from "vite-tsconfig-paths";
import wasm from "vite-plugin-wasm";

export default {
  plugins: [tsconfigPaths(), wasm()],
};
