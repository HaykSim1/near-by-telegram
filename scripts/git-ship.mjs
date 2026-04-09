import { execSync } from "node:child_process";

const message =
  process.argv.slice(2).join(" ").trim() ||
  `chore: update ${new Date().toISOString().slice(0, 10)}`;

execSync("git add -A", { stdio: "inherit" });

let hasStaged = false;
try {
  execSync("git diff --cached --quiet", { stdio: "pipe" });
} catch {
  hasStaged = true;
}

if (!hasStaged) {
  console.log("Nothing to commit (working tree clean after add).");
  process.exit(0);
}

execSync(`git commit -m ${JSON.stringify(message)}`, { stdio: "inherit" });
execSync("git push", { stdio: "inherit" });
