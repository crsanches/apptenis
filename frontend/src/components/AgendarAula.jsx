import { useState } from "react";
import { API_URL } from "../config";
import { fetchAuth } from "../fetchAuth";

function AgendarAula({ aluno, fechar, atualizar }) {
  const [data, setData] = useState("");

  const salvar = async () => {
    if (!data) return alert("Informe a data");

    await fetchAuth(`/aulas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        aluno_id: aluno.id,
        data_agendada: data,
      }),
    });

    atualizar();
    fechar();
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-primary">
        Agendar Aula - {aluno.nome}
      </h3>

      <div>
        <label className="block text-sm mb-1">
          Data da Aula
        </label>
        <input
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
          className="w-full border rounded p-2"
        />
      </div>

      <button
        onClick={salvar}
        className="bg-green-600 text-white w-full py-2 rounded"
      >
        Salvar
      </button>
    </div>
  );
}

export default AgendarAula;