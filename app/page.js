"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "./context/AuthContext";
import api, { buscarLojasPorEmail } from "../services/api";
import gerarHash from "../utils/hash";
import {
  normalizarLoja,
  situacaoDaLoja,
  validarDadosLoja,
} from "../utils/lojas";
import CampoFormulario from "./components/CampoFormulario";
import CardLoja from "./components/CardLoja";

// Troque o alt e a legenda para combinar com as fotos que você escolher
const FOTOS_ALAGAMENTO = [
  {
    src: "/imagens/alagamento-1.jpg",
    alt: "Rua alagada em São Paulo durante a chuva",
    legenda: "A rua some debaixo d'água.",
  },
  {
    src: "/imagens/alagamento-2.jpg",
    alt: "Loja de rua com água na porta",
    legenda: "A água chega na porta da loja.",
  },
  {
    src: "/imagens/alagamento-3.jpg",
    alt: "Avenida alagada depois de chuva forte",
    legenda: "Quando o dono percebe, já é tarde.",
  },
];

const TABELA_CHUVA = [
  ["10", "2,440", "146,4", "24,4"],
  ["30", "1,534", "92,0", "46,0"],
  ["60", "1,001", "60,1", "60,1"],
  ["120", "0,602", "36,1", "72,3"],
  ["360", "0,243", "14,6", "87,6"],
  ["1440", "0,072", "4,3", "103,3"],
];

const TABELA_SENSIBILIDADE = [
  ["0,4", "20,0", "348,3", "Não alaga durante a chuva de 60 min"],
  ["0,5", "25,0", "80,3", "Não alaga durante a chuva de 60 min"],
  ["0,6", "30,0", "54,8", "Alaga durante a chuva de projeto"],
  ["0,7", "35,0", "42,3", "Alaga durante a chuva de projeto"],
  ["0,8", "40,0", "34,6", "Alaga durante a chuva de projeto"],
];

const FORM_VAZIO = {
  nome: "",
  bairro: "",
  soleira: "",
  telefone: "",
  email: "",
  senha: "",
};

const Home = () => {
  const router = useRouter();
  const { usuario, iniciarSessao } = useAuth();
  const [lojas, setLojas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [form, setForm] = useState(FORM_VAZIO);
  const [enviando, setEnviando] = useState(false);
  const [mensagemForm, setMensagemForm] = useState({ tipo: "", texto: "" });
  const [calculoAberto, setCalculoAberto] = useState(false);

  useEffect(() => {
    const carregarLojas = async () => {
      try {
        const resposta = await api.get("/lojas");
        setLojas(resposta.data.map(normalizarLoja));
      } catch (e) {
        setErro("Não foi possível carregar as lojas.");
      } finally {
        setCarregando(false);
      }
    };
    carregarLojas();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = form.email.trim().toLowerCase();

    const erroDados = validarDadosLoja(form);
    if (erroDados) {
      setMensagemForm({ tipo: "erro", texto: erroDados });
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setMensagemForm({ tipo: "erro", texto: "Informe um e-mail válido." });
      return;
    }
    if (form.senha.length < 6) {
      setMensagemForm({
        tipo: "erro",
        texto: "A senha precisa ter pelo menos 6 caracteres.",
      });
      return;
    }

    setEnviando(true);
    try {
      const existentes = await buscarLojasPorEmail(email);
      if (existentes.length > 0) {
        setMensagemForm({
          tipo: "erro",
          texto: "Esse e-mail já está cadastrado. Use a opção Entrar.",
        });
        return;
      }

      const senhaHash = await gerarHash(`${email}:${form.senha}`);
      const resposta = await api.post("/lojas", {
        nome: form.nome.trim(),
        bairro: form.bairro.trim(),
        soleira: Number(form.soleira),
        telefone: form.telefone.trim(),
        email,
        senhaHash,
        leituras: [],
        avisos: [],
        statusManual: "",
      });

      const nova = resposta.data;
      if (!nova.email || !nova.senhaHash) {
        setMensagemForm({
          tipo: "erro",
          texto:
            "A API não guardou o e-mail e a senha. Crie os campos email e senhaHash (String) no recurso lojas do MockAPI e apague esta loja de teste.",
        });
        return;
      }

      setLojas([...lojas, normalizarLoja(nova)]);
      iniciarSessao(nova);
      setForm(FORM_VAZIO);
      setMensagemForm({ tipo: "", texto: "" });
      router.push(`/loja/${nova.id}`);
    } catch (erroRegistro) {
      setMensagemForm({
        tipo: "erro",
        texto: "Não foi possível registrar a loja. Tente novamente.",
      });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main>
      {/* Hero */}
      <section
        id="inicio"
        className="relative scroll-mt-16 overflow-hidden bg-agua-900 text-white"
      >
        <Image
          src="/imagens/hero.jpg"
          alt="Rua de São Paulo tomada pela água da chuva"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-agua-900/80" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-4 py-20 md:py-32">
          <p className="text-sm font-semibold uppercase text-agua-100">
            AlertaSoleira
          </p>
          <h1 className="text-3xl font-bold md:text-6xl">
            A água vai chegar na sua porta. Você fica sabendo antes.
          </h1>
          <p className="max-w-2xl text-agua-100 md:text-xl">
            Um aviso feito para o comerciante de rua: quanto tempo falta para a
            água chegar na soleira da sua loja, para dar tempo de proteger o
            estoque.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href="#registro"
              className="rounded-md bg-white px-6 py-3 text-center font-semibold text-agua-700 hover:bg-agua-100"
            >
              Registrar minha loja
            </a>
            <a
              href="#lojas"
              className="rounded-md border border-white px-6 py-3 text-center font-semibold text-white hover:bg-agua-700"
            >
              Ver lojas
            </a>
          </div>
        </div>
      </section>

      {/* Introdução */}
      <section
        id="introducao"
        className="mx-auto max-w-6xl scroll-mt-16 px-4 py-12 md:py-16"
      >
        <h2 className="text-2xl font-bold text-agua-700 md:text-3xl">
          O que é o AlertaSoleira
        </h2>
        <p className="mt-4 max-w-3xl text-slate-700">
          O AlertaSoleira é um sistema de alerta de alagamento pensado para
          lojas de rua. Um sensor instalado na frente da loja mede o nível da
          água, a central calcula a velocidade da subida e indica em que estado
          a loja está: seguro, atenção ou perigo. O comerciante não precisa
          instalar nada, só receber o aviso.
        </p>
      </section>

      {/* Problema */}
      <section id="problema" className="scroll-mt-16 bg-slate-900 text-white">
        <div className="mx-auto max-w-6xl px-4 py-12 md:py-20">
          <p className="text-sm font-semibold uppercase text-red-400">
            O problema
          </p>
          <h2 className="mt-2 text-3xl font-bold md:text-5xl">
            Em minutos, a rua vira rio.
          </h2>
          <p className="mt-6 max-w-3xl text-lg text-slate-300">
            Você levantou a porta de ferro de manhã, arrumou o estoque nas
            prateleiras de baixo e foi atender. Lá fora, a chuva apertou. Ninguém
            avisou que a água estava subindo na sua rua. Quando alguém percebe,
            ela já está na soleira, e anos de trabalho estão boiando no chão da
            loja.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {FOTOS_ALAGAMENTO.map((foto) => (
              <div
                key={foto.src}
                className="relative h-64 overflow-hidden rounded-lg md:h-80"
              >
                <Image
                  src={foto.src}
                  alt={foto.alt}
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover"
                />
                <p className="absolute inset-x-0 bottom-0 bg-black/60 p-3 text-sm font-medium text-white">
                  {foto.legenda}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-slate-700 bg-slate-800 p-5">
              <p className="text-sm font-bold uppercase text-red-400">
                1. Ninguém avisa
              </p>
              <p className="mt-2 text-slate-300">
                Os alertas da Defesa Civil e dos aplicativos de mapa falam da
                cidade ou do bairro inteiro. Nenhum diz que a água vai chegar na
                SUA porta.
              </p>
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-800 p-5">
              <p className="text-sm font-bold uppercase text-red-400">
                2. Não dá tempo
              </p>
              <p className="mt-2 text-slate-300">
                A água sobe mais rápido no começo da chuva. Quando o nível
                parece baixo, já restam poucos minutos para reagir.
              </p>
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-800 p-5">
              <p className="text-sm font-bold uppercase text-red-400">
                3. Tudo se perde
              </p>
              <p className="mt-2 text-slate-300">
                Estoque estragado, equipamento molhado, loja fechada. O prejuízo
                chega antes de qualquer ajuda.
              </p>
            </div>
          </div>

          <p className="mt-10 text-xl font-bold md:text-2xl">
            O comerciante só percebe quando a água já está na porta.
          </p>
        </div>
      </section>

      {/* Solução */}
      <section
        id="solucao"
        className="mx-auto max-w-6xl scroll-mt-16 px-4 py-12 md:py-16"
      >
        <h2 className="text-2xl font-bold text-agua-700 md:text-3xl">
          A solução
        </h2>
        <p className="mt-4 max-w-3xl text-slate-700">
          Um sensor mede o nível da água em frente à loja e a central calcula o
          tempo estimado até ela chegar na soleira. Quando a situação piora, o
          comerciante recebe uma mensagem no WhatsApp. O sistema classifica a
          loja em três estados:
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-green-600 p-4 text-white">
            <h3 className="font-bold">SEGURO</h3>
            <p className="mt-2 text-sm">
              Nível baixo e estável. Nenhuma ação necessária.
            </p>
          </div>
          <div className="rounded-lg bg-yellow-500 p-4 text-white">
            <h3 className="font-bold">ATENÇÃO</h3>
            <p className="mt-2 text-sm">
              O nível passou de 60% da soleira. Hora de se preparar.
            </p>
          </div>
          <div className="rounded-lg bg-red-600 p-4 text-white">
            <h3 className="font-bold">PERIGO</h3>
            <p className="mt-2 text-sm">
              O nível passou de 85% da soleira ou faltam 30 minutos ou menos
              para a água chegar nela.
            </p>
          </div>
        </div>
      </section>

      {/* Cálculos */}
      <section id="calculos" className="scroll-mt-16 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
          <h2 className="text-2xl font-bold text-agua-700 md:text-3xl">
            A matemática por trás do aviso
          </h2>
          <p className="mt-4 max-w-3xl text-slate-700">
            O aviso não é palpite: ele vem de um modelo com limites, derivadas e
            integrais. Abra a caixa para ver os cálculos do relatório técnico.
          </p>

          <div className="mt-8 rounded-lg border border-agua-100 bg-agua-50">
            <button
              type="button"
              onClick={() => setCalculoAberto(!calculoAberto)}
              aria-expanded={calculoAberto}
              className="flex w-full items-center justify-between gap-4 p-4 text-left md:p-6"
            >
              <span>
                <span className="block text-lg font-bold text-agua-700">
                  Relatório técnico de modelagem matemática
                </span>
                <span className="block text-sm text-slate-600">
                  {calculoAberto
                    ? "Clique para ocultar os cálculos"
                    : "Clique para ver os cálculos"}
                </span>
              </span>
              <span className="text-3xl font-bold text-agua-700">
                {calculoAberto ? "−" : "+"}
              </span>
            </button>

            {calculoAberto && (
              <div className="flex flex-col gap-8 border-t border-agua-100 p-4 text-slate-700 md:p-6">
                {/* Resumo */}
                <div className="border-l-4 border-yellow-500 bg-yellow-50 p-4 text-sm">
                  <p className="font-bold text-slate-900">Resumo</p>
                  <p className="mt-2">
                    Em uma chuva forte de São Paulo (período de retorno de 10
                    anos), a água na rua chega à soleira de 20 cm após 54,8 min.
                    Para o comerciante ter 30 min para reagir, o alerta precisa
                    sair aos 24,8 min de chuva, quando a água ainda está em só
                    11,8 cm. Essa conclusão depende de dois valores assumidos, e
                    não medidos (0,6 cm/mm e 0,02 por min). Calibrá-los com o
                    sensor é o principal próximo passo.
                  </p>
                </div>

                {/* Chuva */}
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    1. A chuva
                  </h3>
                  <p className="mt-2 text-sm">
                    Equação de chuvas intensas do posto IAG – Parque do Estado
                    (São Paulo), ajustada com 65 anos de dados (1933 a 1997),
                    para 10 ≤ d ≤ 1440 min e período de retorno de 10 anos:
                  </p>
                  <p className="mt-3 overflow-x-auto rounded-md bg-white p-3 font-mono text-sm text-slate-800">
                    i(d) = 39,3015 (d + 20)<sup>−0,9228</sup> + 14,518 (d + 20)
                    <sup>−0,8764</sup>
                  </p>
                  <p className="mt-3 text-sm">
                    Aqui, d é a duração da chuva (min), i(d) é a intensidade
                    média (mm/min) e P(d) = i(d) · d é a chuva acumulada (mm).
                  </p>
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-300 text-slate-900">
                          <th className="py-2 pr-4">Duração (min)</th>
                          <th className="py-2 pr-4">i(d) (mm/min)</th>
                          <th className="py-2 pr-4">i(d) (mm/h)</th>
                          <th className="py-2 pr-4">P(d) (mm)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {TABELA_CHUVA.map((linha) => (
                          <tr
                            key={linha[0]}
                            className="border-b border-slate-200"
                          >
                            {linha.map((celula, i) => (
                              <td key={i} className="py-2 pr-4">
                                {celula}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Nível */}
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    2. O nível da água
                  </h3>
                  <p className="mt-2 text-sm">
                    O nível h(t) cresce com a chuva (κ · i) e diminui com o
                    escoamento pelos bueiros (C · h). Para a chuva de projeto de
                    60 min, I = i(60) = 1,001 mm/min:
                  </p>
                  <p className="mt-3 overflow-x-auto rounded-md bg-white p-3 font-mono text-sm text-slate-800">
                    h′(t) = κ · I − C · h(t), com h(0) = 0
                    <br />
                    h(t) = H (1 − e<sup>−Ct</sup>), H = κ · I / C = 30,03 cm
                  </p>
                  <p className="mt-3 text-sm">
                    Os valores κ = 0,6 cm/mm (quanto o nível sobe por mm de
                    chuva) e C = 0,02 por min (rapidez do escoamento) são
                    hipóteses de trabalho, não foram medidos.
                  </p>
                </div>

                {/* Limites */}
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    3. Limites
                  </h3>
                  <p className="mt-3 overflow-x-auto rounded-md bg-white p-3 font-mono text-sm text-slate-800">
                    lim i(d) = 0 (d → ∞)
                    <br />
                    lim h(t) = H (1 − 0) = 30,03 cm (t → ∞)
                  </p>
                  <ul className="mt-3 flex list-disc flex-col gap-1 pl-5 text-sm">
                    <li>
                      Quanto mais longa a chuva, mais fraca ela é: 146 mm/h em
                      10 min contra 4,3 mm/h em 24 h. As chuvas curtas são as
                      mais intensas.
                    </li>
                    <li>
                      Como H = 30,03 cm é maior que a soleira S = 20 cm, a água
                      passa da soleira. O modelo vale só durante a chuva, até 60
                      min.
                    </li>
                  </ul>
                </div>

                {/* Derivadas */}
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    4. Derivadas
                  </h3>
                  <p className="mt-3 overflow-x-auto rounded-md bg-white p-3 font-mono text-sm text-slate-800">
                    h′(t) = C · H · e<sup>−Ct</sup> = 0,601 · e
                    <sup>−0,02 t</sup> cm/min
                    <br />
                    h″(t) = −C<sup>2</sup> · H · e<sup>−Ct</sup>
                    <br />
                    i′(d) = −36,267 (d + 20)<sup>−1,9228</sup> − 12,724 (d + 20)
                    <sup>−1,8764</sup>
                    <br />
                    P′(d) = i(d) + d · i′(d)
                  </p>
                  <ul className="mt-3 flex list-disc flex-col gap-1 pl-5 text-sm">
                    <li>
                      h′(t) &gt; 0: o nível sempre sobe. Como h″ &lt; 0, sobe
                      cada vez mais devagar.
                    </li>
                    <li>
                      i′(d) &lt; 0: a intensidade só diminui. P′(d) &gt; 0: a
                      chuva acumulada só aumenta.
                    </li>
                    <li>
                      Nenhuma derivada chega a zero, então não há ponto crítico,
                      máximo nem mínimo local. Os extremos ficam nas bordas do
                      intervalo.
                    </li>
                    <li>
                      h′(t) é a velocidade de subida da água: começa em 0,601
                      cm/min e chega à soleira com 0,20 cm/min, um terço da
                      inicial.
                    </li>
                    <li>
                      Em d = 60 min, a intensidade cai 0,68 mm/h a cada minuto a
                      mais de duração, e P′(60) = 0,319 mm/min: esticar a chuva
                      acrescenta cada vez menos água.
                    </li>
                  </ul>
                </div>

                {/* Integrais */}
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    5. Integrais
                  </h3>
                  <p className="mt-3 overflow-x-auto rounded-md bg-white p-3 font-mono text-sm text-slate-800">
                    ∫ C · H · e<sup>−Ct</sup> dt = −H · e<sup>−Ct</sup> + k
                    <br />
                    ∫<sub>0</sub>
                    <sup>T</sup> h′(t) dt = [−H · e<sup>−Ct</sup>]
                    <sub>0</sub>
                    <sup>T</sup> = h(T) = 20 cm
                    <br />
                    ∫<sub>0</sub>
                    <sup>T</sup> I dt = I · T = 1,001 · 54,8 ≈ 54,9 mm
                  </p>
                  <ul className="mt-3 flex list-disc flex-col gap-1 pl-5 text-sm">
                    <li>
                      A área sob h′(t) de 0 até T é a subida total do nível: 20
                      cm. O programa conferiu somando 10 000 faixas finas e
                      obteve 20,00 cm.
                    </li>
                    <li>
                      A área sob P′(d) de 10 a 60 min é a chuva extra ao esticar
                      a chuva: 35,65 mm = P(60) − P(10) = 60,06 − 24,40 mm.
                    </li>
                    <li>
                      A chuva que cai até a água chegar na soleira é 91% dos
                      60,06 mm da chuva de projeto: a loja alaga perto do fim da
                      tempestade.
                    </li>
                  </ul>
                </div>

                {/* Alerta */}
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    6. Quando o alerta precisa sair
                  </h3>
                  <p className="mt-2 text-sm">
                    A água chega na soleira quando h(T) = S:
                  </p>
                  <p className="mt-3 overflow-x-auto rounded-md bg-white p-3 font-mono text-sm text-slate-800">
                    T = −ln(1 − S / H) / C = −ln(1 − 20 / 30,03) / 0,02 ≈ 54,8
                    min
                    <br />t = T − 30 = 24,8 min → h ≈ 11,8 cm
                  </p>
                  <p className="mt-3 text-sm">
                    O alerta não pode esperar a água chegar perto da soleira:
                    quando o nível ainda parece baixo, já restam só 30 minutos.
                    No início a água sobe três vezes mais rápido do que ao
                    chegar na soleira, então o sistema deve olhar a velocidade
                    de subida, e não só o nível atual.
                  </p>
                </div>

                {/* Sensibilidade */}
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    7. E se o valor assumido for outro?
                  </h3>
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-300 text-slate-900">
                          <th className="py-2 pr-4">κ (cm/mm)</th>
                          <th className="py-2 pr-4">H (cm)</th>
                          <th className="py-2 pr-4">Tempo até a soleira (min)</th>
                          <th className="py-2 pr-4">Conclusão</th>
                        </tr>
                      </thead>
                      <tbody>
                        {TABELA_SENSIBILIDADE.map((linha) => (
                          <tr
                            key={linha[0]}
                            className="border-b border-slate-200"
                          >
                            {linha.map((celula, i) => (
                              <td key={i} className="py-2 pr-4">
                                {celula}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-3 text-sm">
                    Com uma variação de menos de 20% em κ, a conclusão muda de
                    &quot;alaga&quot; para &quot;não alaga na chuva de
                    projeto&quot;. Por isso o relatório é um cenário
                    ilustrativo, e não uma previsão.
                  </p>
                </div>

                {/* Recomendações e limitações */}
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    8. Recomendações e limitações
                  </h3>
                  <ul className="mt-3 flex list-disc flex-col gap-1 pl-5 text-sm">
                    <li>
                      Calibrar κ e C com o sensor nas primeiras chuvas e
                      estimar com a chuva observada.
                    </li>
                    <li>
                      Avisar cedo, pela velocidade de subida e não só pelo nível
                      atual.
                    </li>
                    <li>
                      Dar prioridade às chuvas curtas e intensas: deixam menos
                      tempo para agir.
                    </li>
                    <li>
                      O modelo só vale durante a chuva (0 a 60 min) e usa
                      intensidade constante de 60,1 mm/h. Ignora declividade,
                      bueiros entupidos e água vinda de outras ruas.
                    </li>
                    <li>
                      A equação foi ajustada com dados de 1933 a 1997, para um
                      posto da cidade; vale conferir com uma série atualizada.
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Registro de lojas */}
      <section
        id="registro"
        className="mx-auto max-w-6xl scroll-mt-16 px-4 py-12 md:py-16"
      >
        <h2 className="text-2xl font-bold text-agua-700 md:text-3xl">
          Registre sua loja
        </h2>
        <p className="mt-4 max-w-3xl text-slate-700">
          Cadastre sua loja e crie seu acesso. Com o e-mail e a senha você entra
          na área da sua loja para acompanhar e informar o status.
        </p>
        <form
          onSubmit={handleSubmit}
          className="mt-8 grid max-w-3xl gap-4 md:grid-cols-2"
        >
          <CampoFormulario
            label="Nome da loja"
            id="nome"
            placeholder="Ex.: Padaria Estrela"
            value={form.nome}
            onChange={handleChange}
            required
          />
          <CampoFormulario
            label="Bairro"
            id="bairro"
            placeholder="Ex.: Vila Mariana"
            value={form.bairro}
            onChange={handleChange}
            required
          />
          <CampoFormulario
            label="Altura da soleira (cm)"
            id="soleira"
            type="number"
            placeholder="De 1 a 50"
            value={form.soleira}
            onChange={handleChange}
            required
          />
          <CampoFormulario
            label="WhatsApp com DDD"
            id="telefone"
            placeholder="(11) 91234-5678"
            value={form.telefone}
            onChange={handleChange}
            required
          />
          <CampoFormulario
            label="E-mail de acesso"
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={form.email}
            onChange={handleChange}
            required
          />
          <CampoFormulario
            label="Senha"
            id="senha"
            type="password"
            placeholder="Mínimo de 6 caracteres"
            value={form.senha}
            onChange={handleChange}
            required
          />
          <div className="flex flex-col gap-3 md:col-span-2">
            {mensagemForm.texto && (
              <p
                className={`text-sm ${
                  mensagemForm.tipo === "erro" ? "text-red-600" : "text-green-700"
                }`}
              >
                {mensagemForm.texto}
              </p>
            )}
            <button
              type="submit"
              disabled={enviando}
              className="rounded-md bg-agua-700 px-6 py-3 text-sm font-semibold text-white hover:bg-agua-900 disabled:bg-slate-300"
            >
              {enviando ? "Registrando..." : "Registrar loja"}
            </button>
          </div>
        </form>
      </section>

      {/* Lojas e status */}
      <section id="lojas" className="scroll-mt-16 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
          <h2 className="text-2xl font-bold text-agua-700 md:text-3xl">
            Lojas e status
          </h2>
          <p className="mt-4 max-w-3xl text-slate-700">
            O status vem das leituras do sensor e do que cada comerciante informa
            na área da sua loja.
            {usuario && (
              <>
                {" "}
                <Link
                  href={`/loja/${usuario.id}`}
                  className="font-semibold text-agua-700 underline"
                >
                  Acessar a área da minha loja
                </Link>
              </>
            )}
          </p>

          {carregando && (
            <p className="mt-8 text-slate-600">Carregando lojas...</p>
          )}
          {erro && <p className="mt-8 text-red-600">{erro}</p>}
          {!carregando && !erro && lojas.length === 0 && (
            <p className="mt-8 text-slate-600">
              Nenhuma loja registrada ainda. Seja a primeira!
            </p>
          )}

          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {lojas.map((loja) => (
              <CardLoja
                key={loja.id}
                loja={loja}
                situacao={situacaoDaLoja(loja)}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;