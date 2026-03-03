const express = require("express");
const router = express.Router();
const db = require("./db");


// ==================================================
// 🔹 ALUNOS
// ==================================================

router.get("/alunos", (req, res) => {
  db.all(
    `SELECT id as alundo_id, nome, valor_aula FROM alunos`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json(err);
      res.json(rows);
    }
  );
});

router.post("/alunos", (req, res) => {
  const { nome, valor_aula } = req.body;

  db.run(
    `INSERT INTO alunos (nome, valor_aula)
     VALUES (?, ?)`,
    [nome, valor_aula],
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

  db.get(
    `SELECT valor_aula FROM alunos WHERE id = ?`,
    [aluno_id],
    (err, aluno) => {
      if (err) return res.status(500).json(err);
      if (!aluno) return res.status(404).json({ error: "Aluno não encontrado" });

      const creditos = valor / aluno.valor_aula;

      db.run(
        `INSERT INTO pagamentos 
         (aluno_id, valor, data, valor_aula_na_epoca, creditos_gerados)
         VALUES (?, ?, ?, ?, ?)`,
        [aluno_id, valor, data, aluno.valor_aula, creditos],
        function (err2) {
          if (err2) return res.status(500).json(err2);
          res.json({ id: this.lastID });
        }
      );
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

router.get("/aulas", (req, res) => {
  db.all(
    `SELECT 
        aulas.id,
        aulas.data_agendada,
        aulas.status,
        alunos.nome as aluno_nome
     FROM aulas
     JOIN alunos ON alunos.id = aulas.aluno_id
     ORDER BY aulas.data_agendada DESC`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json(err);
      res.json(rows);
    }
  );
});

router.post("/aulas", (req, res) => {
  const { aluno_id, data_agendada } = req.body;

  db.run(
    `INSERT INTO aulas 
     (aluno_id, data_agendada, status)
     VALUES (?, ?, 'agendada')`,
    [aluno_id, data_agendada],
    function (err) {
      if (err) return res.status(500).json(err);
      res.json({ id: this.lastID });
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
      creditos_gerados as quantidade,
      'pagamento' as tipo
    FROM pagamentos
    WHERE aluno_id = ?
  `;

  const queryAulas = `
    SELECT 
      id,
      data_agendada as data_evento,
      status,
      'aula' as tipo
    FROM aulas
    WHERE aluno_id = ?
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
          saldo += e.quantidade;

          return {
            ...e,
            credito: e.quantidade,
            debito: 0,
            saldo
          };
        }

        if (
          e.status === "realizada" ||
          e.status === "cancelada_sem_justificativa"
        ) {
          saldo -= 1;

          return {
            ...e,
            credito: 0,
            debito: 1,
            saldo
          };
        }

        // aula que ainda não consome crédito
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

  db.get(
    `
    SELECT 
      IFNULL(
        (SELECT SUM(creditos_gerados) 
         FROM pagamentos 
         WHERE aluno_id = ?), 0
      )
      -
      IFNULL(
        (SELECT COUNT(*) 
         FROM aulas 
         WHERE aluno_id = ?
         AND status IN ('realizada','cancelada_sem_justificativa')
        ), 0
      ) as creditos
    `,
    [alunoId, alunoId],
    (err, row) => {
      if (err) return res.status(500).json(err);
      res.json({ saldo: row.creditos });
    }
  );
});

// ==================================================
// 🔹 RELATORIO DO PROFESSOR
// ==================================================



router.get("/dashboard/:mes", (req, res) => {
  const mes = req.params.mes;
  const inicio = `${mes}-01`;
  const fim = `${mes}-31`;

  db.get(`
    SELECT COUNT(*) as total_alunos
    FROM alunos
  `, [], (err, base) => {

    if (err) return res.status(500).json(err);

    db.get(`
      SELECT IFNULL(SUM(creditos_gerados),0) as creditos_gerados_mes
      FROM pagamentos
      WHERE data BETWEEN ? AND ?
    `, [inicio, fim], (err2, gerados) => {

      if (err2) return res.status(500).json(err2);

      db.get(`
        SELECT COUNT(*) as creditos_consumidos_mes
        FROM aulas
        WHERE status IN ('realizada','cancelada_sem_justificativa')
        AND data_agendada BETWEEN ? AND ?
      `, [inicio, fim], (err3, consumidos) => {

        if (err3) return res.status(500).json(err3);

        db.get(`
          SELECT
            IFNULL((SELECT SUM(creditos_gerados) FROM pagamentos),0)
            -
            IFNULL((
              SELECT COUNT(*) FROM aulas
              WHERE status IN ('realizada','cancelada_sem_justificativa')
            ),0)
          as creditos_acumulados_total
        `, [], (err4, acumulado) => {

          if (err4) return res.status(500).json(err4);

          res.json({
            total_alunos: base.total_alunos,
            creditos_gerados_mes: gerados.creditos_gerados_mes,
            creditos_consumidos_mes: consumidos.creditos_consumidos_mes,
            creditos_abertos_mes:
              gerados.creditos_gerados_mes - consumidos.creditos_consumidos_mes,
            creditos_acumulados_total: acumulado.creditos_acumulados_total
          });
        });
      });
    });
  });
});

router.get("/resumo-professor/:mes", (req, res) => {
  const mes = req.params.mes;
  const inicio = `${mes}-01`;
  const fim = `${mes}-31`;

  const query = `
    SELECT 
      COUNT(*) as total_alunos
    FROM alunos
  `;

  db.get(query, [], (err, base) => {
    if (err) return res.status(500).json(err);

    db.all(`
      SELECT aluno_id, nome,
        (
          IFNULL(
            (SELECT SUM(creditos_gerados) 
             FROM pagamentos 
             WHERE pagamentos.aluno_id = alunos.id), 0
          )
          -
          IFNULL(
            (SELECT COUNT(*) 
             FROM aulas 
             WHERE aulas.aluno_id = alunos.id
             AND status IN ('realizada','cancelada_sem_justificativa')
            ), 0
          )
        ) as creditos_abertos
      FROM alunos
    `, [], (err2, porAluno) => {

      const totalAbertos = porAluno.reduce(
        (acc, a) => acc + a.creditos_abertos, 0
      );

      res.json({
        total_alunos: base.total_alunos,
        creditos_acumulados_total: totalAbertos,
        abertos_por_aluno: porAluno
      });
    });
  });
});




module.exports = router;