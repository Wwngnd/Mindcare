const stressQuestions = [
  { q: "Seberapa stres kamu saat ini? (1-5)", opts: ["1 (Sangat Rendah)", "2 (Rendah)", "3 (Sedang)", "4 (Tinggi)", "5 (Sangat Tinggi)"] },
  { q: "Berapa hari kamu merasa stres?", type: "input", inputType: "number", placeholder: "Contoh: 14" },
  { q: "Apa penyebab utama stresmu?", opts: ["akademik", "pekerjaan", "hubungan", "finansial"] },
  { q: "Bagaimana kualitas tidurmu? (1-5)", opts: ["1 (Sangat Buruk)", "2 (Buruk)", "3 (Biasa Saja)", "4 (Baik)", "5 (Sangat Baik)"] },
  { q: "Berapa menit waktu luang yang kamu miliki setiap hari?", type: "input", inputType: "number", placeholder: "Contoh: 90" },
  { q: "Bagaimana suasana hatimu akhir-akhir ini? (0-4)", opts: ["0 (Sangat Buruk)", "1 (Buruk)", "2 (Biasa Saja)", "3 (Baik)", "4 (Sangat Baik)"] },
  { q: "Seberapa sering kamu melakukan aktivitas fisik?", opts: ["sering", "jarang"] },
  { q: "Apakah kamu suka berolahraga?", opts: ["ya", "tidak"] },
  { q: "Apakah kamu suka membaca buku?", opts: ["ya", "tidak"] },
  { q: "Apakah kamu suka menulis jurnal?", opts: ["ya", "tidak"] },
];

export default stressQuestions;
