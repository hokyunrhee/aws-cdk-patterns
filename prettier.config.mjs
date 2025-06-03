/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
const config = {
  printWidth: 120,
  plugins: ["@ianvs/prettier-plugin-sort-imports"],
  importOrder: [
    "^(electron/(.*)$)|^(electron$)",
    "",
    "^(react/(.*)$)|^(react$)",
    "",
    "^(node:(.*)$)",
    "",
    "^(@react-router/(.*)$)",
    "",
    "<THIRD_PARTY_MODULES>",
    "",
    "^~/(.*)$",
    "",
    "^[./]",
  ],
  importOrderParserPlugins: ["typescript", "jsx", "decorators-legacy"],
  importOrderTypeScriptVersion: "5.0.0",
  importOrderCaseSensitive: false,
};

export default config;
