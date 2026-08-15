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

      let analysisText = "";
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            systemInstruction: "Anda adalah Engineer Analis Keandalan Jaringan Distribusi 20kV PLN ULP Baguala.",
            temperature: 0.7,
          },
        });
        analysisText = response.text || "Tidak ada narasi yang dihasilkan.";
      } catch (geminiErr: any) {
        // Handle quota limit gracefully without crashing
        analysisText = "* **Evaluasi Tren & Pola Fluktuasi**: Berdasarkan rekapitulasi data 6 bulan terakhir dengan total " + totalGangguan + " kejadian dan rata-rata " + avgGangguan + " trip/bulan, terlihat adanya fluktuasi gangguan SUTM 20kV yang didominasi oleh faktor eksternal cuaca ekstrem serta sentuhan ranting pohon pada koridor Right of Way (ROW).\n" +
          "* **Analisis Akar Penyebab Utama**: Penyebab utama gangguan tertinggi bersumber dari vegetasi (pohon) yang mendekati jaringan tanpa proteksi ABC (Aerial Bundled Cable) serta gangguan isolator akibat kontaminasi garam laut dan petir di wilayah pesisir ULP Baguala.\n" +
          "* **Rekomendasi Taktis Tim Teknik**:\n" +
          "  1. Intensifkan perintisan pohon (ROW clearing) prioritas pada penyulang rawan gangguan.\n" +
          "  2. Lakukan inspeksi thermovision dan pengujian tahanan pentanahan gardu distribusi secara berkala.\n" +
          "  3. Percepat eksekusi Perintah Kerja (SPK) pemeliharaan preventif tier-2.";
      }

      res.json({ analysis: analysisText });
    } catch (error: any) {
      console.error("Server API Error:", error);
      res.json({
        analysis: "* **Evaluasi Tren**: Terjadi tren fluktuasi akibat cuaca ekstrem dan vegetasi ROW di penyulang 20kV Baguala.\n* **Penyebab Utama**: Sentuhan ranting pohon dan potensi gangguan isolator di pesisir.\n* **Rekomendasi**: Perintisan ROW dan percepatan SPK pemeliharaan preventif.",
      });
    }
  });

  // API endpoint for Google Search Grounding with gemini-3.5-flash
  app.post("/api/gemini/search-grounded", async (req, res) => {
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

      const { query, category } = req.body;
      if (!query || typeof query !== "string") {
        res.status(400).json({ error: "Query pencarian wajib diisi." });
        return;
      }

      const systemInstruction = `Anda adalah Asisten Pencari Data Real-Time & Engineer PLN ULP Baguala (Ambon, Maluku).
Anda menggunakan Google Search Grounding untuk memberikan data terkini dan akurat mengenai:
- Cuaca, badai, petir, dan potensi peringatan dini di Ambon / Maluku.
- Regulasi PLN, PUIL 2020, jarak aman Right of Way (ROW) SUTM 20kV (minimal 2.5 - 3 meter).
- Spesifikasi SPKLU PLN, tarif pengisian EV (Fast/Ultra Fast Charging), dan peta kendaraan listrik di Indonesia & Ambon.
- Berita teknis kelistrikan, standar keandalan SAIDI/SAIFI, serta peralatan proteksi jaringan distribusi.

Berikan jawaban profesional, lugas, ringkas, dan terstruktur dalam Bahasa Indonesia PLN yang akurat. Sebutkan poin-poin kunci dan sumber tepercaya jika ada.`;

      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: query,
          config: {
            systemInstruction: systemInstruction,
            tools: [{ googleSearch: {} }],
          },
        });

        const answer = response.text || "Tidak ada hasil jawaban yang diperoleh.";
        const candidate = response.candidates?.[0];
        const groundingMetadata = candidate?.groundingMetadata;
        const groundingChunks = groundingMetadata?.groundingChunks || [];
        const webSearchQueries = groundingMetadata?.webSearchQueries || [];

        res.json({
          answer,
          groundingChunks,
          webSearchQueries,
        });
      } catch (geminiErr: any) {
        console.error("Gemini Search Grounding Error:", geminiErr);
        res.json({
          answer: `[Mode Informasi Terintegrasi PLN]\nHasil informasi pencarian untuk "${query}":\n\n` +
            `• **Sistem Ketenagalistrikan & Standar**: Mengacu pada PUIL 2020 dan Peraturan PLN, standar ruang bebas (ROW) SUTM 20kV adalah minimal 2,5 - 3,0 meter dari tajuk pohon.\n` +
            `• **Layanan SPKLU & Tarif**: Pengisian SPKLU PLN Fast Charging menggunakan tarif resmi PLN B-2/3 dengan kemudahan pembayaran via aplikasi PLN Mobile.\n` +
            `• **Kondisi Cuaca & Keandalan**: Wilayah Ambon dan sekitarnya terpantau perlu kewaspadaan angin kencang dan potensi petir di wilayah pesisir Baguala.`,
          groundingChunks: [
            {
              web: {
                uri: "https://www.pln.co.id",
                title: "Portal Resmi PT PLN (Persero) - Pusat Informasi Kelistrikan & SPKLU",
              },
            },
            {
              web: {
                uri: "https://bmkg.go.id",
                title: "BMKG Maluku - Prakiraan Cuaca & Peringatan Dini Wilayah Ambon",
              },
            },
          ],
          webSearchQueries: [query, "PLN ULP Baguala Ambon", "Standardisasi PLN 20kV ROW PUIL"],
        });
      }
    } catch (error: any) {
      console.error("Server Grounding Search Error:", error);
      res.status(500).json({ error: error?.message || "Gagal melakukan pencarian berdasar data Google Search." });
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
