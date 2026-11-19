"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import api from "../../../services/api";
import {
  normalizarLoja,
  montarDados,
  situacaoDaLoja,
  validarDadosLoja,
} from "../../../utils/lojas";
import CampoFormulario from "../../components/CampoFormulario";
import CardLoja from "../../components/CardLoja";
import LoginForm from "../../components/LoginForm";

const AreaLoja = () => {
  const { id } = useParams();
  const router = useRouter();
  const { usuario, pronto, logout, iniciarSessao } = useAuth();
  const [loja, setLoja] = useState(null);
  const [form, setForm] = useState({
    nome: "",
    bairro: "",
    soleira: "",
    telefone: "",
  });
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mensagemForm, setMensagemForm] = useState({ tipo: "", texto: "" });

  const autorizado = pronto && !!usuario && String(usuario.id) === String(id);

  useEffect(() => {
    if (!autorizado) return;

    const carregarLoja = async () => {
      try {
        const resposta = await api.get(`/lojas/${id}`);
        const dados = normalizarLoja(resposta.data);
        setLoja(dados);
        setForm({
          nome: dados.nome,
          bairro: dados.bairro,
          soleira: String(dados.soleira),
          telefone: dados.telefone || "",
        });
      } catch (e) {
        setErro("Não foi possível carregar os dados da loja.");
      } finally {
        setCarregando(false);
      }
    };
    carregarLoja();
  }, [autorizado, id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const erroDados = validarDadosLoja(form);
    if (erroDados) {
      setMensagemForm({ tipo: "erro", texto: erroDados });
      return;
    }

    setEnviando(true);
    try {
      const resposta = await api.put(
        `/lojas/${id}`,
        montarDados(loja, {
          nome: form.nome.trim(),
          bairro: form.bairro.trim(),
          soleira: Number(form.soleira),
          telefone: form.telefone.trim(),
        })
      );
      setLoja(normalizarLoja(resposta.data));
      iniciarSessao(resposta.data);
      setMensagemForm({ tipo: "sucesso", texto: "Dados atualizados." });
    } catch (erroSalvar) {
      setMensagemForm({
        tipo: "erro",
        texto: "Não foi possível salvar. Tente novamente.",
      });
    } finally {
      setEnviando(false);
    }
  };

  const mudarStatus = async (lojaId, novoStatus) => {
    try {
      const resposta = await api.put(
        `/lojas/${lojaId}`,
        montarDados(loja, {
          statusManual: novoStatus === "AUTO" ? "" : novoStatus,
        })
      );
      setLoja(normalizarLoja(resposta.data));
      setErro("");
    } catch (erroStatus) {
      setErro("Não foi possível atualizar o status.");
    }
  };

  const excluirLoja = async (lojaAtual) => {
    const confirmou = window.confirm(
      `Excluir a loja "${lojaAtual.nome}"? Isso não pode ser desfeito.`
    );
    if (!confirmou) return;

    try {
      await api.delete(`/lojas/${lojaAtual.id}`);
      logout();
      router.push("/");
    } catch (erroExcluir) {
      setErro("Não foi possível excluir a loja.");
    }
  };

  if (!pronto) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-12">
        <p className="text-slate-600">Carregando...</p>
      </main>
    );
  }

  if (!autorizado) {
    return (
      <main className="mx-auto max-w-md px-4 py-12">
        <h1 className="text-2xl font-bold text-agua-700">Área restrita</h1>
        <p className="mt-4 text-slate-700">
          Esta área é só para o dono da loja. Entre com o e-mail e a senha
          cadastrados no registro.
        </p>
        <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4">
          <LoginForm idBase="restrita" />
        </div>
        <Link
          href="/"
          className="mt-6 inline-block text-sm font-semibold text-agua-700 underline"
        >
          Voltar ao site
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <Link href="/" className="text-sm font-semibold text-agua-700 underline">
        Voltar ao site
      </Link>

      {carregando && (
        <p className="mt-8 text-slate-600">Carregando sua loja...</p>
      )}
      {erro && <p className="mt-8 text-red-600">{erro}</p>}

      {loja && (
        <>
          <h1 className="mt-4 text-2xl font-bold text-agua-700 md:text-3xl">
            Área da sua loja
          </h1>
          <p className="mt-2 text-slate-700">Acesso com {loja.email}</p>

          <div className="mt-8 grid gap-8 md:grid-cols-2">
            <div>
              <h2 className="mb-4 text-lg font-bold text-slate-900">
                Status atual
              </h2>
              <CardLoja
                loja={loja}
                situacao={situacaoDaLoja(loja)}
                logado
                onMudarStatus={mudarStatus}
                onExcluir={excluirLoja}
              />
            </div>

            <div>
              <h2 className="mb-4 text-lg font-bold text-slate-900">
                Dados da loja
              </h2>
              <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4"
              >
                <CampoFormulario
                  label="Nome da loja"
                  id="nome"
                  value={form.nome}
                  onChange={handleChange}
                  required
                />
                <CampoFormulario
                  label="Bairro"
                  id="bairro"
                  value={form.bairro}
                  onChange={handleChange}
                  required
                />
                <CampoFormulario
                  label="Altura da soleira (cm)"
                  id="soleira"
                  type="number"
                  value={form.soleira}
                  onChange={handleChange}
                  required
                />
                <CampoFormulario
                  label="WhatsApp com DDD"
                  id="telefone"
                  value={form.telefone}
                  onChange={handleChange}
                  required
                />
                {mensagemForm.texto && (
                  <p
                    className={`text-sm ${
                      mensagemForm.tipo === "erro"
                        ? "text-red-600"
                        : "text-green-700"
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
                  {enviando ? "Salvando..." : "Salvar alterações"}
                </button>
              </form>
            </div>
          </div>

          <div className="mt-8 grid gap-8 md:grid-cols-2">
            <div>
              <h2 className="mb-4 text-lg font-bold text-slate-900">
                Últimas leituras do sensor
              </h2>
              {loja.leituras.length === 0 ? (
                <p className="text-sm text-slate-600">Ainda não há leituras.</p>
              ) : (
                <ul className="flex flex-col gap-1 text-sm text-slate-700">
                  {loja.leituras
                    .slice(-6)
                    .reverse()
                    .map((leitura, i) => (
                      <li key={i}>
                        Minuto {leitura.minuto}: {Number(leitura.nivel).toFixed(1)} cm
                      </li>
                    ))}
                </ul>
              )}
            </div>

            <div>
              <h2 className="mb-4 text-lg font-bold text-slate-900">
                Avisos enviados
              </h2>
              {loja.avisos.length === 0 ? (
                <p className="text-sm text-slate-600">
                  Nenhum aviso enviado ainda.
                </p>
              ) : (
                <ul className="flex flex-col gap-1 text-sm text-slate-700">
                  {loja.avisos
                    .slice(-5)
                    .reverse()
                    .map((aviso, i) => (
                      <li key={i}>
                        Minuto {aviso.minuto}: {aviso.mensagem}
                      </li>
                    ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </main>
  );
};

export default AreaLoja;