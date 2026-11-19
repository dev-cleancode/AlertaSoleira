const gerarHash = async (texto) => {
  const dados = new TextEncoder().encode(texto);
  const buffer = await crypto.subtle.digest("SHA-256", dados);
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

export default gerarHash;