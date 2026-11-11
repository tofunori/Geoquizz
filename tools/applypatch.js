// Applique un fichier .patch (blocs @@ fichier, <<<< ancien ==== nouveau >>>>) ; chaque ancien texte doit apparaître exactement une fois.
const fs = require("fs"), crypto = require("crypto");
function apply(patch, read, write) {
  let file = null; const out = {};
  const lines = patch.split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("@@ ")) { file = lines[i].slice(3).trim(); if (!(file in out)) out[file] = read(file); continue; }
    if (lines[i] === "<<<<") {
      const a = [], b = []; i++;
      while (lines[i] !== "====") a.push(lines[i++]); i++;
      while (lines[i] !== ">>>>") b.push(lines[i++]);
      const o = a.join("\n"), n = b.join("\n"), parts = out[file].split(o);
      if (parts.length !== 2) throw new Error(file + " : " + (parts.length - 1) + " occurrence(s) de : " + o.slice(0, 70));
      out[file] = parts.join(n);
    }
  }
  for (const f in out) write(f, out[f]);
  return out;
}
module.exports = apply;
if (require.main === module) {
  const out = apply(fs.readFileSync(process.argv[2], "utf8"), f => fs.readFileSync(f, "utf8"), (f, s) => fs.writeFileSync(f, s));
  for (const f in out) console.log(f, crypto.createHash("sha256").update(out[f]).digest("hex").slice(0, 16));
}
