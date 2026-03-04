const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'database.sqlite');

db.serialize(() => {

  db.run(`
  CREATE TABLE IF NOT EXISTS alunos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    valor_aula REAL NOT NULL
  )
`);

  db.run(`
  CREATE TABLE IF NOT EXISTS pagamentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    aluno_id INTEGER NOT NULL,
    valor REAL NOT NULL,
    data TEXT NOT NULL,
    valor_aula_na_epoca REAL NOT NULL,
    creditos_gerados REAL NOT NULL,
    FOREIGN KEY (aluno_id) REFERENCES alunos(id)
  )
`);

  db.run(`
  CREATE TABLE IF NOT EXISTS aulas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    aluno_id INTEGER NOT NULL,
    data_agendada TEXT NOT NULL,
    status TEXT NOT NULL,
    FOREIGN KEY (aluno_id) REFERENCES alunos(id)
  )
`);

});

module.exports = db;
