/** Pieces used to write the dinner prophecy. */
export const MOON_PHASES = ["la luna nueva", "la luna creciente", "la luna llena", "la luna menguante"];
export const TIMES_OF_NIGHT = ["Cuando caiga el sol", "Antes de medianoche", "Con la ciudad despierta", "Cuando el hambre apriete"];

/** Water divination results: one per Nen type, each pointing to a food category. */
export const NEN_TYPES = [
  { key: "enhancer", japaneseName: "強化系", name: "Potenciador", effect: "¡El agua subió de nivel!", description: "Como Gon: directo, con hambre y sin complicaciones.", categoryKey: "burger" },
  { key: "transmuter", japaneseName: "変化系", name: "Transmutador", effect: "El agua ahora sabe dulce.", description: "Como Killua (y Hisoka ♠): impredecible y con antojo de algo dulce.", categoryKey: "dessert" },
  { key: "emitter", japaneseName: "放出系", name: "Emisor", effect: "El agua cambió de color.", description: "Como los jugadores de quemados de Greed Island: mucha energía para compartir la mesa.", categoryKey: "bar" },
  { key: "conjurer", japaneseName: "具現化系", name: "Conjurador", effect: "Aparecieron pequeñas partículas en el agua.", description: "Como Kurapika y sus cadenas: precisos, saben exactamente qué pedir.", categoryKey: "ramen" },
  { key: "manipulator", japaneseName: "操作系", name: "Manipulador", effect: "La hoja empezó a girar sola.", description: "Como Shalnark en York New: deciden el plan y todos los siguen.", categoryKey: "cafe" },
  { key: "specialist", japaneseName: "特質系", name: "Especialista", effect: "Pasó algo que nadie esperaba.", description: "Como los ojos escarlata de Kurapika: únicos, no caben en ninguna categoría.", categoryKey: "tacos" },
];

/** Rock, paper, scissors hands. Each one beats the hand named in "beats". */
export const HANDS = [
  { key: "rock", japaneseName: "グー", name: "Piedra", beats: "scissors" },
  { key: "scissors", japaneseName: "チョキ", name: "Tijera", beats: "paper" },
  { key: "paper", japaneseName: "パー", name: "Papel", beats: "rock" },
];
