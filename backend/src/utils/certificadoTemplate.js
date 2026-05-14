// backend/src/utils/certificadoTemplate.js

const generarHTMLCertificado = (datos) => {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <style>
        body, html {
          margin: 0; padding: 0; width: 100%; height: 100%;
          font-family: 'Times New Roman', Times, serif;
        }
        .contenedor {
          width: 100%; height: 100%; box-sizing: border-box;
          padding: 40px; display: flex; flex-direction: column;
        }
        .borde-doble {
          border: 10px double #1976d2; height: 100%; box-sizing: border-box;
          padding: 40px; display: flex; flex-direction: column; justify-content: space-between;
          text-align: center; position: relative;
        }
        .logo { width: 100px; margin-bottom: 15px; }
        .titulo { font-size: 28px; font-weight: bold; margin: 5px 0; }
        .subtitulo { font-size: 20px; margin: 5px 0; color: #333; }
        .texto-otorga { font-size: 22px; margin-top: 30px; }
        .nombre-estudiante { font-size: 45px; font-weight: bold; color: #2c3e50; text-transform: uppercase; margin: 20px 0; }
        .nivel { font-size: 30px; font-weight: bold; font-style: italic; margin: 15px 0; }
        .fecha { font-size: 18px; margin-bottom: 40px; }
        .firmas-container { display: flex; justify-content: space-around; margin-top: 50px; }
        .firma-bloque { width: 35%; text-align: center; }
        .linea-firma { border-bottom: 2px solid black; margin-bottom: 10px; height: 60px; }
        .nombre-firma { font-weight: bold; font-size: 18px; }
        .cargo-firma { font-size: 14px; color: #555; }
        .footer { display: flex; justify-content: space-between; align-items: flex-end; position: absolute; bottom: 40px; width: calc(100% - 80px); }
        .qr-placeholder { border: 2px dashed #999; width: 100px; height: 100px; display: flex; align-items: center; justify-content: center; background: #f9f9f9; color: #777; font-size: 12px; }
        .id-verificacion { font-size: 12px; color: #777; }
      </style>
    </head>
    <body>
      <div class="contenedor">
        <div class="borde-doble">
          
          <div>
            <img class="logo" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRlG2ZniQvzJjbix-fZIaIFJ-gfn3bm6fhHkg&s" alt="Logo IAI">
            <div class="titulo">INSTITUTO ACADÉMICO DE IDIOMAS</div>
            <div class="subtitulo">UNIVERSIDAD CENTRAL DEL ECUADOR</div>
          </div>

          <div>
            <div class="texto-otorga">Otorga el presente certificado a:</div>
            <div class="nombre-estudiante">${datos.estudiante_nombres} ${datos.estudiante_apellidos}</div>
            <div class="texto-otorga">Por haber aprobado satisfactoriamente el nivel de suficiencia de inglés:</div>
            <div class="nivel">${datos.nivel_ingles}</div>
            <div class="fecha">Fecha de Aprobación: <strong>${datos.fecha_aprobacion}</strong></div>
          </div>

          <div class="firmas-container">
            <div class="firma-bloque">
              <div class="linea-firma"></div>
              <div class="nombre-firma">${datos.docente_nombre}</div>
              <div class="cargo-firma">Docente a cargo</div>
            </div>
            <div class="firma-bloque">
              <div class="linea-firma"></div>
              <div class="nombre-firma">${datos.director_nombre}</div>
              <div class="cargo-firma">Director del Instituto</div>
            </div>
          </div>

          <div class="footer">
            <div class="qr-placeholder">QR Autogenerado</div>
            <div class="id-verificacion">ID de Verificación: ${datos.pin_verificacion}</div>
          </div>

        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = { generarHTMLCertificado };