import sharp from "sharp";

const files = [
  "assets/images/wyjscie-z-psem.png",
  "assets/images/kino.png",
];

for (const f of files) {
  const out = f.replace(".png", "_fixed.png");
  await sharp(f)
    .png({
      compressionLevel: 9,
      adaptiveFiltering: true,
      force: true,
    })
    .toFile(out);

  console.log("✅ fixed:", out);
}
