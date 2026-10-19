import { useEffect, useRef, useState } from "react";
import { findCategory } from "../../config/categories";
import { PLACE_STATUS, STATUS_LABELS } from "../../config/places";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { getMapPoint } from "../../utils/maps";

const NEW_YORK_CENTER = [40.7306, -73.9866];
const NEW_YORK_ZOOM = 12;
const MAX_FIT_ZOOM = 15;
const FIT_PADDING_PX = 52;
const PIN_SIZE = [36, 44];
const PIN_TIP = [18, 44];
const POPUP_PAN_PADDING = [56, 56];
// Standard OpenStreetMap tiles: free and keyless for light use like this (CARTO's now ask for an API key).
// gourmet-map.css softens their colors to sit on the paper look.
const TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

/** Pin in the category's color with its kanji; visited places get the 済 stamp like the cards' hanko. */
function buildPinHtml(place) {
  const category = findCategory(place.category);
  const isVisited = place.status === PLACE_STATUS.visited;
  return (
    `<span class="map-pin${isVisited ? " visited" : ""}" style="--c:${category.color};--t:${category.textColor}">` +
    `<span class="map-pin-kanji">${category.kanji}</span>` +
    (isVisited ? '<span class="map-pin-stamp">済</span>' : "") +
    "</span>"
  );
}

/** Popup built with DOM nodes (not HTML strings) so a place name can never inject markup. */
function buildPopup(place, onOpenPlace) {
  const category = findCategory(place.category);
  const popup = document.createElement("div");
  popup.className = "map-popup";
  const eyebrow = document.createElement("span");
  eyebrow.className = "map-popup-eyebrow";
  eyebrow.textContent = `${category.name} · ${STATUS_LABELS[place.status] || ""}`;
  const name = document.createElement("strong");
  name.className = "map-popup-name";
  name.textContent = place.name;
  const openButton = document.createElement("button");
  openButton.type = "button";
  openButton.className = "btn map-popup-open";
  openButton.textContent = "Ver lugar";
  openButton.addEventListener("click", () => onOpenPlace(place.id));
  popup.append(eyebrow, name, openButton);
  return popup;
}

/**
 * Leaflet map (OpenStreetMap tiles, no API key) with one pin per place that has a point.
 * Leaflet loads only when this section mounts, so it doesn't slow down the first paint.
 */
export function GourmetMap({ places, onOpenPlace }) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const pinLayerRef = useRef(null);
  const lastFittedSignatureRef = useRef("");
  const onOpenPlaceRef = useRef(onOpenPlace);
  const placesRef = useRef(places);
  const [leaflet, setLeaflet] = useState(null);

  onOpenPlaceRef.current = onOpenPlace;
  placesRef.current = places;
  // Redraw only when something the pins show changes, so an open popup survives refreshes and re-renders.
  const pinsSignature = places
    .map((place) => {
      const mapPoint = getMapPoint(place);
      return mapPoint ? `${place.id}:${mapPoint.lat},${mapPoint.lng}:${place.status}:${place.category}:${place.name}` : "";
    })
    .join("|");

  // Create the map once.
  useEffect(() => {
    let isCancelled = false;
    Promise.all([import("leaflet"), import("leaflet/dist/leaflet.css")]).then(([leafletModule]) => {
      if (isCancelled || !containerRef.current) return;
      const leafletLibrary = leafletModule.default;
      const map = leafletLibrary.map(containerRef.current, {
        center: NEW_YORK_CENTER,
        zoom: NEW_YORK_ZOOM,
        scrollWheelZoom: false,
        zoomControl: false,
        zoomAnimation: !prefersReducedMotion,
        fadeAnimation: !prefersReducedMotion,
        markerZoomAnimation: !prefersReducedMotion,
      });
      // Zoom buttons on the right so they never cover a popup opened near the top-left.
      leafletLibrary.control.zoom({ position: "topright" }).addTo(map);
      leafletLibrary.tileLayer(TILE_URL, { attribution: TILE_ATTRIBUTION, maxZoom: 19 }).addTo(map);
      mapRef.current = map;
      pinLayerRef.current = leafletLibrary.layerGroup().addTo(map);
      setLeaflet(leafletLibrary);
    });
    return () => {
      isCancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Redraw the pins when what they show changes.
  useEffect(() => {
    if (!leaflet || !mapRef.current) return;
    const pinLayer = pinLayerRef.current;
    pinLayer.clearLayers();
    const placedPoints = [];
    placesRef.current.forEach((place) => {
      const mapPoint = getMapPoint(place);
      if (!mapPoint) return;
      const pinIcon = leaflet.divIcon({ className: "map-pin-icon", html: buildPinHtml(place), iconSize: PIN_SIZE, iconAnchor: PIN_TIP, popupAnchor: [0, -PIN_TIP[1]] });
      leaflet
        .marker([mapPoint.lat, mapPoint.lng], { icon: pinIcon, title: place.name, keyboard: true })
        .bindPopup(() => buildPopup(place, (placeId) => onOpenPlaceRef.current(placeId)), { autoPanPadding: POPUP_PAN_PADDING })
        .addTo(pinLayer);
      placedPoints.push([mapPoint.lat, mapPoint.lng]);
    });

    // Only re-frame when the set of pins changes, not on every refresh from the other phone.
    const pinSignature = placedPoints.map((point) => point.join(",")).join("|");
    if (pinSignature === lastFittedSignatureRef.current) return;
    lastFittedSignatureRef.current = pinSignature;
    if (placedPoints.length) mapRef.current.fitBounds(placedPoints, { padding: [FIT_PADDING_PX, FIT_PADDING_PX], maxZoom: MAX_FIT_ZOOM, animate: !prefersReducedMotion });
    else mapRef.current.setView(NEW_YORK_CENTER, NEW_YORK_ZOOM);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leaflet, pinsSignature]);

  return <div ref={containerRef} className="gourmet-map" role="region" aria-label="Mapa de los lugares" />;
}
