/** SHA-256 of a text, as a lowercase hex string. */
export async function sha256Hex(text) {
  const encodedText = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", encodedText);
  return [...new Uint8Array(digest)].map((byteValue) => byteValue.toString(16).padStart(2, "0")).join("");
}
