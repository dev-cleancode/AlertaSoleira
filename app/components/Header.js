"use client";

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import LoginForm from "./LoginForm";

const Header = () => {
  const { usuario } = useAuth();
  const [aberto, setAberto] = useState(false);

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <a href="#inicio" className="text-lg font-bold text-agua-700">
          AlertaSoleira
        </a>

        <nav className="hidden gap-6 text-sm font-medium text-slate-700 md:flex">
          <a href="#introducao" className="hover:text-agua-600">Introdução</a>
          <a href="#problema" className="hover:text-agua-600">Problema</a>
          <a href="#solucao" className="hover:text-agua-600">Solução</a>
          <a href="#registro" className="hover:text-agua-600">Registrar loja</a>
          <a href="#lojas" className="hover:text-agua-600">Lojas</a>
        </nav>

        <div className="relative">
          <button
            type="button"
            onClick={() => setAberto(!aberto)}
            className="rounded-md bg-agua-700 px-4 py-2 text-sm font-semibold text-white hover:bg-agua-900"
          >
            {usuario ? "Minha conta" : "Entrar"}
          </button>

          {aberto && (
            <div className="absolute right-0 mt-2 w-64 rounded-lg border border-slate-200 bg-white p-4 shadow-lg">
              <LoginForm />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;