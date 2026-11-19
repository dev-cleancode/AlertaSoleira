const STATUS = {
  SEGURO: { texto: "SEGURO", cor: "bg-green-600" },
  "ATENÇÃO": { texto: "ATENÇÃO", cor: "bg-yellow-500" },
  PERIGO: { texto: "PERIGO", cor: "bg-red-600" },
  SEM_LEITURAS: { texto: "SEM LEITURAS", cor: "bg-slate-500" },
};

const CardLoja = ({ loja, situacao, manual, logado, onMudarStatus }) => {
  const status = STATUS[situacao];
  const analise = loja.analise;
  const ultimoAviso = loja.avisos[loja.avisos.length - 1];

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-slate-900">{loja.nome}</h3>
          <p className="text-sm text-slate-600">{loja.bairro}</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold text-white ${status.cor}`}
        >
          {status.texto}
        </span>
      </div>

      <ul className="flex flex-col gap-1 text-sm text-slate-600">
        <li>Soleira: {loja.soleira} cm</li>
        {analise ? (
          <>
            <li>Nível atual: {analise.nivel.toFixed(1)} cm</li>
            <li>
              Velocidade de subida:{" "}
              {analise.taxa === null
                ? "precisa de pelo menos 2 leituras"
                : `${analise.taxa.toFixed(2)} cm/min`}
            </li>
            <li>
              Tempo até a soleira:{" "}
              {analise.tempo === null
                ? "a água não está subindo"
                : analise.tempo === 0
                ? "a água já chegou na soleira"
                : `${analise.tempo.toFixed(0)} min`}
            </li>
          </>
        ) : (
          <li>Ainda não há leituras do sensor.</li>
        )}
      </ul>

      {analise && (
        <p className="text-sm font-medium text-slate-800">{analise.orientacao}</p>
      )}

      {ultimoAviso && (
        <p className="rounded-md bg-agua-50 p-2 text-xs text-slate-700">
          Último aviso enviado (min {ultimoAviso.minuto}): {ultimoAviso.mensagem}
        </p>
      )}

      {logado && (
        <div className="flex flex-col gap-1">
          <label
            htmlFor={`status-${loja.id}`}
            className="text-xs font-medium text-slate-700"
          >
            Status informado pela loja
          </label>
          <select
            id={`status-${loja.id}`}
            value={manual || "AUTO"}
            onChange={(e) => onMudarStatus(loja.id, e.target.value)}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="AUTO">Automático (sensor)</option>
            <option value="SEGURO">SEGURO</option>
            <option value="ATENÇÃO">ATENÇÃO</option>
            <option value="PERIGO">PERIGO</option>
          </select>
        </div>
      )}
    </div>
  );
};

export default CardLoja;