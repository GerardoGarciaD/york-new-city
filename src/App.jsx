import { useCallback, useEffect, useRef, useState } from "react";
import { CATEGORIES, findCategoryIndex } from "./config/categories";
import { PEOPLE } from "./config/people";
import { PLACE_STATUS, isSharedPlace } from "./config/places";
import { useToast } from "./context/ToastContext";
import { usePlaces } from "./hooks/usePlaces";
import { usePrefersReducedMotion } from "./hooks/usePrefersReducedMotion";
import { useSession } from "./hooks/useSession";
import { resolveMapLink } from "./services/api";
import { CategoryDial } from "./components/dial/CategoryDial";
import { JajankenDialog } from "./components/dialogs/JajankenDialog";
import { PlaceDetailDialog } from "./components/dialogs/PlaceDetailDialog";
import { PlaceFormDialog } from "./components/dialogs/PlaceFormDialog";
import { ProphecyDialog } from "./components/dialogs/ProphecyDialog";
import { WaterCupDialog } from "./components/dialogs/WaterCupDialog";
import { ChainDivider } from "./components/layout/ChainDivider";
import { FishingLine } from "./components/layout/FishingLine";
import { Hero } from "./components/layout/Hero";
import { NavBar } from "./components/layout/NavBar";
import { SiteFooter } from "./components/layout/SiteFooter";
import { PlaceListSection } from "./components/list/PlaceListSection";
import { LoginGate } from "./components/login/LoginGate";
import { PlaceRing } from "./components/ring/PlaceRing";
import { RevealAnimation } from "./components/secret/RevealAnimation";
import { SealedPlaceDialog } from "./components/secret/SealedPlaceDialog";

/** Which dialog is open. Only one at a time. */
const DIALOGS = {
  none: null,
  placeForm: "placeForm",
  placeDetail: "placeDetail",
  prophecy: "prophecy",
  jajanken: "jajanken",
  waterCup: "waterCup",
};

export default function App() {
  const showToast = useToast();
  const prefersReducedMotion = usePrefersReducedMotion();
  const { currentPlayer, token, checkPassword, logIn, logOut } = useSession();
  const { places, isLoaded, nextLotNumber, addPlace, updatePlace, removePlace } = usePlaces({ token, onUnauthorized: logOut });
  const readMapLink = useCallback((url) => resolveMapLink(url, token), [token]);

  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0);
  const [statusFilter, setStatusFilter] = useState("all");
  const [openDialog, setOpenDialog] = useState(DIALOGS.none);
  const [detailPlaceId, setDetailPlaceId] = useState(null);
  const [placeToEdit, setPlaceToEdit] = useState(null);
  const [revealingPlace, setRevealingPlace] = useState(null);

  const pageRef = useRef(null);
  const ringSectionRef = useRef(null);

  const selectedCategory = CATEGORIES[selectedCategoryIndex];
  const isInSelectedCategory = (place) => selectedCategory.key === "all" || place.category === selectedCategory.key;
  const placesInCategory = places.filter(isInSelectedCategory);
  const sharedPlaces = places.filter(isSharedPlace);
  const pendingPlaces = sharedPlaces.filter((place) => place.status !== PLACE_STATUS.visited);
  const visitedCount = sharedPlaces.length - pendingPlaces.length;
  const detailPlace = openDialog === DIALOGS.placeDetail ? places.find((place) => place.id === detailPlaceId) || null : null;
  const sealedDetailPlace = detailPlace?.isSealed ? detailPlace : null;
  const openDetailPlace = detailPlace?.isSealed ? null : detailPlace;

  const statsText = isLoaded ? `${places.length} en la lista · ${visitedCount} visitados` : "Cargando la lista";
  const isLoggedIn = Boolean(currentPlayer);

  // Keep the page behind the login screen unreachable by keyboard and screen readers.
  useEffect(() => {
    if (pageRef.current) pageRef.current.inert = !isLoggedIn;
  }, [isLoggedIn]);

  // If the place being viewed gets deleted, close its dialog.
  useEffect(() => {
    if (openDialog === DIALOGS.placeDetail && isLoaded && !places.some((place) => place.id === detailPlaceId)) {
      setOpenDialog(DIALOGS.none);
    }
  }, [places, openDialog, detailPlaceId, isLoaded]);

  function closeDialog() {
    setOpenDialog(DIALOGS.none);
  }

  function openPlaceDetail(placeId) {
    setDetailPlaceId(placeId);
    setOpenDialog(DIALOGS.placeDetail);
  }

  function openPlaceForm(place = null) {
    setPlaceToEdit(place);
    setOpenDialog(DIALOGS.placeForm);
  }

  function selectCategoryByKey(categoryKey) {
    const categoryIndex = findCategoryIndex(categoryKey);
    if (categoryIndex >= 0) setSelectedCategoryIndex(categoryIndex);
  }

  async function handleSavePlace(formValues) {
    try {
      if (placeToEdit) {
        await updatePlace(placeToEdit.id, formValues);
        showToast("Cambios guardados");
      } else {
        await addPlace({ ...formValues, lot: nextLotNumber, rating: 0, createdAt: Date.now() });
        showToast(formValues.isSecret ? `秘密 · ${formValues.name} quedó sellado` : `いただきます · ${formValues.name} va a la lista`);
        selectCategoryByKey(formValues.category);
      }
      closeDialog();
    } catch {
      showToast("No se pudo guardar. Intenta de nuevo");
    }
  }

  async function handleRatePlace(place, newRating) {
    try {
      await updatePlace(place.id, { rating: newRating });
    } catch {
      showToast("No se pudo guardar");
    }
  }

  async function handleToggleVisited(place) {
    const isVisited = place.status === PLACE_STATUS.visited;
    try {
      await updatePlace(place.id, { status: isVisited ? PLACE_STATUS.pending : PLACE_STATUS.visited });
      showToast(isVisited ? "De vuelta en pendientes" : "Gain! · ごちそうさま");
    } catch {
      showToast("No se pudo guardar");
    }
  }

  async function handleDeletePlace(place) {
    try {
      await removePlace(place.id);
      closeDialog();
      showToast(`${place.name || "Lugar"} salió de la lista`);
    } catch {
      showToast("No se pudo borrar");
    }
  }

  async function handleRevealPlace(place) {
    try {
      await updatePlace(place.id, { isSecret: false });
      closeDialog();
      if (prefersReducedMotion) showToast(`ドン · ${place.name} ya es de los dos`);
      else setRevealingPlace({ ...place, isSecret: false });
    } catch {
      showToast("No se pudo revelar. Intenten de nuevo");
    }
  }

  function handleRevealDone() {
    showToast(`ドン · ${revealingPlace.name} ya es de los dos`);
    setRevealingPlace(null);
  }

  function handleShowCategoryFromCup(categoryKey) {
    closeDialog();
    selectCategoryByKey(categoryKey);
    ringSectionRef.current?.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "center" });
  }

  function handleAuthenticated(playerKey) {
    logIn(playerKey);
    showToast(`ようこそ · bienvenido, ${PEOPLE[playerKey]}`);
  }

  return (
    <>
      <div ref={pageRef}>
        <NavBar statsText={statsText} isLoggedIn={isLoggedIn} onLogOut={logOut} onAddPlace={() => openPlaceForm()} />
        <Hero />
        <ChainDivider seed={0} />
        <CategoryDial
          selectedIndex={selectedCategoryIndex}
          onSelectIndex={setSelectedCategoryIndex}
          placesInCategoryCount={placesInCategory.length}
          isLoaded={isLoaded}
          onOpenProphecy={() => setOpenDialog(DIALOGS.prophecy)}
          onOpenJajanken={() => setOpenDialog(DIALOGS.jajanken)}
          onOpenWaterCup={() => setOpenDialog(DIALOGS.waterCup)}
        />
        <div ref={ringSectionRef}>
          <PlaceRing
            places={placesInCategory}
            categoryKey={selectedCategory.key}
            isLoaded={isLoaded}
            onOpenPlace={openPlaceDetail}
            onAddPlace={() => openPlaceForm()}
          />
        </div>
        <ChainDivider seed={2.7} />
        <PlaceListSection
          places={places}
          isLoaded={isLoaded}
          statusFilter={statusFilter}
          onChangeStatusFilter={setStatusFilter}
          onOpenPlace={openPlaceDetail}
        />
        <SiteFooter />
        <FishingLine />

        <PlaceFormDialog
          isOpen={openDialog === DIALOGS.placeForm}
          placeToEdit={placeToEdit}
          defaultCategoryKey={selectedCategory.key !== "all" ? selectedCategory.key : "pizza"}
          defaultProposer={currentPlayer || "both"}
          onSave={handleSavePlace}
          onResolveMapLink={readMapLink}
          onClose={closeDialog}
        />
        <PlaceDetailDialog
          place={openDetailPlace}
          onClose={closeDialog}
          onRate={handleRatePlace}
          onToggleVisited={handleToggleVisited}
          onEdit={(place) => openPlaceForm(place)}
          onDelete={handleDeletePlace}
          onReveal={handleRevealPlace}
        />
        <SealedPlaceDialog place={sealedDetailPlace} onClose={closeDialog} />
        <ProphecyDialog
          isOpen={openDialog === DIALOGS.prophecy}
          candidatePlaces={pendingPlaces.filter(isInSelectedCategory)}
          fallbackPlaces={pendingPlaces}
          onClose={closeDialog}
          onOpenPlace={openPlaceDetail}
        />
        <JajankenDialog isOpen={openDialog === DIALOGS.jajanken} onClose={closeDialog} />
        <WaterCupDialog
          isOpen={openDialog === DIALOGS.waterCup}
          defaultPlayer={currentPlayer}
          onClose={closeDialog}
          onShowCategory={handleShowCategoryFromCup}
        />
      </div>

      {revealingPlace && <RevealAnimation place={revealingPlace} onDone={handleRevealDone} />}
      {!isLoggedIn && <LoginGate checkPassword={checkPassword} onAuthenticated={handleAuthenticated} />}
    </>
  );
}
