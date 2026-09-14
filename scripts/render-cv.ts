/**
 * Sunucusuz PDF üretimi: verilen cv.json + generation.json çiftini doğrudan
 * PDF'e basar. data/cv.json'a dokunmadan başka bir profil (ör. bir arkadaşın
 * CV'si) üretmek için kullanılır.
 *
 *   npm run render -- <cv.json> <generation.json> <çıktı.pdf>
 */
import fs from "node:fs/promises";
import path from "node:path";
import { BaseCV, Generation } from "@/lib/schema";
import { renderHtml, renderPdf } from "@/lib/pdf";

async function main() {
  const [cvPath, genPath, outPath] = process.argv.slice(2);
  if (!cvPath || !genPath || !outPath) {
    console.error("Kullanım: npm run render -- <cv.json> <generation.json> <çıktı.pdf>");
    process.exit(1);
  }

  const cv = BaseCV.parse(JSON.parse(await fs.readFile(cvPath, "utf8")));
  const gen = Generation.parse(JSON.parse(await fs.readFile(genPath, "utf8")));

  // .html uzantısı verilirse PDF yerine şablon HTML'i yazılır (şablon hata ayıklama / metin kontrolü)
  if (outPath.toLowerCase().endsWith(".html")) {
    await fs.mkdir(path.dirname(path.resolve(outPath)), { recursive: true });
    await fs.writeFile(outPath, renderHtml(cv, gen), "utf8");
    console.log(`${outPath} yazıldı (HTML, ${gen.language}/${gen.template})`);
    return;
  }

  const pdf = await renderPdf(cv, gen);
  await fs.mkdir(path.dirname(path.resolve(outPath)), { recursive: true });
  await fs.writeFile(outPath, pdf);
  console.log(`${outPath} yazıldı (${pdf.byteLength} bayt, ${gen.language}/${gen.template})`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
