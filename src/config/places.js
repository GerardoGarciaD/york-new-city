export const BOROUGHS = ["Manhattan", "Brooklyn", "Queens", "Bronx", "Staten Island"];

export const PLACE_STATUS = {
  pending: "quiero",
  visited: "fui",
};

export const STATUS_LABELS = {
  [PLACE_STATUS.pending]: "Pendiente",
  [PLACE_STATUS.visited]: "Visitado",
};

export const STATUS_FILTERS = [
  { value: "all", label: "Todos" },
  { value: PLACE_STATUS.pending, label: "Pendientes" },
  { value: PLACE_STATUS.visited, label: "Visitados" },
];

/**
 * Secret places (秘密) stay out of the prophecy, the arena and the visited count until revealed,
 * for both travelers, so neither screen gives the surprise away.
 * A place with isSealed is someone else's secret: the server only sent its lot number and owner.
 */
export function isSharedPlace(place) {
  return !place.isSecret;
}

/** Heavens Arena: each visited place climbs this many floors, up to the goal. */
export const ARENA_FLOORS_PER_VISIT = 10;
export const ARENA_GOAL_FLOOR = 200;

/** Places loaded the very first time, so the page doesn't start empty. Delete them from the page anytime. */
export const EXAMPLE_PLACES = [
  { id: "ex-joes", name: "Joe's Pizza", category: "pizza", borough: "Manhattan", neighborhood: "Greenwich Village", price: 1, status: "quiero", rating: 0, notes: "Rebanada clásica de queso, para comer de pie.", url: "", isExample: true, lot: 1, proposedBy: "firstPlayer", createdAt: 1 },
  { id: "ex-katz", name: "Katz's Delicatessen", category: "deli", borough: "Manhattan", neighborhood: "Lower East Side", price: 3, status: "quiero", rating: 0, notes: "Sándwich de pastrami.", url: "", isExample: true, lot: 2, proposedBy: "secondPlayer", createdAt: 2 },
  { id: "ex-lostacos", name: "Los Tacos No.1", category: "tacos", borough: "Manhattan", neighborhood: "Chelsea Market", price: 1, status: "fui", rating: 5, notes: "Adobada en tortilla de harina.", url: "", isExample: true, lot: 3, proposedBy: "both", createdAt: 3 },
  { id: "ex-xian", name: "Xi'an Famous Foods", category: "ramen", borough: "Queens", neighborhood: "Flushing", price: 1, status: "quiero", rating: 0, notes: "Fideos de cordero picante.", url: "", isExample: true, lot: 4, proposedBy: "secondPlayer", createdAt: 4 },
  { id: "ex-russ", name: "Russ & Daughters", category: "brunch", borough: "Manhattan", neighborhood: "Lower East Side", price: 2, status: "quiero", rating: 0, notes: "Bagel con salmón ahumado.", url: "", isExample: true, lot: 5, proposedBy: "firstPlayer", createdAt: 5 },
  { id: "ex-difara", name: "Di Fara Pizza", category: "pizza", borough: "Brooklyn", neighborhood: "Midwood", price: 2, status: "quiero", rating: 0, notes: "", url: "", isExample: true, lot: 6, proposedBy: "both", createdAt: 6 },
];
