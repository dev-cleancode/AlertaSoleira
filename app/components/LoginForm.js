"use client";

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import CampoFormulario from "./CampoFormulario";

const LoginForm = () => {
  const { usuario, login, logout } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const ok = login(email, senha);
    if (ok) {
      setErro("");
      setEmail("");
      setSenha("");
    } else {
      setErro("E-mail ou senha incorretos.");
    }
  };

  if (usuario) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-slate-700">
          Logado como <span className="font-semibold">{usuario}</span>
        </p>
        <button
          type="button"
          onClick={logout}
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
        id="email"
        type="email"
        placeholder="seu@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <CampoFormulario
        label="Senha"
        id="senha"
        type="password"
        placeholder="Sua senha"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        required
      />
      {erro && <p className="text-sm text-red-600">{erro}</p>}
      <button
        type="submit"
        className="rounded-md bg-agua-700 px-4 py-2 text-sm font-semibold text-white hover:bg-agua-900"
      >
        Entrar
      </button>
    </form>
  );
};

export default LoginForm;