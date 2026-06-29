import next from "eslint-config-next";

const eslintConfig = [
  {
    ignores: [".next/**", "node_modules/**", "src/db/migrations/**", "coverage/**"],
  },
  ...next,
];

export default eslintConfig;
