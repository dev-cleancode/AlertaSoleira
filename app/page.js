"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./context/AuthContext";
import analisarLoja from "../utils/calculos";
import CampoFormulario from "./components/CampoFormulario";
import CardLoja from "./components/CardLoja";

const Home = () => {
  const { usuario } = useAuth();
  const [lojas, setLojas] = useState([]);
  const [manual, setManual] = useState({});
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const carregarLojas = async () => {
      try {
        const resposta = await fetch("/dados.json");
        const dados = await resposta.json();
        const lista = dados.lojas.map((loja, i) => ({
          ...loja,
          id: i + 1,
          analise: analisarLoja(loja),
        }));
        setLojas(lista);
      } catch (e) {
        setErro("Não foi possível carregar as lojas.");
      } finally {
        setCarregando(false);
      }
    };
    carregarLojas();
  }, []);

  const mudarStatus = (id, novoStatus) => {
    setManual({ ...manual, [id]: novoStatus === "AUTO" ? null : novoStatus });
  };

  const situacaoDaLoja = (loja) => {
    if (manual[loja.id]) return manual[loja.id];
    if (loja.analise) return loja.analise.situacao;
    return "SEM_LEITURAS";
  };

  return (
    <main>
      {/* Hero */}
      <section id="inicio" className="bg-agua-900 text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-16 md:py-24">
          <p className="text-sm font-semibold uppercase text-agua-100">
            AlertaSoleira
          </p>
          <h1 className="text-3xl font-bold md:text-5xl">
            A água vai chegar na sua porta. Você fica sabendo antes.
          </h1>
          <p className="max-w-2xl text-agua-100 md:text-lg">
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
      <section id="introducao" className="mx-auto max-w-6xl px-4 py-12 md:py-16">
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
      <section id="problema" className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
          <h2 className="text-2xl font-bold text-agua-700 md:text-3xl">
            O problema
          </h2>
          <p className="mt-4 max-w-3xl text-slate-700">
            Quando chove forte em São Paulo, muita loja de rua baixa alaga e o
            dono perde estoque. Os alertas que existem hoje, como os da Defesa
            Civil e dos aplicativos de mapa, são gerais: falam da cidade ou do
            bairro. Ninguém avisa que a água vai chegar na sua porta em alguns
            minutos.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-slate-200 p-4">
              <h3 className="font-semibold text-slate-900">Alerta genérico</h3>
              <p className="mt-2 text-sm text-slate-600">
                O aviso vale para a região inteira, não para a rua da loja.
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <h3 className="font-semibold text-slate-900">Pouco tempo</h3>
              <p className="mt-2 text-sm text-slate-600">
                Quando o comerciante percebe, a água já está entrando.
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <h3 className="font-semibold text-slate-900">Prejuízo real</h3>
              <p className="mt-2 text-sm text-slate-600">
                Estoque perdido e dias de loja fechada.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solução */}
      <section id="solucao" className="mx-auto max-w-6xl px-4 py-12 md:py-16">
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

      {/* Registro de lojas */}
      <section id="registro" className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
          <h2 className="text-2xl font-bold text-agua-700 md:text-3xl">
            Registre sua loja
          </h2>
          <p className="mt-4 max-w-3xl text-slate-700">
            Cadastre sua loja para passar a receber o aviso antecipado.
          </p>
          <form className="mt-8 grid max-w-3xl gap-4 md:grid-cols-2">
            <CampoFormulario
              label="Nome da loja"
              id="nomeLoja"
              placeholder="Ex.: Padaria Estrela"
            />
            <CampoFormulario
              label="Bairro"
              id="bairroLoja"
              placeholder="Ex.: Vila Mariana"
            />
            <CampoFormulario
              label="Altura da soleira (cm)"
              id="soleiraLoja"
              type="number"
              placeholder="De 1 a 50"
            />
            <CampoFormulario
              label="WhatsApp com DDD"
              id="telefoneLoja"
              placeholder="(11) 91234-5678"
            />
            <div className="flex items-end md:col-span-2">
              <button
                type="button"
                disabled
                className="w-full rounded-md bg-slate-300 px-4 py-2 text-sm font-semibold text-slate-600"
              >
                Cadastro em breve
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Lojas e status */}
      <section id="lojas" className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <h2 className="text-2xl font-bold text-agua-700 md:text-3xl">
          Lojas e status
        </h2>
        <p className="mt-4 max-w-3xl text-slate-700">
          {usuario
            ? "Você está logado: pode informar o status da loja manualmente."
            : "O status vem das leituras do sensor. Entre na sua conta para informar o status da sua loja."}
        </p>

        {carregando && <p className="mt-8 text-slate-600">Carregando lojas...</p>}
        {erro && <p className="mt-8 text-red-600">{erro}</p>}

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {lojas.map((loja) => (
            <CardLoja
              key={loja.id}
              loja={loja}
              situacao={situacaoDaLoja(loja)}
              manual={manual[loja.id]}
              logado={!!usuario}
              onMudarStatus={mudarStatus}
            />
          ))}
        </div>
      </section>
    </main>
  );
};

export default Home;