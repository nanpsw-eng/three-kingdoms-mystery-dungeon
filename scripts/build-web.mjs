#!/usr/bin/env node
// Builds the static web client into site/ (no bundler: browser-native ES modules).
import { cpSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const tsc = require.resolve("typescript/bin/tsc");
execFileSync(process.execPath, [tsc, "-p", "tsconfig.web.json"], { stdio: "inherit" });
mkdirSync("site", { recursive: true });
cpSync("web/index.html", "site/index.html");
cpSync("web/style.css", "site/style.css");
console.log("site/ ready — serve with: npm run serve");
