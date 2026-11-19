import Link from "next/link";
import LoginForm from "./LoginForm";

const MEMBROS = [
  { rm: "570881", nome: "Gabriel Freitas da Silva Carvalho" },
  { rm: "572892", nome: "Erick Martins Picolo" },
  { rm: "572171", nome: "Guilherme Marcon Dantas" },
  { rm: "569782", nome: "Luiz Felipe Cardoso de Oliveira" },
];

const Footer = () => {
  return (
    <footer id="equipe" className="bg-agua-900 text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-2">
        <div>
          <h2 className="text-xl font-bold">Byte Force</h2>
          <p className="mt-1 text-sm text-agua-100">
            Equipe responsável pelo AlertaSoleira.
          </p>
          <ul className="mt-4 flex flex-col gap-2 text-sm">
            {MEMBROS.map((membro) => (
              <li key={membro.rm}>
                {membro.rm} · {membro.nome}
              </li>
            ))}
          </ul>
        </div>

        <div id="login" className="rounded-lg bg-white p-4 text-slate-900">
          <h2 className="text-lg font-bold text-agua-700">
            Área do comerciante
          </h2>
          <p className="mb-4 mt-1 text-sm text-slate-600">
            Entre para acessar a área da sua loja. Ainda não tem conta?{" "}
            <Link
              href="/#registro"
              className="font-semibold text-agua-700 underline"
            >
              Registre sua loja
            </Link>
            .
          </p>
          <LoginForm idBase="rodape" />
        </div>
      </div>

      <p className="border-t border-agua-700 py-4 text-center text-xs text-agua-100">
        AlertaSoleira · Byte Force · FIAP
      </p>
    </footer>
  );
};

export default Footer;