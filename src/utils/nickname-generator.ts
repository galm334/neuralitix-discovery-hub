const adjectives = [
  "Happy", "Clever", "Swift", "Bright", "Noble",
  "Brave", "Wise", "Kind", "Quick", "Smart"
];

const nouns = [
  "Fox", "Eagle", "Lion", "Wolf", "Bear",
  "Tiger", "Hawk", "Owl", "Deer", "Dolphin"
];

export const generateNickname = (): string => {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 100);
  
  return `${adjective}${noun}${number}`;
};