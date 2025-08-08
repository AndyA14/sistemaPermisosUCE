const crypto = require('crypto');

async function generarUsernameInteligente(nombres, apellidos, repo) {
  if (!nombres || !apellidos) {
    throw new Error('Nombres o apellidos no válidos');
  }

  const nombresArr = nombres.trim().toLowerCase().split(/\s+/);
  const apellidosArr = apellidos.trim().toLowerCase().split(/\s+/);

  const nombre1 = nombresArr[0] || '';
  const nombre2 = nombresArr[1] || '';
  const apellido1 = apellidosArr[0] || '';
  const apellido2 = apellidosArr[1] || '';

  if (!nombre1 || !apellido1) {
    throw new Error('No se pudo generar el username: datos insuficientes');
  }

  const base = `${nombre1[0]}${nombre2[0] || ''}${apellido1}`;
  const alternativo = `${base}${apellido2[0] || ''}`;

  if (!await repo.findOne({ where: { username: base } })) return base;
  if (!await repo.findOne({ where: { username: alternativo } })) return alternativo;

  // Generar con número incremental si ya existen
  let contador = 1;
  let usernameFinal = `${base}${contador}`;
  while (await repo.findOne({ where: { username: usernameFinal } })) {
    contador++;
    usernameFinal = `${base}${contador}`;
  }

  return usernameFinal;
}

function generarPassword(length = 6) {
  return crypto.randomBytes(length).toString('base64').slice(0, length);
}

module.exports = {
  generarUsernameInteligente,
  generarPassword,
};
