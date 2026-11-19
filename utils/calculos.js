const LIMITE_ATENCAO = 0.6;
const LIMITE_PERIGO = 0.85;
const MINUTOS_PERIGO = 30;
const LEITURAS_PARA_MEDIA = 4;

const calcularTaxa = (leituras) => {
  if (leituras.length < 2) return null;

  const recentes = leituras.slice(-LEITURAS_PARA_MEDIA);
  const taxas = [];
  for (let i = 1; i < recentes.length; i++) {
    const variacaoNivel = recentes[i].nivel - recentes[i - 1].nivel;
    const variacaoTempo = recentes[i].minuto - recentes[i - 1].minuto;
    taxas.push(variacaoNivel / variacaoTempo);
  }

  return taxas.reduce((soma, taxa) => soma + taxa, 0) / taxas.length;
};

const calcularTempoAteSoleira = (nivel, soleira, taxa) => {
  if (nivel >= soleira) return 0;
  if (taxa === null || taxa <= 0) return null;
  return (soleira - nivel) / taxa;
};

const classificarSituacao = (nivel, soleira, tempoRestante) => {
  const proporcao = nivel / soleira;

  if (proporcao >= LIMITE_PERIGO) return "PERIGO";
  if (tempoRestante !== null && tempoRestante <= MINUTOS_PERIGO) return "PERIGO";
  if (proporcao >= LIMITE_ATENCAO) return "ATENÇÃO";
  return "SEGURO";
};

const ORIENTACOES = {
  SEGURO: "Sem risco por enquanto. Continue acompanhando o nível.",
  "ATENÇÃO": "A água está subindo. Separe os produtos que ficam no chão.",
  PERIGO: "Risco de alagar a loja! Suba a mercadoria e proteja os equipamentos.",
};

const analisarLoja = (loja) => {
  const leituras = loja.leituras;
  if (leituras.length === 0) return null;

  const nivel = leituras[leituras.length - 1].nivel;
  const taxa = calcularTaxa(leituras);
  const tempo = calcularTempoAteSoleira(nivel, loja.soleira, taxa);
  const situacao = classificarSituacao(nivel, loja.soleira, tempo);

  return { nivel, taxa, tempo, situacao, orientacao: ORIENTACOES[situacao] };
};

export default analisarLoja;