import assert from "node:assert/strict"
import test from "node:test"
import { createExecutableCommand, createFileReference, quoteShellArgument } from "../src/fileReference"

test("creates a normalized file reference", () => {
  assert.equal(createFileReference("src\\extension.ts"), "@src/extension.ts")
})

test("adds one-based selection lines", () => {
  assert.equal(createFileReference("src/app.ts", { start: 4, end: 4 }), "@src/app.ts#L5")
  assert.equal(createFileReference("src/app.ts", { start: 4, end: 8 }), "@src/app.ts#L5-L9")
})

test("quotes prompts for common shells", () => {
  assert.equal(quoteShellArgument("it's ready", "powershell"), "'it''s ready'")
  assert.equal(quoteShellArgument("it's ready", "posix"), "'it'\"'\"'s ready'")
  assert.equal(quoteShellArgument("100% ready", "cmd"), '"100%% ready"')
})

test("creates a shell-safe executable command", () => {
  assert.equal(createExecutableCommand("C:\\Program Files\\OpenCode\\opencode.exe", "powershell"), "& 'C:\\Program Files\\OpenCode\\opencode.exe'")
  assert.equal(createExecutableCommand("opencode", "posix"), "'opencode'")
})
