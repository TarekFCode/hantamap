import sharp from "sharp";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const svgPath = path.join(__dirname, "../public/social-preview.svg");
const pngPath = path.join(__dirname, "../public/social-preview.png");

const svg = await readFile(svgPath);
await sharp(svg).png().toFile(pngPath);
console.log("Generated public/social-preview.png (1200x630)");
