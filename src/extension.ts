import { execFile } from "node:child_process"
import { promisify } from "node:util"
import * as vscode from "vscode"
import {
  createExecutableCommand,
  createFileReference,
  quoteShellArgument,
  type ShellKind,
} from "./fileReference"

const execFileAsync = promisify(execFile)
const terminalPrefix = "OpenCode V2"
const managedTerminals: vscode.Terminal[] = []

export function activate(context: vscode.ExtensionContext): void {
  const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100)
  statusBar.name = "OpenCode V2"
  statusBar.text = "$(terminal) OpenCode"
  statusBar.tooltip = "Open or focus OpenCode V2"
  statusBar.command = "opencodeV2.open"

  const refreshStatusBar = (): void => {
    const visible = vscode.workspace.getConfiguration("opencodeV2").get("showStatusBar", true)
    visible ? statusBar.show() : statusBar.hide()
  }

  refreshStatusBar()

  context.subscriptions.push(
    statusBar,
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration("opencodeV2.showStatusBar")) {
        refreshStatusBar()
      }
    }),
    vscode.window.onDidCloseTerminal((terminal) => {
      const index = managedTerminals.indexOf(terminal)
      if (index >= 0) managedTerminals.splice(index, 1)
    }),
    vscode.commands.registerCommand("opencodeV2.open", () => openOrFocus(false)),
    vscode.commands.registerCommand("opencodeV2.openNew", () => openOrFocus(true)),
    vscode.commands.registerCommand("opencodeV2.addContext", addContext),
    vscode.commands.registerCommand("opencodeV2.checkInstallation", checkInstallation),
  )
}

export function deactivate(): void {}

async function openOrFocus(forceNew: boolean): Promise<void> {
  if (!forceNew) {
    const existing = getOpenCodeTerminal()
    if (existing) {
      existing.show(false)
      return
    }
  }

  const editor = vscode.window.activeTextEditor
  const workspaceFolder = editor
    ? vscode.workspace.getWorkspaceFolder(editor.document.uri)
    : vscode.workspace.workspaceFolders?.[0]

  if (!workspaceFolder) {
    void vscode.window.showWarningMessage("Open a folder or workspace before starting OpenCode V2.")
    return
  }

  const configuration = vscode.workspace.getConfiguration("opencodeV2")
  const executable = configuration.get("executablePath", "opencode").trim() || "opencode"
  const includeContext = configuration.get("includeContextOnOpen", true)
  const reference = includeContext ? getActiveFileReference() : undefined
  const terminal = vscode.window.createTerminal({
    name: nextTerminalName(),
    cwd: workspaceFolder.uri,
    iconPath: new vscode.ThemeIcon("terminal"),
    location: {
      viewColumn: vscode.ViewColumn.Beside,
      preserveFocus: false,
    },
    env: {
      OPENCODE_CALLER: "vscode",
    },
  })

  managedTerminals.push(terminal)
  terminal.show(false)

  const shell = detectShell()
  const executableCommand = createExecutableCommand(executable, shell)
  const command = reference
    ? `${executableCommand} --prompt ${quoteShellArgument(`In ${reference}`, shell)}`
    : executableCommand
  terminal.sendText(command, true)
}

async function addContext(): Promise<void> {
  const reference = getActiveFileReference()
  if (!reference) {
    void vscode.window.showInformationMessage("Open a file to add it to OpenCode V2.")
    return
  }

  const terminal = getOpenCodeTerminal()
  if (!terminal) {
    await openOrFocus(true)
    return
  }

  terminal.show(false)
  terminal.sendText(reference, false)
}

async function checkInstallation(): Promise<void> {
  const executable = vscode.workspace.getConfiguration("opencodeV2").get("executablePath", "opencode").trim()

  try {
    const { stdout } = await execFileAsync(executable || "opencode", ["--version"], {
      timeout: 10_000,
      windowsHide: true,
    })
    void vscode.window.showInformationMessage(`OpenCode is ready: ${stdout.trim()}`)
  } catch {
    const action = await vscode.window.showErrorMessage(
      `OpenCode V2 was not found at “${executable || "opencode"}”. Install it or configure opencodeV2.executablePath.`,
      "Open Settings",
    )
    if (action === "Open Settings") {
      await vscode.commands.executeCommand("workbench.action.openSettings", "opencodeV2.executablePath")
    }
  }
}

function getOpenCodeTerminal(): vscode.Terminal | undefined {
  const active = vscode.window.activeTerminal
  if (active?.name.startsWith(terminalPrefix)) return active

  return [...managedTerminals].reverse().find((terminal) => vscode.window.terminals.includes(terminal))
    ?? vscode.window.terminals.find((terminal) => terminal.name.startsWith(terminalPrefix))
}

function nextTerminalName(): string {
  const count = vscode.window.terminals.filter((terminal) => terminal.name.startsWith(terminalPrefix)).length
  return count === 0 ? terminalPrefix : `${terminalPrefix} ${count + 1}`
}

function getActiveFileReference(): string | undefined {
  const editor = vscode.window.activeTextEditor
  if (!editor || editor.document.uri.scheme !== "file") return undefined
  if (!vscode.workspace.getWorkspaceFolder(editor.document.uri)) return undefined

  const relativePath = vscode.workspace.asRelativePath(editor.document.uri, false)
  const selection = editor.selection.isEmpty
    ? undefined
    : { start: editor.selection.start.line, end: editor.selection.end.line }
  return createFileReference(relativePath, selection)
}

function detectShell(): ShellKind {
  if (process.platform !== "win32") return "posix"

  const profile = vscode.workspace
    .getConfiguration("terminal.integrated")
    .get<string>("defaultProfile.windows", "PowerShell")
    .toLowerCase()

  return profile.includes("command prompt") || profile.includes("cmd") ? "cmd" : "powershell"
}
