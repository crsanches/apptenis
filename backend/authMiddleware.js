const jwt = require("jsonwebtoken");

function verificarToken(req,res,next){

  const auth = req.headers.authorization;

  if(!auth)
    return res.status(401).json({erro:"Token não enviado"});

  const token = auth.split(" ")[1];

  try{

    const decoded = jwt.verify(token,"segredo");

    req.usuario = decoded;

    next();

  }catch{

    return res.status(401).json({erro:"Token inválido"});

  }

}

function apenasAdmin(req,res,next){

  if(req.usuario.perfil !== "admin")
    return res.status(403).json({erro:"Apenas administrador"});

  next();
}

module.exports = {verificarToken,apenasAdmin};