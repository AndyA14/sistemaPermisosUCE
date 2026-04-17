// src/service/emailTemplates.service.js
const { enviarCorreo } = require('../service/mail.service');
require('dotenv').config();

const URL_FRONT = process.env.URL_FRONTEND;
const EMAIL_SOPORTE = process.env.EMAIL_SOPORTE;
const EMAIL_PERMISOS = process.env.EMAIL_PERMISOS;
const EMAIL_DIRECTOR = process.env.EMAIL_DIRECTOR;
const EMAIL_RRHH = process.env.EMAIL_RRHH;
const EMAIL_DTICS = process.env.EMAIL_DTICS;

/**
 * Plantilla genérica para el pie de página del correo.
 */
function plantillaFooter() {
  return `
    <div style="background-color: #f8f8f8; padding: 25px; text-align: center; font-size: 13px; color: #666;">
      <p><strong>Instituto Académico de Idiomas</strong> - Universidad Central del Ecuador</p>
      <p>Dirección: Av. América y Universitaria (esquina), Quito, Ecuador</p>
      <p>Tel: 098 167 7543 | Email: <a href="mailto:${EMAIL_SOPORTE}" style="color: #0066cc;">${EMAIL_SOPORTE}</a></p>
      <p>Web: <a href="https://www.uce.edu.ec/web/iai" style="color: #0066cc;">uce.edu.ec</a></p>
      <hr style="margin: 15px 0; border: none; border-top: 1px solid #ddd;" />
      <p style="font-size: 12px; color: #999;">
        Este mensaje fue generado automáticamente por el Sistema de Gestión de Permisos. No responda a este correo.<br>
        Para consultas comuníquese con el área de soporte técnico.
      </p>
    </div>
  `;
}

/**
 * Construye la cabecera común para todos los correos.
 */
function plantillaHeader() {
  return `
    <div style="background-color: #003366; color: #fff; padding: 24px; text-align: center;">
      <div style="display: flex; justify-content: center; align-items: center;">
        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRlG2ZniQvzJjbix-fZIaIFJ-gfn3bm6fhHkg&s" alt="Logo UCE" style="max-height: 80px; margin-bottom: 12px;" />
      </div>
      <h1 style="margin: 0; font-size: 24px;">Sistema de Gestión de Permisos</h1>
      <p style="margin: 0; font-size: 14px;">Instituto de Idiomas y Comunicación - UCE</p>
    </div>
  `;
}

/**
 * Envía correo con credenciales temporales al usuario.
 */
async function enviarCredenciales({ to, usuario, contrasena }) {
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; color: #2c3e50; max-width: 620px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
      ${plantillaHeader()}
      <div style="padding: 30px;">
        <h2 style="color: #003366; font-size: 20px;">Bienvenido(a) al sistema</h2>
        <p>Su cuenta ha sido creada con éxito. A continuación, encontrará sus credenciales de acceso temporales:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 12px; background: #f0f4f8; font-weight: bold;">Usuario</td>
            <td style="padding: 12px; background: #f9f9f9;">${usuario}</td>
          </tr>
          <tr>
            <td style="padding: 12px; background: #f0f4f8; font-weight: bold;">Contraseña temporal</td>
            <td style="padding: 12px; background: #f9f9f9;">${contrasena}</td>
          </tr>
        </table>
        <p style="font-size: 15px;">Le recomendamos iniciar sesión lo antes posible y actualizar su contraseña por una más segura.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${URL_FRONT}/login" style="background-color: #0066cc; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Iniciar sesión
          </a>
        </div>
      </div>
      ${plantillaFooter()}
    </div>
  `;
  await enviarCorreo({
    to,
    subject: 'Bienvenido - Credenciales de acceso al Sistema de Permisos',
    html,
  });
}

/**
 * Envía correo para restablecimiento de contraseña con enlace temporal.
 */
async function enviarResetPassword({ to, urlReset }) {
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; color: #2c3e50; max-width: 620px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
      ${plantillaHeader()}
      <div style="padding: 30px;">
        <h2 style="color: #003366; font-size: 20px;">Restablecimiento de contraseña</h2>
        <p>Hemos recibido una solicitud para restablecer su contraseña. Si fue usted quien la solicitó, haga clic en el siguiente botón:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${urlReset}" style="background-color: #cc0000; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Restablecer mi contraseña
          </a>
        </div>
        <p>Este enlace es válido por 1 hora. Si no solicitó este cambio, ignore este mensaje.</p>
      </div>
      ${plantillaFooter()}
    </div>
  `;
  await enviarCorreo({
    to,
    subject: 'Restablece tu contraseña - Sistema de Permisos',
    html,
  });
}

/**
 * Envía confirmación al usuario luego de un cambio exitoso de contraseña.
 */
async function enviarConfirmacionCambioPassword({ to }) {
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; color: #2c3e50; max-width: 620px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
      ${plantillaHeader()}
      <div style="padding: 30px;">
        <h2 style="color: #003366; font-size: 20px;">Cambio de contraseña exitoso</h2>
        <p>Este mensaje es para notificar que su contraseña fue <strong>cambiada exitosamente</strong> en el Sistema de Permisos.</p>
        <p>Si usted realizó esta acción, no se requiere ninguna intervención adicional.</p>
        <p style="color: #b30000; margin-top: 20px;">
          Si no fue usted quien realizó el cambio, por favor comuníquese inmediatamente con el área de soporte.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${URL_FRONT}/login" style="background-color: #0066cc; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Iniciar sesión
          </a>
        </div>
      </div>
      ${plantillaFooter()}
    </div>
  `;
  await enviarCorreo({
    to,
    subject: 'Confirmación de cambio de contraseña - Sistema de Permisos',
    html,
  });
}

async function generarCartaRespuestaHTML({ nombresUsuario, estado, observacion, cedula, correo, telefono, direccion, director }) {
  const estadoTexto = estado === 'autorizado' ? 'AUTORIZADO' : 'DENEGADO';
  const estadoColor = estado === 'autorizado' ? '#27ae60' : '#c0392b';
  const fecha = new Date().toLocaleDateString('es-EC', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  // (El resto del string HTML de generarCartaRespuestaHTML se mantiene exactamente igual a tu código original)
  const estilosCarta = `
    <style>
      body { font-family: "Times New Roman", Times, serif; color: #2c3e50; background-color: #ffffff; margin: 0; padding: 2cm; box-sizing: border-box; }
      .contenido { max-width: 700px; margin: auto; line-height: 1.6; }
      .encabezado { text-align: center; font-weight: bold; text-transform: uppercase; font-size: 1.2rem; margin-bottom: 1.5rem; }
      .logo-container { text-align: center; margin-bottom: 1rem; }
      .logo-container img { max-height: 100px; }
      .fecha { text-align: right; margin-bottom: 1.5rem; }
      .saludo { margin-bottom: 1rem; }
      .cuerpo { text-align: justify; margin-bottom: 1.5rem; }
      .firma { margin-top: 2rem; text-align: left; }
      .firma p { margin: 0.2rem 0; }
      .firma strong { font-size: 1rem; }
    </style>
  `;

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8" />
      ${estilosCarta}
    </head>
    <body>
      <div class="contenido">
        <div class="logo-container">
          <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRlG2ZniQvzJjbix-fZIaIFJ-gfn3bm6fhHkg&s" alt="Logo UCE" />
        </div>
        <div class="encabezado">
          INSTITUTO ACADÉMICO DE IDIOMAS<br />
          UNIVERSIDAD CENTRAL DEL ECUADOR
        </div>
        <div class="fecha">
          Quito, ${fecha}
        </div>
        <div class="saludo">
          Estimado(a) <strong>${nombresUsuario}</strong>:
        </div>
        <div class="cuerpo">
          En atención a su solicitud de permiso, se informa que esta ha sido <strong style="color: ${estadoColor}">${estadoTexto}</strong>.<br /><br />
          La siguiente es la respuesta oficial proporcionada por la Dirección del Instituto Académico de Idiomas:<br /><br />
          <em>"${observacion || 'Sin respuesta registrada.'}"</em><br /><br />
          Agradecemos su comunicación y quedamos atentos ante cualquier inquietud adicional.
        </div>
        <div class="firma">
          <p>Atentamente,</p>
          <strong>${director.nombres} ${director.apellidos}</strong><br />
          <p>Director del Instituto Académico de Idiomas</p>
          <p>C.I.: ${director.ci}</p>
          <p>Correo: ${director.correo}</p>
          ${director.telefono ? `<p>Teléfono: ${director.telefono}</p>` : ''}
          ${director.direccion ? `<p>Dirección: ${director.direccion}</p>` : ''}
        </div>
      </div>
    </body>
    </html>
  `;
}

module.exports = {
  enviarCredenciales,
  enviarResetPassword,
  enviarConfirmacionCambioPassword,
  generarCartaRespuestaHTML,
};