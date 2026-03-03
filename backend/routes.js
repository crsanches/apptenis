const express = require("express");
const router = express.Router();
const db = require("./db");


// ==================================================
// 🔹 ALUNOS
// ==================================================

router.get("/alunos", (req, res) => {
  db.all(
    `SELECT id, nome, valor_mensal, aulas_por_mes FROM alunos`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json(err);
      res.json(rows);
    }
  );
});

router.post("/alunos", (req, res) => {
  const { nome, valor_mensal, aulas_por_mes } = req.body;

  db.run(
    `INSERT INTO alunos (nome, valor_mensal, aulas_por_mes)
     VALUES (?, ?, ?)`,
    [nome, valor_mensal, aulas_por_mes],
    function (err) {
      if (err) return res.status(500).json(err);
      res.json({ id: this.lastID });
    }
  );
});

router.put("/alunos/:id", (req, res) => {
  const { nome, valor_mensal, aulas_por_mes } = req.body;

  db.run(
    `UPDATE alunos
     SET nome = ?, valor_mensal = ?, aulas_por_mes = ?
     WHERE id = ?`,
    [nome, valor_mensal, aulas_por_mes, req.params.id],
    function (err) {
      if (err) return res.status(500).json(err);
      res.json({ updated: this.changes });
    }
  );
});

router.delete("/alunos/:id", (req, res) => {
  const alunoId = req.params.id;

  db.serialize(() => {
    db.run(`DELETE FROM pagamentos WHERE aluno_id = ?`, [alunoId]);
    db.run(`DELETE FROM aulas WHERE aluno_id = ?`, [alunoId]);
    db.run(
      `DELETE FROM alunos WHERE id = ?`,
      [alunoId],
      function (err) {
        if (err) return res.status(500).json(err);
        res.json({ deleted: this.changes });
      }
    );
  });
});


// ==================================================
// 🔹 PAGAMENTOS
// ==================================================

router.post("/pagamentos", (req, res) => {
  const { aluno_id, valor, data } = req.body;

  db.run(
    `INSERT INTO pagamentos (aluno_id, valor, data)
     VALUES (?, ?, ?)`,
    [aluno_id, valor, data],
    function (err) {
      if (err) return res.status(500).json(err);
      res.json({ id: this.lastID });
    }
  );
});

router.delete("/pagamentos/:id", (req, res) => {
  db.run(
    `DELETE FROM pagamentos WHERE id = ?`,
    [req.params.id],
    function (err) {
      if (err) return res.status(500).json(err);
      res.json({ deleted: this.changes });
    }
  );
});


// ==================================================
// 🔹 AULAS
// ==================================================

router.post("/aulas", (req, res) => {
  const { aluno_id, data_agendada } = req.body;

  db.get(
    `SELECT valor_mensal, aulas_por_mes FROM alunos WHERE id = ?`,
    [aluno_id],
    (err, aluno) => {
      if (err) return res.status(500).json(err);
      if (!aluno) return res.status(404).json({ error: "Aluno não encontrado" });

      const valor_aula = aluno.valor_mensal / aluno.aulas_por_mes;

      db.run(
        `INSERT INTO aulas 
         (aluno_id, data_agendada, status, valor_aula)
         VALUES (?, ?, 'agendada', ?)`,
        [aluno_id, data_agendada, valor_aula],
        function (err2) {
          if (err2) return res.status(500).json(err2);
          res.json({ id: this.lastID });
        }
      );
    }
  );
});

router.put("/aulas/:id/status", (req, res) => {
  const { status } = req.body;

  db.run(
    `UPDATE aulas SET status = ? WHERE id = ?`,
    [status, req.params.id],
    function (err) {
      if (err) return res.status(500).json(err);
      res.json({ updated: this.changes });
    }
  );
});

router.put("/aulas/:id/remarcar", (req, res) => {
  const { nova_data } = req.body;

  db.run(
    `UPDATE aulas SET data_agendada = ? WHERE id = ?`,
    [nova_data, req.params.id],
    function (err) {
      if (err) return res.status(500).json(err);
      res.json({ updated: this.changes });
    }
  );
});

router.delete("/aulas/:id", (req, res) => {
  db.run(
    `DELETE FROM aulas WHERE id = ?`,
    [req.params.id],
    function (err) {
      if (err) return res.status(500).json(err);
      res.json({ deleted: this.changes });
    }
  );
});


// ==================================================
// 🔹 EXTRATO FINANCEIRO COMPLETO
// ==================================================

router.get("/extrato/:aluno_id", (req, res) => {
  const alunoId = req.params.aluno_id;

  const queryPagamentos = `
    SELECT 
      id,
      data as data_evento,
      valor,
      'pagamento' as tipo
    FROM pagamentos
    WHERE aluno_id = ?
  `;

  const queryAulas = `
    SELECT 
      id,
      data_agendada as data_evento,
      valor_aula as valor,
      status,
      'aula' as tipo
    FROM aulas
    WHERE aluno_id = ?
    AND status IN (
      'agendada',
      'realizada',
      'cancelada_sem_justificativa',
      'cancelada_pelo_professor',
      'cancelada_com_justificativa'
    )
  `;

  db.all(queryPagamentos, [alunoId], (err, pagamentos) => {
    if (err) return res.status(500).json(err);

    db.all(queryAulas, [alunoId], (err2, aulas) => {
      if (err2) return res.status(500).json(err2);

      const eventos = [...pagamentos, ...aulas];

      eventos.sort(
        (a, b) =>
          new Date(a.data_evento) -
          new Date(b.data_evento)
      );

      let saldo = 0;

      const extrato = eventos.map(e => {

        if (e.tipo === "pagamento") {
          saldo += e.valor;
          return {
            ...e,
            credito: e.valor,
            debito: 0,
            saldo
          };
        }
        // aulas que descontam saldo
        if (
          e.status === "realizada" ||
          e.status === "cancelada_sem_justificativa"
        ) {
          saldo -= e.valor;
          return {
            ...e,
            credito: 0,
            debito: e.valor,
            saldo
          };
        }

        // Aula agendada (não afeta saldo)
        return {
          ...e,
          credito: 0,
          debito: 0,
          saldo
        };
      });

      res.json(extrato);
    });
  });
});


// ==================================================
// 🔹 SALDO ATUAL
// ==================================================

router.get("/saldo/:aluno_id", (req, res) => {
  const alunoId = req.params.aluno_id;

  const queryPagamentos = `
    SELECT valor FROM pagamentos WHERE aluno_id = ?
  `;

  const queryAulas = `
  SELECT 
    id,
    data_agendada as data_evento,
    valor_aula as valor,
    status,
    'aula' as tipo
  FROM aulas
  WHERE aluno_id = ?
`;

  db.all(queryPagamentos, [alunoId], (err, pagamentos) => {
    if (err) return res.status(500).json(err);

    db.all(queryAulas, [alunoId], (err2, aulas) => {
      if (err2) return res.status(500).json(err2);

      let saldo = 0;

      pagamentos.forEach(p => saldo += p.valor);

      aulas.forEach(a => {
        if (
          a.status === "realizada" ||
          a.status === "cancelada_sem_justificativa"
        ) {
          saldo -= a.valor;
        }
      });

      res.json({ saldo });
    });
  });
});


// ==================================================
// 🔹 RELATORIO DO PROFESSOR
// ==================================================



router.get("/dashboard/:mes", (req, res) => {
  const mes = req.params.mes;

  const inicio = `${mes}-01`;
  const fim = `${mes}-31`;

  const query = `
    SELECT 
      -- Alunos com movimento no mês
      (
        SELECT COUNT(DISTINCT aluno_id) FROM (
          SELECT aluno_id FROM aulas
          WHERE data_agendada BETWEEN ? AND ?
          UNION
          SELECT aluno_id FROM pagamentos
          WHERE data BETWEEN ? AND ?
        )
      ) as total_alunos,

      -- Aulas realizadas
      (
        SELECT COUNT(*) FROM aulas 
        WHERE status = 'realizada'
        AND data_agendada BETWEEN ? AND ?
      ) as total_realizadas,

      -- Total recebido
      (
        SELECT IFNULL(SUM(valor),0) FROM pagamentos 
        WHERE data BETWEEN ? AND ?
      ) as total_recebido,

      -- Total consumido (realizadas + cancelada_sem_justificativa)
      (
        SELECT IFNULL(SUM(valor_aula),0) FROM aulas 
        WHERE status IN ('realizada','cancelada_sem_justificativa')
        AND data_agendada BETWEEN ? AND ?
      ) as total_consumido
  `;

  db.get(
    query,
    [
      inicio, fim,
      inicio, fim,
      inicio, fim,
      inicio, fim,
      inicio, fim
    ],
    (err, row) => {
      if (err) return res.status(500).json(err);

      const totalARealizar =
        row.total_recebido - row.total_consumido;

      res.json({
        total_alunos: row.total_alunos,
        total_realizadas: row.total_realizadas,
        total_recebido: row.total_recebido,
        total_a_realizar: totalARealizar
      });
    }
  );
});





module.exports = router;