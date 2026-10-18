import { getPersonName } from "../../config/people";
import { formatLotNumber } from "../../utils/format";
import { CrossTitle } from "../common/CrossTitle";
import { Modal } from "../common/Modal";
import { WaxSeal } from "./WaxSeal";

/** What you see when you tap someone else's sealed lot: nothing but who sealed it. */
export function SealedPlaceDialog({ place, onClose }) {
  if (!place) return <Modal isOpen={false} onClose={onClose} labelledBy="sealedPlaceTitle" />;

  const ownerName = getPersonName(place.secretOwner);

  return (
    <Modal isOpen onClose={onClose} labelledBy="sealedPlaceTitle">
      <div className="dlg sealed-dialog">
        <span className="eyebrow jp" style={{ color: "var(--crimson)" }}>
          秘密 · lote {formatLotNumber(place.lot)}
        </span>
        <h3 id="sealedPlaceTitle">
          <CrossTitle words={["Lote", "Sellado", ownerName]} />
        </h3>
        <WaxSeal className="sealed-dialog-seal" />
        <p className="sealed-dialog-text">
          {ownerName} guardó este lugar en secreto. Ni el nombre ni la zona salen de aquí hasta que lo revele. Cuando estén juntos, pídanle que rompa
          el sello.
        </p>
        <div className="actions">
          <span />
          <button type="button" className="btn" onClick={onClose}>
            Entendido
          </button>
        </div>
      </div>
    </Modal>
  );
}
