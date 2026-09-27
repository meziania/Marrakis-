const words = [
  "Zero",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
];

function countWord(count: number) {
  return words[count] ?? String(count);
}

export function heroSupport(count: number) {
  if (count <= 0) {
    return "Heritage formulas, crafted for a modern hammam ritual at home.";
  }
  if (count === 1) {
    return "One heritage formula, crafted for a modern hammam ritual at home.";
  }
  return `${countWord(count)} heritage formulas, crafted for a modern hammam ritual at home.`;
}

export function homeCollectionTitle(count: number) {
  if (count <= 0) return "The collection";
  if (count === 1) return "One essential";
  return `${countWord(count)} essentials`;
}

export function shopIntro(count: number) {
  if (count <= 0) return "New formulas are on the way.";
  if (count === 1) return "One formula for a home hammam ritual.";
  return `${countWord(count)} formulas for a complete home hammam ritual.`;
}
