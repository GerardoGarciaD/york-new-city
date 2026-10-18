/**
 * Food categories shown on the dial.
 * - kanji: the character used as the category badge
 * - japaneseName: katakana shown under the name
 * - color / textColor: card background and text color
 */
export const CATEGORIES = [
  { key: "all", name: "Todo", japaneseName: "ぜんぶ", kanji: "全", color: "var(--l-grey)", textColor: "#fff" },
  { key: "pizza", name: "Pizza", japaneseName: "ピザ", kanji: "焼", color: "var(--l-red)", textColor: "#fff" },
  { key: "deli", name: "Bagels y deli", japaneseName: "デリ", kanji: "麦", color: "var(--l-orange)", textColor: "#151612" },
  { key: "tacos", name: "Tacos", japaneseName: "タコス", kanji: "辛", color: "var(--l-green)", textColor: "#fff" },
  { key: "ramen", name: "Ramen y fideos", japaneseName: "ラーメン", kanji: "麺", color: "var(--l-yellow)", textColor: "#0b0b0c" },
  { key: "burger", name: "Hamburguesas", japaneseName: "バーガー", kanji: "肉", color: "var(--l-blue)", textColor: "#fff" },
  { key: "dessert", name: "Postres", japaneseName: "デザート", kanji: "甘", color: "var(--l-purple)", textColor: "#fff" },
  { key: "bar", name: "Bares", japaneseName: "バー", kanji: "酒", color: "var(--l-brown)", textColor: "#fff" },
  { key: "cafe", name: "Café", japaneseName: "カフェ", kanji: "珈", color: "var(--l-lime)", textColor: "#0b0b0c" },
  { key: "brunch", name: "Brunch", japaneseName: "ブランチ", kanji: "朝", color: "var(--l-teal)", textColor: "#fff" },
];

/** Categories a place can belong to (everything except "Todo"). */
export const SELECTABLE_CATEGORIES = CATEGORIES.filter((category) => category.key !== "all");

export function findCategory(categoryKey) {
  return CATEGORIES.find((category) => category.key === categoryKey) || CATEGORIES[0];
}

export function findCategoryIndex(categoryKey) {
  return CATEGORIES.findIndex((category) => category.key === categoryKey);
}

/** CSS custom properties that paint an element with the category colors. */
export function categoryColorStyle(category) {
  return { "--c": category.color, "--t": category.textColor };
}
