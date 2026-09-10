const $ = (id) => document.getElementById(id);

const ORDS_DIRECT = $('endpoint');

function hex16(buffer) {
  return [...new Uint8Array(buffer.slice(0, 16))]
    .map(b => b.toString(16).padStart(2, '0'))
    .join('').toUpperCase();
}

function showAlert(title, data) {
  alert(title + '\n\n' + data);
}

async function fileInfo(file) {
  const buffer = await file.arrayBuffer();
  return {
    buffer,
    text:
      `Nombre: ${file.name}\n` +
      `MIME: ${file.type || '(vacío)'}\n` +
      `File.size: ${file.size}\n` +
      `ArrayBuffer: ${buffer.byteLength} bytes\n` +
      `Primeros 16 bytes HEX: ${hex16(buffer)}`
  };
}

// Tabs
document.querySelectorAll('.tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(x => x.classList.remove('active'));
    btn.classList.add('active');
    $(btn.dataset.tab).classList.add('active');
  });
});

// PRUEBA 1: no hace ninguna petición
$('localFile').addEventListener('change', async () => {
  const file = $('localFile').files?.[0];
  if (!file) {
    $('localResult').textContent = 'INPUT VACÍO';
    showAlert('INPUT VACÍO', 'No existe archivo seleccionado.');
    return;
  }

  try {
    const info = await fileInfo(file);
    $('localResult').textContent = info.text;
    console.log('PRUEBA LOCAL:', info.text);
    showAlert('ARCHIVO LLEGÓ AL COMPONENTE', info.text);
  } catch (e) {
    $('localResult').textContent = `ERROR leyendo archivo: ${e.name} - ${e.message}`;
    showAlert('ERROR LEYENDO ARCHIVO', `${e.name}\n${e.message}`);
  }
});

function buildUrl(filename) {
  const mode = $('mode').value;
  const base = mode === 'proxy' ? '/proxy-upload' : ORDS_DIRECT.value.trim();
  return base + '?filename=' + encodeURIComponent(filename);
}

async function postBytes(bytes, filename) {
  const url = buildUrl(filename);
  const detail =
    `Modo: ${$('mode').value}\n` +
    `URL: ${url}\n` +
    `Origin: ${location.origin}\n` +
    `Bytes a enviar: ${bytes.byteLength}`;

  showAlert('ANTES DEL POST', detail);
  $('restResult').textContent = detail + '\n\nEnviando...';
  console.log('ANTES DEL POST:', detail);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'Accept': 'application/json'
      },
      body: bytes
    });

    const text = await response.text();
    const result = `HTTP: ${response.status}\nContent-Type: ${response.headers.get('content-type')}\n\n${text}`;
    $('restResult').textContent = result;
    console.log('RESPUESTA REST:', result);
    showAlert('RESPUESTA REST', result);
  } catch (e) {
    const result =
      `FETCH FALLÓ\n` +
      `Tipo: ${e.name}\n` +
      `Mensaje: ${e.message}\n\n` +
      `Origin: ${location.origin}\n` +
      `URL: ${url}`;

    $('restResult').textContent = result;
    console.error(result, e);
    showAlert('FETCH FALLÓ', result);
  }
}

// PRUEBA 2A: archivo real
$('sendFile').addEventListener('click', async () => {
  const file = $('restFile').files?.[0];
  if (!file) {
    showAlert('SIN ARCHIVO', 'Selecciona un archivo primero.');
    return;
  }

  try {
    const info = await fileInfo(file);
    showAlert('ARCHIVO ANTES DEL POST', info.text);
    await postBytes(info.buffer, file.name);
  } catch (e) {
    showAlert('ERROR LEYENDO ARCHIVO', `${e.name}\n${e.message}`);
  }
});

// PRUEBA 2B: 4 bytes, sin archivo
$('send4').addEventListener('click', async () => {
  const bytes = new Uint8Array([1, 2, 3, 4]);
  await postBytes(bytes, 'test.jpg');
});
