export interface SelectionLines {
  start: number
  end: number
}

export function createFileReference(relativePath: string, selection?: SelectionLines): string {
  const normalizedPath = relativePath.replaceAll("\\", "/")
  let reference = `@${normalizedPath}`

  if (!selection) {
    return reference
  }

  const start = selection.start + 1
  const end = selection.end + 1
  return start === end ? `${reference}#L${start}` : `${reference}#L${start}-L${end}`
}

export type ShellKind = "powershell" | "cmd" | "posix"

export function createExecutableCommand(executable: string, shell: ShellKind): string {
  const quoted = quoteShellArgument(executable, shell)
  return shell === "powershell" ? `& ${quoted}` : quoted
}

export function quoteShellArgument(value: string, shell: ShellKind): string {
  if (shell === "powershell") {
    return `'${value.replaceAll("'", "''")}'`
  }

  if (shell === "cmd") {
    return `"${value.replaceAll('"', '\\"').replaceAll("%", "%%")}"`
  }

  return `'${value.replaceAll("'", `'"'"'`)}'`
}
