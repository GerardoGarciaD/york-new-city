/**
 * The two travelers. Change the display names here and they update everywhere.
 * The keys ("firstPlayer", "secondPlayer", "both") are what gets saved with each place.
 */
export const PEOPLE = {
  firstPlayer: "LM",
  secondPlayer: "GG",
  both: "Los dos",
};

export const PLAYER_KEYS = ["firstPlayer", "secondPlayer"];

export function getPersonName(personKey) {
  return PEOPLE[personKey] || "";
}
