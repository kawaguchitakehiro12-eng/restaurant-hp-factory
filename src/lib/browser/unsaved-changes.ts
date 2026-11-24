export const BEFORE_LEAVE_EVENT = "sakupage:before-leave";
export function shouldConfirmLink(href: string, target: string, download: boolean, current: string): boolean {
  if (download || (target && target !== "_self")) return false;
  try { const next = new URL(href, current), here = new URL(current);
    if (!["http:","https:"].includes(next.protocol)) return false;
    return next.origin !== here.origin || next.pathname !== here.pathname || next.search !== here.search;
  } catch { return false; }
}
/** Guard ordinary links and full-document unloads; it does not rewrite browser history. */
export function installUnsavedChangesGuard(isDirty: () => boolean): () => void {
  const pending = () => isDirty() || Boolean(document.querySelector('.admin-image-upload[aria-busy="true"]'));
  const confirm = () => !pending() || window.confirm("未保存の変更、または処理中の画像があります。このまま離れると失われます。移動しますか？");
  const unload = (event: BeforeUnloadEvent) => { if (pending()) { event.preventDefault(); event.returnValue = ""; } };
  const click = (event: MouseEvent) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const anchor = (event.target as Element | null)?.closest?.("a");
    if (!anchor || !shouldConfirmLink(anchor.href, anchor.target, anchor.hasAttribute("download"), window.location.href)) return;
    if (!confirm()) { event.preventDefault(); event.stopPropagation(); }
  };
  const action = (event: Event) => { if (!confirm()) event.preventDefault(); };
  window.addEventListener("beforeunload", unload);
  document.addEventListener("click", click, true);
  window.addEventListener(BEFORE_LEAVE_EVENT, action);
  return () => { window.removeEventListener("beforeunload", unload); document.removeEventListener("click", click, true); window.removeEventListener(BEFORE_LEAVE_EVENT, action); };
}
export function confirmBeforeLeaving(): boolean {
  return window.dispatchEvent(new Event(BEFORE_LEAVE_EVENT, {cancelable:true}));
}
