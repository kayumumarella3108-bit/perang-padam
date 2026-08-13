import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "2mb" }));

  // API Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // API endpoint for trend analysis via Gemini API
  app.post("/api/gemini/analyze-trend", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        res.status(500).json({ error: "GEMINI_API_KEY tidak dikonfigurasi di lingkungan server." });
        return;
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const { trendData, totalGangguan, avgGangguan } = req.body;

      const prompt = `Anda adalah Engineer Pakar Keandalan Sistem Tenaga Listrik 20kV di PLN ULP Baguala (Ambon).
Berikut data tren gangguan bulanan 6 bulan terakhir:
${JSON.stringify(trendData, null, 2)}

KPI Rangkuman:
- Total Gangguan (6 Bulan): ${totalGangguan} kejadian
- Rata-Rata Gangguan Bulanan: ${avgGangguan} trip/bulan

Tugas Anda:
Berikan analisis naratif ringkas, lugas, profesional, dan berorientasi aksi operasional PLN ULP Baguala (dalam 3 poin utama berstruktur) mengenai:
1. **Evaluasi Tren & Pola Fluktuasi**: Analisis pergerakan angka gangguan bulanan, bulan mana yang mengalami puncak (peak), dan perbandingannya.
2. **Analisis Akar Penyebab Utama**: Evaluasi kontribusi gangguan akibat faktor pohon/ROW SUTM versus faktor teknis/alat/cuaca berdasarkan data.
3. **Rekomendasi Taktis Tim Teknik**: Berikan 3 langkah konkrit mitigasi pemeliharaan/perintisan pohon yang paling efektif untuk menurunkan angka trip bulan berikutnya.

Format respons dalam Bahasa Indonesia profesional PLN, gunakan bullet point bold yang jelas, bersih, tanpa pembuka/penutup yang berlebih.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          systemInstruction: "Anda adalah Engineer Analis Keandalan Jaringan Distribusi 20kV PLN ULP Baguala.",
          temperature: 0.7,
        },
      });

      res.json({ analysis: response.text || "Tidak ada narasi yang dihasilkan." });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: error?.message || "Gagal menghasilkan analisis Gemini AI." });
    }
  });

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
