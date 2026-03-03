import { useState } from "react";
import { API_URL } from "../config";

function NovoAluno({ fechar }) {
  const [nome, setNome] = useState("");
  const [valor, setValor] = useState("");
  const [aulas, setAulas] = useState("");

  const salvar = async () => {
    await fetch(`${API_URL}/alunos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        nome,
        valor_mensal: Number(valor),
        aulas_por_mes: Number(aulas)
      })
    });

    fechar();
    window.location.reload();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-primary">
        Novo Aluno
      </h2>

      <input
        placeholder="Nome"
        className="w-full border rounded-lg p-2"
        value={nome}
        onChange={e => setNome(e.target.value)}
      />

      <input
        placeholder="Valor mensal"
        type="number"
        className="w-full border rounded-lg p-2"
        value={valor}
        onChange={e => setValor(e.target.value)}
      />

      <input
        placeholder="Aulas por mês"
        type="number"
        className="w-full border rounded-lg p-2"
        value={aulas}
        onChange={e => setAulas(e.target.value)}
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

export default NovoAluno;