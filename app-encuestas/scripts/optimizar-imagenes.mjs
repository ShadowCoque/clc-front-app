// Script temporal de optimización: redimensiona a máx 800px de ancho y
// recomprime las imágenes de public/areas/ conservando nombre y extensión
// exactos (las URLs viven en la BD del backend como Area.imagenUrl).
// Requiere: npm install --no-save sharp   (no es dependencia del proyecto)
// Uso: node scripts/optimizar-imagenes.mjs
// Las originales se respaldan en ../areas-originales-backup (fuera de public/
// para que Vite no las copie al build).
import sharp from 'sharp';
import { readdir, stat, copyFile, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';

const DIR = path.resolve('public/areas');
const BACKUP = path.resolve('../areas-originales-backup');
const MAX_WIDTH = 800;

const kb = (b) => `${Math.round(b / 1024)} KB`;

await mkdir(BACKUP, { recursive: true });

const archivos = (await readdir(DIR)).filter((f) =>
  /\.(jpe?g|png)$/i.test(f),
);

let antesTotal = 0;
let despuesTotal = 0;

for (const nombre of archivos) {
  const ruta = path.join(DIR, nombre);
  const original = await stat(ruta);
  antesTotal += original.size;

  // Procesar desde buffer: en Windows sharp bloquea el archivo si se abre por ruta.
  const buffer = await readFile(ruta);
  const esPng = /\.png$/i.test(nombre);
  const meta = await sharp(buffer).metadata();

  let pipeline = sharp(buffer).rotate(); // .rotate() respeta la orientación EXIF
  if ((meta.width ?? 0) > MAX_WIDTH) {
    pipeline = pipeline.resize({ width: MAX_WIDTH });
  }
  pipeline = esPng
    ? pipeline.png({ palette: true, quality: 80, compressionLevel: 9 })
    : pipeline.jpeg({ quality: 75, mozjpeg: true });

  const optimizada = await pipeline.toBuffer();

  if (optimizada.length < original.size) {
    await copyFile(ruta, path.join(BACKUP, nombre));
    await writeFile(ruta, optimizada);
    despuesTotal += optimizada.length;
    console.log(
      `${nombre}: ${kb(original.size)} -> ${kb(optimizada.length)} (${meta.width}px -> ${Math.min(meta.width, MAX_WIDTH)}px)`,
    );
  } else {
    despuesTotal += original.size;
    console.log(`${nombre}: ${kb(original.size)} ya estaba optimizada, sin cambios`);
  }
}

console.log(`\nTotal: ${kb(antesTotal)} -> ${kb(despuesTotal)}`);
