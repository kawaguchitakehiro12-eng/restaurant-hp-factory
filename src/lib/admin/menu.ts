export const MENU_MAX_ITEMS = 20;

export function getMenuCountLabel(current: number): string {
  return `メニュー登録数 ${current}/${MENU_MAX_ITEMS}件`;
}
