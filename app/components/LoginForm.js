"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import CampoFormulario from "./CampoFormulario";

const LoginForm = ({ idBase = "login", aoConcluir }) => {
  const { usuario, login, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [entrando, setEntrando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEntrando(true);
    try {
      const dados = await login(email, senha);
      if (dados) {
        setErro("");
        setEmail("");
        setSenha("");
        if (aoConcluir) aoConcluir();
        router.push(`/loja/${dados.id}`);
      } else {
        setErro("E-mail ou senha incorretos.");
      }
    } catch (erroLogin) {
      setErro("Não foi possível entrar agora. Tente novamente.");
    } finally {
      setEntrando(false);
    }
  };

  const handleSair = () => {
    logout();
    if (aoConcluir) aoConcluir();
    if (pathname !== "/") router.push("/");
  };

  if (usuario) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-slate-700">
          Logado como <span className="font-semibold">{usuario.nome}</span>
        </p>
        <Link
          href={`/loja/${usuario.id}`}
          onClick={aoConcluir}
          className="rounded-md bg-agua-700 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-agua-900"
        >
          Acessar minha loja
        </Link>
        <button
          type="button"
          onClick={handleSair}
          className="rounded-md bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-300"
        >
          Sair
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <CampoFormulario
        label="E-mail"
        id={`${idBase}-email`}
        type="email"
        placeholder="seu@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <CampoFormulario
        label="Senha"
        id={`${idBase}-senha`}
        type="password"
        placeholder="Sua senha"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        required
      />
      {erro && <p className="text-sm text-red-600">{erro}</p>}
      <button
        type="submit"
        disabled={entrando}
        className="rounded-md bg-agua-700 px-4 py-2 text-sm font-semibold text-white hover:bg-agua-900 disabled:bg-slate-300"
      >
        {entrando ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
};

export default LoginForm;