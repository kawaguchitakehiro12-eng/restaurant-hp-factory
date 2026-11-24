/** Clipboard errors are local UI failures, never share/auth failures. No logging. */
export async function tryCopyShareText(
  text: string,
  clipboard: Pick<Clipboard, "writeText"> | undefined,
): Promise<boolean> {
  try {
    if (!clipboard) return false;
    await clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
