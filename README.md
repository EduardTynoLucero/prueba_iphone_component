# Diagnóstico Upload iPhone

Proyecto mínimo para aislar el problema entre iPhone/Safari, un `<input type="file">` y el endpoint ORDS.

## Ejecutar

```bash
npm install
npm run dev
```

Vite mostrará algo similar a:

```text
Local:   http://localhost:5173/
Network: http://192.168.1.50:5173/
```

Para probar desde iPhone, PC e iPhone deben estar en la misma red Wi‑Fi. En Safari abre la URL `Network` que muestre Vite.

## Tabs

### 1. Archivo local

No hace ninguna petición. Al seleccionar un archivo muestra y alerta:
- nombre
- MIME
- `File.size`
- bytes del `ArrayBuffer`
- primeros 16 bytes en hexadecimal

Si esta prueba funciona en iPhone, el selector y la lectura local del archivo funcionan.

### 2. Probar REST

Permite:
- enviar un archivo real como body binario (`application/octet-stream`)
- enviar solo 4 bytes sin seleccionar archivo

Tiene dos modos:

**Directo navegador → ORDS**

Prueba exactamente la llamada desde Safari al endpoint. Si falla por CORS/red/TLS, aparecerá `FETCH FALLÓ`.

**Vía proxy local de Vite**

Safari llama al servidor Vite y Vite reenvía al endpoint ORDS. Esto elimina CORS del navegador y ayuda a distinguir si el problema está en CORS/browser o en el endpoint.

## Interpretación rápida

- Tab 1 falla: problema al obtener/leer el archivo en iPhone.
- Tab 1 funciona + POST directo falla + proxy funciona: problema cross-origin/CORS o comportamiento del navegador hacia ORDS.
- Tab 1 funciona + directo y proxy fallan: revisar endpoint/ORDS/red/TLS.
- Enviar 4 bytes funciona pero archivo real falla: revisar tamaño/body binario/request real.
