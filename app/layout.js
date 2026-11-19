import "./globals.css";
import AuthProvider from "./context/AuthContext";
import Header from "./components/Header";
import Footer from "./components/Footer";

export const metadata = {
  title: "AlertaSoleira",
  description:
    "Aviso antecipado de alagamento para lojas de rua: a água vai chegar na sua porta, e você fica sabendo antes.",
};

const RootLayout = ({ children }) => {
  return (
    <html lang="pt-BR">
      <body className="bg-slate-50 text-slate-900">
        <AuthProvider>
          <Header />
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
};

export default RootLayout;