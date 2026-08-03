import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

// eslint-config-next 16 ships flat configs directly; FlatCompat is no longer
// needed (and breaks on the react plugin's circular references).
const eslintConfig = [
  ...coreWebVitals,
  ...typescript,
  {
    ignores: [".next/**", "out/**", "node_modules/**", "scripts/**"],
  },
];

export default eslintConfig;
