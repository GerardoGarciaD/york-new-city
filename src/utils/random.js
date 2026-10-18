export function pickRandom(items) {
  return items[Math.floor(Math.random() * items.length)];
}

/** Same text in, same sequence out: a tiny repeatable random generator (0 to 1). */
export function createSeededRandom(seedText) {
  let state = [...String(seedText)].reduce((hash, character) => (Math.imul(hash, 31) + character.charCodeAt(0)) | 0, 7);
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) | 0;
    return (state >>> 0) / 4294967296;
  };
}
