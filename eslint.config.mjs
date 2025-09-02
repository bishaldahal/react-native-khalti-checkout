import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([
  ...compat.extends("universe/native", "universe/web"),
  {
    rules: {
      // Disable rule causing runtime TypeError with ESLint v9
      "node/handle-callback-err": "off",
    },
  },
  globalIgnores(["**/build"]),
]);
