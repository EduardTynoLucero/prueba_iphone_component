const $ = id =>
  document.getElementById(id);


/* ============================================================
   UTILIDADES
============================================================ */

function alertar(titulo, mensaje) {
  alert(
    titulo +
    "\n\n" +
    mensaje
  );
}


function hex16(buffer) {

  return [
    ...new Uint8Array(
      buffer.slice(0, 16)
    )
  ]
    .map(
      b =>
        b
          .toString(16)
          .padStart(2, "0")
    )
    .join("")
    .toUpperCase();
}


async function obtenerInfo(file) {

  const buffer =
    await file.arrayBuffer();


  const texto =
    "Nombre: " + file.name +
    "\nMIME: " + (file.type || "VACÍO") +
    "\nFile.size: " + file.size +
    "\nArrayBuffer: " +
    buffer.byteLength +
    " bytes" +
    "\nPrimeros 16 bytes HEX: " +
    hex16(buffer);


  return {
    buffer,
    texto
  };
}



/* ============================================================
   TABS
============================================================ */

document
  .querySelectorAll(".tab")
  .forEach(btn => {

    btn.addEventListener(
      "click",
      () => {

        document
          .querySelectorAll(".tab")
          .forEach(
            x =>
              x.classList.remove("active")
          );


        document
          .querySelectorAll(".panel")
          .forEach(
            x =>
              x.classList.remove("active")
          );


        btn.classList.add(
          "active"
        );


        $(
          btn.dataset.tab
        ).classList.add(
          "active"
        );

      }
    );

  });



/* ============================================================
   PRUEBA 1
   SOLO INPUT DEL IPHONE
   NO HACE HTTP
============================================================ */

$("localFile")
  .addEventListener(
    "change",
    async () => {

      const file =
        $("localFile").files?.[0];


      if (!file) {

        $("localResult")
          .textContent =
          "INPUT VACÍO";


        alertar(
          "INPUT VACÍO",
          "No existe archivo seleccionado."
        );

        return;
      }


      try {

        const info =
          await obtenerInfo(file);


        $("localResult")
          .textContent =
          info.texto;


        console.log(
          "ARCHIVO LOCAL:",
          info.texto
        );


        alertar(
          "ARCHIVO LLEGÓ AL COMPONENTE",
          info.texto
        );

      }
      catch (e) {

        const msg =
          e.name +
          "\n" +
          e.message;


        $("localResult")
          .textContent =
          msg;


        alertar(
          "ERROR LEYENDO ARCHIVO",
          msg
        );
      }

    }
  );



/* ============================================================
   PRUEBA 2
   REST APEX / ORDS
============================================================ */

function urlRest(filename) {

  const modo =
    $("mode").value;


  const base =
    modo === "proxy"
      ? "/proxy-upload"
      : $("endpoint").value.trim();


  return (
    base +
    "?filename=" +
    encodeURIComponent(filename)
  );
}



async function enviarRest(
  bytes,
  filename
) {

  const url =
    urlRest(filename);


  const antes =
    "URL: " + url +
    "\nOrigin: " +
    location.origin +
    "\nBytes: " +
    bytes.byteLength;


  alertar(
    "ANTES DEL POST A ORDS",
    antes
  );


  $("restResult")
    .textContent =
    antes +
    "\n\nEnviando...";


  try {

    const response =
      await fetch(
        url,
        {
          method:
            "POST",

          headers: {
            "Content-Type":
              "application/octet-stream",

            "Accept":
              "application/json"
          },

          body:
            bytes
        }
      );


    const text =
      await response.text();


    const resultado =
      "HTTP: " +
      response.status +

      "\nOK: " +
      response.ok +

      "\nContent-Type: " +
      (
        response.headers.get(
          "content-type"
        ) || "VACÍO"
      ) +

      "\n\n" +
      text;


    $("restResult")
      .textContent =
      resultado;


    alertar(
      "RESPUESTA ORDS",
      resultado
    );

  }
  catch (e) {

    const resultado =
      "FETCH FALLÓ" +

      "\nTipo: " +
      e.name +

      "\nMensaje: " +
      e.message +

      "\nURL: " +
      url;


    $("restResult")
      .textContent =
      resultado;


    alertar(
      "FETCH ORDS FALLÓ",
      resultado
    );
  }
}



$("sendFile")
  .addEventListener(
    "click",
    async () => {

      const file =
        $("restFile").files?.[0];


      if (!file) {

        alertar(
          "SIN ARCHIVO",
          "Selecciona un archivo."
        );

        return;
      }


      try {

        const info =
          await obtenerInfo(file);


        alertar(
          "ARCHIVO ANTES DEL POST",
          info.texto
        );


        await enviarRest(
          info.buffer,
          file.name
        );

      }
      catch (e) {

        alertar(
          "ERROR LEYENDO ARCHIVO",
          e.name +
          "\n" +
          e.message
        );
      }

    }
  );



$("send4")
  .addEventListener(
    "click",
    async () => {

      const bytes =
        new Uint8Array(
          [1, 2, 3, 4]
        );


      await enviarRest(
        bytes,
        "test.jpg"
      );

    }
  );



/* ============================================================
   PRUEBA 3
   DIRECTO CONTRA OCI
   NO PASA POR APEX
   NO PASA POR ORDS
============================================================ */

$("sendOci")
  .addEventListener(
    "click",
    async () => {

      const file =
        $("ociFile").files?.[0];


      let base =
        $("ociEndpoint")
          .value
          .trim();


      if (!base) {

        alertar(
          "FALTA URL OCI",
          "Pega la URL base OCI que termina en /o/."
        );

        return;
      }


      if (!file) {

        alertar(
          "SIN ARCHIVO",
          "Selecciona un archivo."
        );

        return;
      }


      try {

        const info =
          await obtenerInfo(file);


        /*
         * Garantizamos que la URL
         * termine solamente en /
         */
        base =
          base.replace(
            /\/+$/,
            "/"
          );


        const url =
          base +
          encodeURIComponent(
            file.name
          );


        alertar(
          "ANTES DEL PUT DIRECTO A OCI",

          info.texto +

          "\n\nMétodo: PUT" +

          "\nURL final: " +
          url
        );


        $("ociResult")
          .textContent =

          "Enviando " +
          info.buffer.byteLength +
          " bytes directamente a OCI...";


        /*
         * IMPORTANTE:
         *
         * NO APEX.
         * NO ORDS.
         * NO REST nuestro.
         *
         * Navegador → OCI directamente.
         */
        const response =
          await fetch(
            url,
            {
              method:
                "PUT",

              headers: {
                "Content-Type":
                  file.type ||
                  "application/octet-stream"
              },

              body:
                info.buffer
            }
          );


        const text =
          await response.text();


        const resultado =
          "HTTP: " +
          response.status +

          "\nOK: " +
          response.ok +

          "\nContent-Type respuesta: " +
          (
            response.headers.get(
              "content-type"
            ) || "VACÍO"
          ) +

          "\n\nBody respuesta:" +

          "\n" +
          (
            text ||
            "(OCI no devolvió body)"
          );


        $("ociResult")
          .textContent =
          resultado;


        alertar(
          "RESPUESTA OCI DIRECTA",
          resultado
        );

      }
      catch (e) {

        const resultado =
          "PUT DIRECTO A OCI FALLÓ" +

          "\n\nTipo: " +
          e.name +

          "\nMensaje: " +
          e.message +

          "\n\nSi aparece Load failed / Failed to fetch," +

          "\npuede tratarse de CORS, TLS o red.";


        $("ociResult")
          .textContent =
          resultado;


        alertar(
          "ERROR OCI DIRECTO",
          resultado
        );
      }

    }
  );