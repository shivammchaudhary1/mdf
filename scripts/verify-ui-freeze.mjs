import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import ts from "typescript";

const baseline = process.env.UI_FREEZE_BASE ?? "ab9d8ff";
const git = (...args) => execFileSync("git", args, { encoding: "utf8", stdio: "pipe" });
const files = [...new Set([...git("diff", "--name-only", baseline, "--", "apps/web").split(/\r?\n/), ...git("ls-files", "--others", "--exclude-standard", "--", "apps/web").split(/\r?\n/)])].filter(Boolean);
const attributes = (path, source) => {
  const tree = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const values = [];
  const visit = node => {
    if (ts.isJsxAttribute(node) && ["className", "style"].includes(node.name.getText(tree))) values.push(node.getText(tree).replaceAll("\r\n", "\n"));
    ts.forEachChild(node, visit);
  };
  visit(tree);
  return values;
};
for (const path of files) {
  assert.ok(!/\.css$|tailwind|next\.config/.test(path), `Visual configuration changed: ${path}`);
  if (!path.endsWith(".tsx")) continue;
  let previous;
  try { previous = git("show", `${baseline}:${path}`); } catch { previous = ""; }
  assert.deepEqual(attributes(path, readFileSync(path, "utf8")), attributes(path, previous), `Visual attributes changed: ${path}`);
}
console.log(`PASS UI freeze: ${files.length} changed web files; existing className/style attributes unchanged; no CSS/design configuration changes.`);
