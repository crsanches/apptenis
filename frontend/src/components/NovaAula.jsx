import { useEffect, useState } from "react";
import { API_URL } from "../config";

function NovaAula({ fechar }) {
  const [alunos, setAlunos] = useState([]);
  const [alunoId, setAlunoId] = useState("");
  const [data, setData] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/alunos`)
      .then(res => res.json())
      .then(data => setAlunos(data));
  }, []);

  const salvar = async () => {
    await fetch(`${API_URL}/aulas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        aluno_id: Number(alunoId),
        data_agendada: data
      })
    });

    fechar();
    window.location.reload();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-primary">
        Agendar Aula
      </h2>

      <select
        className="w-full border rounded-lg p-2"
        value={alunoId}
        onChange={e => setAlunoId(e.target.value)}
      >
        <option value="">Selecione o aluno</option>
        {alunos.map(aluno => (
          <option key={aluno.id} value={aluno.id}>
            {aluno.nome}
          </option>
        ))}
      </select>

      <input
        type="date"
        className="w-full border rounded-lg p-2"
        value={data}
        onChange={e => setData(e.target.value)}
      />

      <button
        onClick={salvar}
        className="w-full bg-primary text-white py-2 rounded-lg"
      >
        Salvar
      </button>
    </div>
  );
}

export default NovaAula;