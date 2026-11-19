"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { buscarLojasPorEmail } from "../../services/api";
import gerarHash from "../../utils/hash";

const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    try {
      const salvo = localStorage.getItem("usuario");
      if (salvo) setUsuario(JSON.parse(salvo));
    } catch (e) {
      localStorage.removeItem("usuario");
    }
    setPronto(true);
  }, []);

  const iniciarSessao = (loja) => {
    const dados = { id: loja.id, nome: loja.nome, email: loja.email };
    setUsuario(dados);
    localStorage.setItem("usuario", JSON.stringify(dados));
    return dados;
  };

  const login = async (email, senha) => {
    const emailLimpo = email.trim().toLowerCase();
    const lojas = await buscarLojasPorEmail(emailLimpo);
    const loja = lojas[0];
    if (!loja) return null;

    const hash = await gerarHash(`${emailLimpo}:${senha}`);
    if (loja.senhaHash !== hash) return null;

    return iniciarSessao(loja);
  };

  const logout = () => {
    setUsuario(null);
    localStorage.removeItem("usuario");
  };

  return (
    <AuthContext.Provider
      value={{ usuario, pronto, login, logout, iniciarSessao }}
    >
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

export { useAuth };
export default AuthProvider;