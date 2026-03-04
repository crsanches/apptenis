const express = require("express");
const router = express.Router();
const pool = require("./db");


// ==================================================
// 🔹 ALUNOS
// ==================================================

router.get("/alunos", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, nome, valor_aula FROM alunos ORDER BY nome`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post("/alunos", async (req, res) => {
  const { nome, valor_aula } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO alunos (nome, valor_aula)
       VALUES ($1, $2)
       RETURNING id`,
      [nome, Number(valor_aula)]
    );

    res.json({ id: result.rows[0].id });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.put("/alunos/:id", async (req, res) => {
  const { nome, valor_aula } = req.body;

  try {
    const result = await pool.query(
      `UPDATE alunos
       SET nome = $1, valor_aula = $2
       WHERE id = $3`,
      [nome, Number(valor_aula), req.params.id]
    );

    res.json({ updated: result.rowCount });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.delete("/alunos/:id", async (req, res) => {
  const alunoId = req.params.id;

  try {
    await pool.query(`DELETE FROM pagamentos WHERE aluno_id = $1`, [alunoId]);
    await pool.query(`DELETE FROM aulas WHERE aluno_id = $1`, [alunoId]);

    const result = await pool.query(
      `DELETE FROM alunos WHERE id = $1`,
      [alunoId]
    );

    res.json({ deleted: result.rowCount });
  } catch (err) {
    res.status(500).json(err);
  }
});


// ==================================================
// 🔹 PAGAMENTOS
// ==================================================

router.post("/pagamentos", async (req, res) => {
  const { aluno_id, valor, data } = req.body;

  try {
    const aluno = await pool.query(
      `SELECT valor_aula FROM alunos WHERE id = $1`,
      [aluno_id]
    );

    if (aluno.rows.length === 0)
      return res.status(404).json({ error: "Aluno não encontrado" });

    const valorAula = Number(aluno.rows[0].valor_aula);
    const valorPago = Number(valor);
    const creditos = valorPago / valorAula;

    const dataFormatada = data.split("T")[0];

    const result = await pool.query(
      `INSERT INTO pagamentos
       (aluno_id, valor, data, valor_aula_na_epoca, creditos_gerados)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [aluno_id, valorPago, dataFormatada, valorAula, creditos]
    );

    res.json({ id: result.rows[0].id });

  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/pagamentos", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.id,
        p.valor,
        p.data,
        p.aluno_id,
        a.nome as aluno_nome
      FROM pagamentos p
      JOIN alunos a ON a.id = p.aluno_id
      ORDER BY p.data DESC
    `);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.delete("/pagamentos/:id", async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM pagamentos WHERE id = $1`,
      [req.params.id]
    );

    res.json({ deleted: result.rowCount });
  } catch (err) {
    res.status(500).json(err);
  }
});


// ==================================================
// 🔹 AULAS
// ==================================================

router.get("/aulas", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        au.id,
        au.data_agendada,
        au.status,
        al.nome as aluno_nome
      FROM aulas au
      JOIN alunos al ON al.id = au.aluno_id
      ORDER BY au.data_agendada DESC
    `);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post("/aulas", async (req, res) => {
  const { aluno_id, data_agendada } = req.body;

  try {
    const dataFormatada = data_agendada.split("T")[0];

    const result = await pool.query(
      `INSERT INTO aulas
       (aluno_id, data_agendada, status)
       VALUES ($1, $2, 'agendada')
       RETURNING id`,
      [aluno_id, dataFormatada]
    );

    res.json({ id: result.rows[0].id });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.put("/aulas/:id/status", async (req, res) => {
  const { status } = req.body;

  try {
    const result = await pool.query(
      `UPDATE aulas SET status = $1 WHERE id = $2`,
      [status, req.params.id]
    );

    res.json({ updated: result.rowCount });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.delete("/aulas/:id", async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM aulas WHERE id = $1`,
      [req.params.id]
    );

    res.json({ deleted: result.rowCount });
  } catch (err) {
    res.status(500).json(err);
  }
});


// ==================================================
// 🔹 SALDO
// ==================================================

router.get("/saldo/:aluno_id", async (req, res) => {
  const alunoId = req.params.aluno_id;

  try {
    const result = await pool.query(`
      SELECT 
        COALESCE(
          (SELECT SUM(creditos_gerados) FROM pagamentos WHERE aluno_id = $1),0
        )
        -
        COALESCE(
          (SELECT COUNT(*) FROM aulas
           WHERE aluno_id = $1
           AND status IN ('realizada','cancelada_sem_justificativa')),0
        ) as saldo
    `, [alunoId]);

    res.json({ saldo: Number(result.rows[0].saldo) });

  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;