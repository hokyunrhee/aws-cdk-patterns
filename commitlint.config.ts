const Configuration = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-case": [2, "always", ["lower-case", "kebab-case"]],
    "scope-case": [2, "always", ["lower-case", "kebab-case"]],
  },
};

export default Configuration;
