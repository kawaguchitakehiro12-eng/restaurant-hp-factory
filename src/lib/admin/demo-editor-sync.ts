/** A remote refresh must not discard unsaved edits for the same site. */
export function shouldSyncDemoDraft(input: {
  currentSiteId: string | null;
  syncedKey: string | null;
  incomingSiteId: string;
  incomingKey: string;
  dirty: boolean;
}): boolean {
  if (input.syncedKey === input.incomingKey) return false;
  return !(input.syncedKey !== null && input.currentSiteId === input.incomingSiteId && input.dirty);
}
