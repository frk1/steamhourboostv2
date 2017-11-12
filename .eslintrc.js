"use strict";

module.exports = {
  env: {
    es6: true,
    node: true
  },
  extends: ["eslint:recommended"],
  plugins: ["import"],
  rules: {
    curly: ["error", "multi", "consistent"],
    "import/no-extraneous-dependencies": [
      "error",
      { devDependencies: ["tests*/**", "scripts/**"] }
    ],
    "no-console": "off",
    "no-else-return": "error",
    "no-inner-declarations": "error",
    "no-unneeded-ternary": "error",
    "no-useless-return": "error",
    "no-var": "error",
    "no-trailing-spaces": "error",
    "prefer-arrow-callback": "error",
    "prefer-const": "error",
    "react/no-deprecated": "off",
    semi: ["error", "never"],
    strict: "error",
    eqeqeq: 2,
    "symbol-description": "error",
    "nonblock-statement-body-position": ["error", "beside"],
    yoda: ["error", "never", { exceptRange: true }]
  },
  parserOptions: {
  }
};
