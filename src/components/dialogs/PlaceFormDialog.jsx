import { useEffect, useRef, useState } from "react";
import { SELECTABLE_CATEGORIES, categoryColorStyle } from "../../config/categories";
import { PEOPLE, PLAYER_KEYS, getPersonName } from "../../config/people";
import { PLACE_STATUS, STATUS_LABELS } from "../../config/places";
import { formatPrice, normalizeUrl } from "../../utils/format";
import { ChipGroup } from "../common/ChipGroup";
import { CrossTitle } from "../common/CrossTitle";
import { Modal } from "../common/Modal";

const PRICE_LEVELS = [1, 2, 3, 4];

const CATEGORY_OPTIONS = SELECTABLE_CATEGORIES.map((category) => ({
  value: category.key,
  label: (
    <>
      <span className="bullet" style={categoryColorStyle(category)}>
        {category.kanji}
      </span>
      {category.name}
    </>
  ),
}));
const PRICE_OPTIONS = PRICE_LEVELS.map((priceLevel) => ({ value: priceLevel, label: formatPrice(priceLevel) }));
const STATUS_OPTIONS = Object.values(PLACE_STATUS).map((status) => ({ value: status, label: STATUS_LABELS[status] }));
const PROPOSER_OPTIONS = Object.entries(PEOPLE).map(([personKey, personName]) => ({ value: personKey, label: personName }));

function createInitialForm(placeToEdit, defaultCategoryKey, defaultProposer) {
  return {
    name: placeToEdit?.name || "",
    category: placeToEdit?.category || defaultCategoryKey,
    price: placeToEdit?.price || null,
    status: placeToEdit?.status || PLACE_STATUS.pending,
    proposedBy: placeToEdit?.proposedBy || defaultProposer,
    url: placeToEdit?.url || "",
    notes: placeToEdit?.notes || "",
    isSecret: false,
  };
}

/**
 * Add or edit a place.
 * placeToEdit: the place being edited, or null to add a new one.
 * defaultProposer: who is logged in; a secret is always theirs.
 * onSave(formValues) should return a promise.
 */
export function PlaceFormDialog({ isOpen, placeToEdit, defaultCategoryKey, defaultProposer, onSave, onClose }) {
  const [formValues, setFormValues] = useState(() => createInitialForm(null, defaultCategoryKey, defaultProposer));
  const [isSaving, setIsSaving] = useState(false);
  const nameInputRef = useRef(null);

  // Fill the form each time the dialog opens.
  useEffect(() => {
    if (!isOpen) return;
    setFormValues(createInitialForm(placeToEdit, defaultCategoryKey, defaultProposer));
    const focusTimer = setTimeout(() => nameInputRef.current?.focus(), 50);
    return () => clearTimeout(focusTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, placeToEdit]);

  function updateField(fieldName, value) {
    setFormValues((currentValues) => ({ ...currentValues, [fieldName]: value }));
  }

  async function handleSubmit(submitEvent) {
    submitEvent.preventDefault();
    const trimmedName = formValues.name.trim();
    if (!trimmedName) return;
    const placeValues = {
      ...formValues,
      name: trimmedName,
      notes: formValues.notes.trim(),
      url: normalizeUrl(formValues.url),
    };
    // Only new places can be sealed; editing never touches the secret.
    if (placeToEdit) delete placeValues.isSecret;
    else if (placeValues.isSecret) placeValues.proposedBy = defaultProposer;
    setIsSaving(true);
    try {
      await onSave(placeValues);
    } finally {
      setIsSaving(false);
    }
  }

  const titleWords = placeToEdit ? ["Editar", "Este", "Lote"] : ["Nuevo", "Lugar", "A cazar"];
  const otherPlayerName = getPersonName(PLAYER_KEYS.find((playerKey) => playerKey !== defaultProposer));

  return (
    <Modal isOpen={isOpen} onClose={onClose} labelledBy="placeFormTitle">
      <form className="dlg" onSubmit={handleSubmit}>
        <h3 id="placeFormTitle">
          <CrossTitle words={titleWords} />
        </h3>
        <span className="eyebrow jp" style={{ color: "var(--crimson)" }}>
          新しいお店 · nuevo lugar
        </span>

        <div className="field">
          <label htmlFor="place-name">Nombre</label>
          <input
            id="place-name"
            ref={nameInputRef}
            required
            maxLength={60}
            placeholder="Ej. Joe's Pizza"
            value={formValues.name}
            onChange={(changeEvent) => updateField("name", changeEvent.target.value)}
          />
        </div>

        <div className="field">
          <span className="flabel">Categoría</span>
          <ChipGroup ariaLabel="Categoría" options={CATEGORY_OPTIONS} selectedValue={formValues.category} onSelect={(value) => updateField("category", value)} />
        </div>

        {/* New places start pending and without a price: both are known once they've been there. */}
        {placeToEdit && (
          <div className="grid2">
            <div className="field">
              <span className="flabel">Precio</span>
              <ChipGroup ariaLabel="Precio" options={PRICE_OPTIONS} selectedValue={formValues.price} onSelect={(value) => updateField("price", value)} />
            </div>
            <div className="field">
              <span className="flabel">Estado</span>
              <ChipGroup ariaLabel="Estado" options={STATUS_OPTIONS} selectedValue={formValues.status} onSelect={(value) => updateField("status", value)} />
            </div>
          </div>
        )}

        <div className="field">
          <span className="flabel">¿Quién lo propuso?</span>
          {formValues.isSecret ? (
            <span className="secret-proposer">Lo propones tú, {getPersonName(defaultProposer)}. Los secretos son de quien los guarda.</span>
          ) : (
            <ChipGroup ariaLabel="¿Quién lo propuso?" options={PROPOSER_OPTIONS} selectedValue={formValues.proposedBy} onSelect={(value) => updateField("proposedBy", value)} />
          )}
        </div>

        <div className="field">
          <label htmlFor="place-url">Link (Google Maps, Instagram…)</label>
          <input id="place-url" type="url" placeholder="https://" value={formValues.url} onChange={(changeEvent) => updateField("url", changeEvent.target.value)} />
        </div>

        <div className="field">
          <label htmlFor="place-notes">Notas</label>
          <textarea
            id="place-notes"
            rows={3}
            maxLength={400}
            placeholder="Qué pedir, a qué hora ir, si hay que reservar…"
            value={formValues.notes}
            onChange={(changeEvent) => updateField("notes", changeEvent.target.value)}
          />
        </div>

        {!placeToEdit && (
          <label className="secret-toggle">
            <input type="checkbox" checked={formValues.isSecret} onChange={(changeEvent) => updateField("isSecret", changeEvent.target.checked)} />
            <span className="secret-toggle-seal" aria-hidden="true">
              秘
            </span>
            <span>
              <b>Guardar como secreto · 秘密</b>
              <span className="secret-toggle-note">
                Solo tú lo verás. Para {otherPlayerName} será un lote sellado hasta que lo reveles, cuando estén juntos.
              </span>
            </span>
          </label>
        )}

        <div className="actions">
          <button type="button" className="btn ghost" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn" disabled={isSaving}>
            Guardar
          </button>
        </div>
      </form>
    </Modal>
  );
}
