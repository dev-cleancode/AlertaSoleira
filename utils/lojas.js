import analisarLoja from "./calculos";

const STATUS_VALIDOS = ["SEGURO", "ATENÇÃO", "PERIGO"];

const normalizarLoja = (loja) => {
  const leituras = loja.leituras || [];
  const avisos = loja.avisos || [];
  return {
    ...loja,
    leituras,
    avisos,
    analise: analisarLoja({ ...loja, leituras }),
  };
};

const montarDados = (loja, mudancas) => {
  const { id, analise, ...dados } = loja;
  return { ...dados, ...mudancas };
};

const situacaoDaLoja = (loja) => {
  if (STATUS_VALIDOS.includes(loja.statusManual)) return loja.statusManual;
  if (loja.analise) return loja.analise.situacao;
  return "SEM_LEITURAS";
};

const validarDadosLoja = (dados) => {
  const soleira = Number(dados.soleira);
  const digitos = dados.telefone.replace(/\D/g, "");

  if (!dados.nome.trim() || !dados.bairro.trim()) {
    return "Preencha o nome da loja e o bairro.";
  }
  if (!soleira || soleira < 1 || soleira > 50) {
    return "A altura da soleira deve ficar entre 1 e 50 cm.";
  }
  if (digitos.length < 10 || digitos.length > 11) {
    return "Informe o WhatsApp com DDD (10 ou 11 números).";
  }
  return "";
};

export {
  STATUS_VALIDOS,
  normalizarLoja,
  montarDados,
  situacaoDaLoja,
  validarDadosLoja,
};