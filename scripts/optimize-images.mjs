import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const assetsDir = path.join(root, "assets");
const thumbsDir = path.join(assetsDir, "thumbs");
const mediumDir = path.join(assetsDir, "medium");

const THUMB_SIZE = 180;
const MEDIUM_WIDTH = 600;

fs.mkdirSync(thumbsDir, { recursive: true });
fs.mkdirSync(mediumDir, { recursive: true });

const archivos = fs.readdirSync(assetsDir).filter((f) =>
    /\.(jpe?g|png|webp)$/i.test(f)
);

if (archivos.length === 0) {
    console.log("No hay imágenes en assets/ para optimizar.");
    process.exit(0);
}

for (const archivo of archivos) {
    const entrada = path.join(assetsDir, archivo);
    const base = path.parse(archivo).name;

    await sharp(entrada)
        .resize(THUMB_SIZE, THUMB_SIZE, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: 75 })
        .toFile(path.join(thumbsDir, `${base}.webp`));

    await sharp(entrada)
        .resize(THUMB_SIZE, THUMB_SIZE, { fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 80, mozjpeg: true })
        .toFile(path.join(thumbsDir, `${base}.jpg`));

    await sharp(entrada)
        .resize(MEDIUM_WIDTH, null, { withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(path.join(mediumDir, `${base}.webp`));

    await sharp(entrada)
        .resize(MEDIUM_WIDTH, null, { withoutEnlargement: true })
        .jpeg({ quality: 82, mozjpeg: true })
        .toFile(path.join(mediumDir, `${base}.jpg`));

    const original = fs.statSync(entrada).size;
    const thumb = fs.statSync(path.join(thumbsDir, `${base}.webp`)).size;
    const med = fs.statSync(path.join(mediumDir, `${base}.webp`)).size;

    console.log(`${archivo}: ${(original / 1024).toFixed(1)} KB → thumb ${(thumb / 1024).toFixed(1)} KB, medium ${(med / 1024).toFixed(1)} KB`);
}

console.log("Listo. Miniaturas en assets/thumbs/, medianas en assets/medium/");
