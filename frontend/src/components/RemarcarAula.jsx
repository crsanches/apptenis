import { useState } from "react";
import { API_URL } from "../config";

function RemarcarAula({ aula, fechar, atualizar }) {
  const dataInicial = new Date(aula.data_agendada)
    .toISOString()
    .slice(0, 16);

  const [novaData, setNovaData] = useState(dataInicial);

  const salvar = async () => {
    await fetch(`${API_URL}/aulas/${aula.id}/remarcar`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        nova_data: novaData
      })
    });

    fechar();
    atualizar();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-primary">
        Remarcar Aula
      </h2>

      <p className="text-sm text-gray-500">
        Aluno: {aula.nome}
      </p>

      <input
        type="datetime-local"
        className="w-full border rounded-lg p-2"
        value={novaData}
        onChange={(e) => setNovaData(e.target.value)}
      />

      <button
        onClick={salvar}
        className="w-full bg-primary text-white py-2 rounded-lg"
      >
        Confirmar
      </button>
    </div>
  );
}

export default RemarcarAula;