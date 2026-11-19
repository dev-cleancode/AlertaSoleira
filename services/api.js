import axios from "axios";

const api = axios.create({
  baseURL: "https://6ae9fb193d3dd3d37be5fdad.mockapi.io",
});

const buscarLojasPorEmail = async (email) => {
  try {
    const resposta = await api.get("/lojas", { params: { email } });
    return resposta.data.filter((loja) => loja.email === email);
  } catch (e) {
    if (e.response && e.response.status === 404) return [];
    throw e;
  }
};

export { buscarLojasPorEmail };
export default api;