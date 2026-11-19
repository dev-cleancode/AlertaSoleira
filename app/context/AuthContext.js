"use client";

import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

const USUARIO_UNICO = {
  email: "admin@gmail.com",
  senha: "admin123",
};

const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const salvo = localStorage.getItem("usuario");
    if (salvo) setUsuario(salvo);
  }, []);

  const login = (email, senha) => {
    if (email === USUARIO_UNICO.email && senha === USUARIO_UNICO.senha) {
      setUsuario(email);
      localStorage.setItem("usuario", email);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUsuario(null);
    localStorage.removeItem("usuario");
  };

  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

export { useAuth };
export default AuthProvider;