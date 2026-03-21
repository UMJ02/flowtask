export function generateShareToken(length = 32) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  return Array.from({ length }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
}
