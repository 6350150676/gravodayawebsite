// Next.js bundles type declarations for `*.module.css` (CSS Modules) but not
// for plain side-effect CSS imports like `import "./globals.css"`, which
// triggers TS2882. This ambient declaration covers those global imports.
declare module "*.css";
