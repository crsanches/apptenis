import { useState } from "react";
import { API_URL } from "../config";
import { fetchAuth } from "../fetchAuth";

function NovoPagamento({ aluno, fechar, atualizar }) {
  const hoje = new Date().toISOString().split("T")[0];

  const [valor, setValor] = useState(aluno.valor_mensal);
  const [data, setData] = useState(hoje);

  const salvar = async () => {
    await fetchAuth(`/pagamentos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        aluno_id: aluno.id,
        valor: Number(valor),
        data
      })
    });

    fechar();
    atualizar();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-primary">
        Registrar Pagamento
      </h2>

      <p className="text-sm text-gray-500">
        Aluno: {aluno.nome}
      </p>

      <div>
        <label className="text-sm">Valor</label>
        <input
          type="number"
          className="w-full border rounded-lg p-2 mt-1"
          value={valor}
          onChange={e => setValor(e.target.value)}
        />
      </div>

      <div>
        <label className="text-sm">Data do pagamento</label>
        <input
          type="date"
          className="w-full border rounded-lg p-2 mt-1"
          value={data}
          onChange={e => setData(e.target.value)}
        />
      </div>

      <button
        onClick={salvar}
        className="w-full bg-primary text-white py-2 rounded-lg"
      >
        Confirmar Pagamento
      </button>
    </div>
  );
}

export default NovoPagamento;