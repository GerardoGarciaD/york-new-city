import { categoryColorStyle } from "../../config/categories";

/** Round kanji badge for a category. Set colored={false} to inherit the card's white badge style. */
export function CategoryBullet({ category, colored = true, className = "", children }) {
  return (
    <span className={`bullet ${className}`.trim()} style={colored ? categoryColorStyle(category) : undefined}>
      {category.kanji}
      {children}
    </span>
  );
}
