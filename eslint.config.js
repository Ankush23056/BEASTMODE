import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";

export default [
  { languageOptions: { globals: globals.browser } },
  ...tseslint.configs.recommended,
  pluginReactConfig,
  {
    rules: {
        "@typescript-eslint/no-explicit-any": "off",
        "react/jsx-no-target-blank": "off",
        "react/prop-types": "off",
        "react/no-unknown-property": "off"
    }
  }
];
