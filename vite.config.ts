import wasm from "vite-plugin-wasm";
import tsconfigPaths from "vite-tsconfig-paths";

export default {
  plugins: [tsconfigPaths(), wasm()],
};
