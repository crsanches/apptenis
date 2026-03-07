const express = require("express");
const router = express.Router();
const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { verificarToken, apenasAdmin } = require("../authMiddleware");


// ===============================
// LOGIN
// ===============================  
router.post("/login", async (req,res)=>{

  const { email, senha } = req.body;

  const result = await pool.query(
    "SELECT * FROM usuarios WHERE email=$1",
    [email]
  );

  const usuario = result.rows[0];

  if(!usuario)
    return res.status(401).json({erro:"Usuário não encontrado"});

  const senhaValida = await bcrypt.compare(senha,usuario.senha);

  if(!senhaValida)
    return res.status(401).json({erro:"Senha inválida"});

  const token = jwt.sign(
    {
      id:usuario.id,
      perfil:usuario.perfil,
      nome:usuario.nome
    },
    "segredo",
    {expiresIn:"8h"}
  );

  res.json({
    token,
    usuario:{
      nome:usuario.nome,
      perfil:usuario.perfil
    }
  });

});


// ===============================
// CRIAR USUÁRIO
// ===============================
router.post("/usuarios", verificarToken, apenasAdmin, async (req,res)=>{

  const {nome,email,senha,perfil} = req.body;

  const hash = await bcrypt.hash(senha,10);

  await pool.query(
    `INSERT INTO usuarios(nome,email,senha,perfil)
     VALUES($1,$2,$3,$4)`,
     [nome,email,hash,perfil]
  );

  res.json({ok:true});

});


// ===============================
// LISTAR USUÁRIOS
// ===============================
router.get("/usuarios", verificarToken, apenasAdmin, async (req,res)=>{

  const result = await pool.query(
    "SELECT id,nome,email,perfil FROM usuarios ORDER BY nome"
  );

  res.json(result.rows);

});


// ===============================
// DELETAR USUÁRIO
// ===============================
router.delete("/usuarios/:id", verificarToken, apenasAdmin, async (req,res)=>{

  await pool.query(
    "DELETE FROM usuarios WHERE id=$1",
    [req.params.id]
  );

  res.json({ok:true});

});

// ===============================
// ATUALIZAR USUÁRIO
// ===============================
router.put("/usuarios/:id", verificarToken, apenasAdmin, async (req,res)=>{

  const { id } = req.params;
  const { nome, email, senha, perfil } = req.body;

  try{

    if(senha){

      const hash = await bcrypt.hash(senha,10);

      await pool.query(
        `UPDATE usuarios
         SET nome=$1,email=$2,senha=$3,perfil=$4
         WHERE id=$5`,
         [nome,email,hash,perfil,id]
      );

    }else{

      await pool.query(
        `UPDATE usuarios
         SET nome=$1,email=$2,perfil=$3
         WHERE id=$4`,
         [nome,email,perfil,id]
      );

    }

    res.json({ok:true});

  }catch(err){

    console.error(err);
    res.status(500).json({erro:"Erro ao atualizar usuário"});

  }

});


module.exports = router;