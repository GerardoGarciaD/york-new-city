import { categoryColorStyle, findCategory } from "../../config/categories";
import { getPersonName } from "../../config/people";
import { STATUS_LABELS } from "../../config/places";
import { formatLocation, formatPrice } from "../../utils/format";

export function PlaceRow({ place, onOpen }) {
  const category = findCategory(place.category);
  const detailParts = [formatLocation(place)];
  if (place.proposedBy) detailParts.push(getPersonName(place.proposedBy));
  if (place.isExample) detailParts.push("ejemplo");
  if (place.isSecret) detailParts.push("秘 solo tú lo ves");

  function handleKeyDown(keyboardEvent) {
    if (keyboardEvent.key === "Enter") onOpen();
  }

  return (
    <li tabIndex={0} onClick={onOpen} onKeyDown={handleKeyDown}>
      <span className="bullet" style={categoryColorStyle(category)}>
        {category.kanji}
      </span>
      <span className="nm">
        <span>{place.name}</span>
        <span className="sub">{detailParts.join(" · ")}</span>
      </span>
      <span className="pill st">{STATUS_LABELS[place.status]}</span>
      <span className="pr">{formatPrice(place.price)}</span>
    </li>
  );
}
