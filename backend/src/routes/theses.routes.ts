import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import csv from "csv-parser";
import prisma from "../prisma";
import { authenticate } from "../middlewares/auth.middleware";

const router = express.Router();
const uploadsRoot = path.join(__dirname, "..", "..", "uploads");
const csvUploadsDir = uploadsRoot;
const pdfUploadsDir = path.join(uploadsRoot, "pdfs");
const zipUploadsDir = path.join(uploadsRoot, "zips");

if (!fs.existsSync(csvUploadsDir)) {
  fs.mkdirSync(csvUploadsDir, { recursive: true });
}

if (!fs.existsSync(pdfUploadsDir)) {
  fs.mkdirSync(pdfUploadsDir, { recursive: true });
}

if (!fs.existsSync(zipUploadsDir)) {
  fs.mkdirSync(zipUploadsDir, { recursive: true });
}
const upload = multer({ dest: csvUploadsDir });

router.post("/upload-csv", upload.single("file"), async (req, res) => {
  const results: any[] = [];

  if (!req.file) {
    return res.status(400).json({ message: "CSV fajl nije poslat" });
  }

  const filePath = req.file.path;
  const normalizeTitle = (value: string) =>
    value.trim().toLowerCase().replace(/\s+/g, " ");

  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", async () => {
      try {
        const seenTitles = new Map<string, number[]>();
        results.forEach((row, index) => {
          const title = (row.title || "").trim();
          if (!title) {
            throw new Error(`Red ${index + 2}: Naslov rada je obavezan`);
          }
          const normalized = normalizeTitle(title);
          const rows = seenTitles.get(normalized) ?? [];
          rows.push(index + 2);
          seenTitles.set(normalized, rows);
        });

        const duplicateInCsv = Array.from(seenTitles.entries()).filter(([, rows]) => rows.length > 1);
        if (duplicateInCsv.length > 0) {
          const messages = duplicateInCsv.map(([normalized, rows]) => {
            const originalTitle = results[rows[0] - 2]?.title || normalized;
            return `"${originalTitle}" (redovi ${rows.join(", ")})`;
          });
          throw new Error(`Dupli naslovi u CSV: ${messages.join("; ")}`);
        }

        const uniqueTitles = Array.from(seenTitles.keys());
        if (uniqueTitles.length > 0) {
          const existing = await prisma.theses.findMany({
            where: {
              OR: uniqueTitles.map((title) => ({
                title: { equals: title, mode: "insensitive" },
              })),
            },
            select: { title: true },
          });

          if (existing.length > 0) {
            const existingSet = new Set(existing.map((t) => normalizeTitle(t.title)));
            const duplicatesWithDb = Array.from(seenTitles.entries())
              .filter(([normalized]) => existingSet.has(normalized))
              .map(([normalized, rows]) => {
                const originalTitle = results[rows[0] - 2]?.title || normalized;
                return `"${originalTitle}" (red ${rows[0]})`;
              });

            if (duplicatesWithDb.length > 0) {
              if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
              }
              return res.status(409).json({
                message: `Naslovi vec postoje u bazi: ${duplicatesWithDb.join("; ")}`,
              });
            }
          }
        }

        const thesesData = results.map((row, index) => {
          const parsedYear = Number(row.year);
          if (Number.isNaN(parsedYear) || parsedYear < 1900 || parsedYear > 2100) {
            throw new Error(`Red ${index + 2}: Neispravna godina (${row.year})`);
          }

          return {
            first_name: (row.first_name || "").trim(),
            last_name: (row.last_name || "").trim(),
            title: (row.title || "").trim(),
            subtitle: row.subtitle && row.subtitle.trim() ? row.subtitle.trim() : null,
            title_language: (row.title_language || "en").trim(),
            additional_title: row.additional_title && row.additional_title.trim() ? row.additional_title.trim() : null,
            additional_subtitle: row.additional_subtitle && row.additional_subtitle.trim() ? row.additional_subtitle.trim() : null,
            additional_title_language: row.additional_title_language && row.additional_title_language.trim()
              ? row.additional_title_language.trim()
              : null,
            type: (row.type || "").trim().toLowerCase(),
            year: parsedYear,
            file_url: row.file_url && row.file_url.trim() ? row.file_url.trim() : "",
            mentor: row.mentor && row.mentor.trim() ? row.mentor.trim() : null,
            committee_members: row.committee_members && row.committee_members.trim() ? row.committee_members.trim() : null,
            grade: row.grade && row.grade.trim() ? row.grade.trim().toUpperCase() : null,
            keywords: row.keywords && row.keywords.trim() ? row.keywords.trim() : null,
            language: row.language && row.language.trim() ? row.language.trim() : null,
            abstract: row.abstract && row.abstract.trim() ? row.abstract.trim() : null,
            defense_date: row.defense_date && row.defense_date.trim() ? new Date(row.defense_date) : null,
            user_id: null as number | null, // CSV import - user_id je null, admin može kasnije dodijeliti
          };
        });

        // @ts-ignore - Prisma klijent će biti ažuriran nakon restarta servera
        await prisma.theses.createMany({
          // @ts-ignore
          data: thesesData,
        });

        fs.unlinkSync(filePath);

        res.json({
          message: "CSV uspjesno importovan",
          count: thesesData.length,
        });
      } catch (err: any) {
        console.error("Greška pri importu CSV:", err);
        fs.unlinkSync(filePath); // Obriši fajl i u slučaju greške
        res.status(500).json({ 
          message: err.message || "Greska pri importu CSV",
          error: err.toString()
        });
      }
    })
    .on("error", (err) => {
      console.error("Greška pri čitanju CSV fajla:", err);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      res.status(500).json({ 
        message: "Greška pri čitanju CSV fajla",
        error: err.message
      });
    });
});

router.post("/", authenticate, async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      title,
      subtitle,
      title_language,
      additional_title,
      additional_subtitle,
      additional_title_language,
      type,
      year,
      file_url,
      mentor,
      committee_members,
      grade,
      keywords,
      language,
      abstract,
      defense_date,
      user_id,
    } = req.body;

    if (!first_name || !last_name || !title || !title_language || !type || !keywords || !mentor) {
      return res.status(400).json({ message: "Obavezna polja nisu popunjena (ime, prezime, naslov, jezik naslova, tip, ključne riječi, mentor)" });
    }

    const parsedYear = Number(year);
    if (Number.isNaN(parsedYear) || parsedYear < 1900 || parsedYear > 2100) {
      return res.status(400).json({ message: "Godina mora biti izmedju 1900 i 2100" });
    }

    // Ako je admin i poslao user_id, koristi taj
    // Ako je alumnista, koristi njegov ID
    // Ako nema user_id, ostavi null
    let finalUserId = null;
    if (req.user?.role === 'admin' && user_id) {
      finalUserId = user_id;
    } else if (req.user?.role !== 'admin') {
      finalUserId = req.user?.id || null;
    }

    const newThesis = await prisma.theses.create({
      data: {
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        title: title.trim(),
        subtitle: subtitle ? subtitle.trim() : null,
        title_language: title_language.trim(),
        additional_title: additional_title ? additional_title.trim() : null,
        additional_subtitle: additional_subtitle ? additional_subtitle.trim() : null,
        additional_title_language: additional_title_language ? additional_title_language.trim() : null,
        type: type.trim().toLowerCase(),
        year: parsedYear,
        file_url: file_url || "",
        mentor: mentor.trim(),
        committee_members: committee_members || null,
        grade: grade || null,
        keywords: keywords.trim(),
        language: language || null,
        abstract: abstract || null,
        defense_date: defense_date ? new Date(defense_date) : null,
        user_id: finalUserId,
      },
    });

    res.json({
      message: "Rad uspjesno dodat",
      thesis: newThesis,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Greska pri dodavanju rada" });
  }
});

router.get("/", async (req, res) => {
  try {
    const theses = await prisma.theses.findMany({
      orderBy: {
        year: "desc",
      },
    });

    const formatted = theses.map((t: any) => ({
      id: t.id,
      user_id: t.user_id,
      first_name: t.first_name,
      last_name: t.last_name,
      title: t.title,
      subtitle: t.subtitle,
      title_language: t.title_language,
      additional_title: t.additional_title,
      additional_subtitle: t.additional_subtitle,
      additional_title_language: t.additional_title_language,
      date: t.year ? `01.07.${t.year}.` : "",
      type: t.type,
      fileUrl: t.file_url,
      zipUrl: t.zip_file,
      year: t.year,
      mentor: t.mentor,
      committee_members: t.committee_members,
      grade: t.grade,
      keywords: t.keywords,
      language: t.language,
      abstract: t.abstract,
      defense_date: t.defense_date,
      download_count: t.download_count,
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Greska pri dohvatanju radova" });
  }
});

const thesisPdfStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, pdfUploadsDir);
  },
  filename: (req, file, cb) => {
    const originalExt = path.extname(file.originalname).toLowerCase();
    const ext = originalExt === ".pdf" ? originalExt : ".pdf";
    const baseName =
      path
        .basename(file.originalname, path.extname(file.originalname))
        .replace(/[^a-zA-Z0-9_-]+/g, "_")
        .replace(/^_+|_+$/g, "") || "thesis";

    cb(null, `${Date.now()}_${baseName}${ext}`);
  },
});

const pdfUpload = multer({
  storage: thesisPdfStorage,
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Dozvoljeni su samo PDF fajlovi"));
    }

    cb(null, true);
  },
});


const thesisZipStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, zipUploadsDir);
  },
  filename: (req, file, cb) => {
    const originalExt = path.extname(file.originalname).toLowerCase();
    const ext = originalExt === ".zip" ? originalExt : ".zip";
    const baseName =
      path
        .basename(file.originalname, path.extname(file.originalname))
        .replace(/[^a-zA-Z0-9_-]+/g, "_")
        .replace(/^_+|_+$/g, "") || "thesis_docs";

    cb(null, `${Date.now()}_${baseName}${ext}`);
  },
});

const zipUpload = multer({
  storage: thesisZipStorage,
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/zip",
      "application/x-zip-compressed",
      "multipart/x-zip",
      "application/octet-stream",
    ];
    const ext = path.extname(file.originalname).toLowerCase();

    if (ext !== ".zip" && !allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Dozvoljeni su samo ZIP fajlovi"));
    }

    cb(null, true);
  },
});
router.post("/upload-pdf/:id", pdfUpload.single("file"), async (req, res) => {
  try {
    const thesisId = Number(req.params.id);
    const { type, title, year } = req.body as {
      type?: string;
      title?: string;
      year?: string;
    };

    if (!thesisId || Number.isNaN(thesisId)) {
      return res.status(400).json({ message: "Neispravan ID rada" });
    }

    const existingThesis = await prisma.theses.findUnique({
      where: { id: thesisId },
      select: { file_url: true },
    });

    if (!existingThesis) {
      return res.status(404).json({ message: "Rad nije pronadjen" });
    }

    if (!req.file && !existingThesis.file_url) {
      return res.status(400).json({ message: "PDF nije poslat" });
    }

    const allowedTypes = ["bachelors", "masters", "specialist"];
    const normalizedType = (type || "").trim().toLowerCase();

    if (!allowedTypes.includes(normalizedType)) {
      return res.status(400).json({ message: "Neispravan tip studija" });
    }

    const updateData: {
      file_url?: string;
      type: string;
      title?: string;
      year?: number;
    } = {
      type: normalizedType,
    };

    if (req.file) {
      updateData.file_url = `/uploads/pdfs/${req.file.filename}`;
    }

    if (typeof title === "string" && title.trim()) {
      updateData.title = title.trim();
    }

    if (typeof year === "string" && year.trim()) {
      const parsedYear = Number(year);

      if (Number.isNaN(parsedYear) || parsedYear < 1900 || parsedYear > 2100) {
        return res.status(400).json({ message: "Godina mora biti izmedju 1900 i 2100" });
      }

      updateData.year = parsedYear;
    }

    const updatedThesis = await prisma.theses.update({
      where: { id: thesisId },
      data: updateData,
    });

    res.json({
      message: req.file ? "PDF uspjesno otpremljen" : "Podaci rada uspjesno azurirani",
      thesis: {
        id: updatedThesis.id,
        title: updatedThesis.title,
        type: updatedThesis.type,
        year: updatedThesis.year,
        fileUrl: updatedThesis.file_url,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Greska pri uploadu PDF" });
  }
});


router.post("/upload-zip/:id", zipUpload.single("file"), async (req, res) => {
  try {
    const thesisId = Number(req.params.id);

    if (!thesisId || Number.isNaN(thesisId)) {
      return res.status(400).json({ message: "Neispravan ID rada" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "ZIP nije poslat" });
    }

    const existingThesis = await prisma.theses.findUnique({
      where: { id: thesisId },
      select: { zip_file: true },
    });

    if (!existingThesis) {
      return res.status(404).json({ message: "Rad nije pronadjen" });
    }

    if (existingThesis.zip_file && existingThesis.zip_file.startsWith("/uploads/")) {
      const relativePath = existingThesis.zip_file.replace(/^\/uploads\//, "");
      const filePath = path.join(uploadsRoot, relativePath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    const updatedThesis = await prisma.theses.update({
      where: { id: thesisId },
      data: {
        zip_file: `/uploads/zips/${req.file.filename}`,
      },
    });

    res.json({
      message: "ZIP uspjesno otpremljen",
      thesis: {
        id: updatedThesis.id,
        zipUrl: updatedThesis.zip_file,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Greska pri uploadu ZIP" });
  }
});

router.put("/:id", authenticate, async (req, res) => {
  try {
    const thesisId = Number(req.params.id);
    if (!thesisId || Number.isNaN(thesisId)) {
      return res.status(400).json({ message: "Neispravan ID rada" });
    }

    // Samo admin može editovati radove
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Samo admin može editovati radove" });
    }

    const {
      first_name,
      last_name,
      title,
      subtitle,
      title_language,
      additional_title,
      additional_subtitle,
      additional_title_language,
      type,
      year,
      file_url,
      mentor,
      committee_members,
      grade,
      keywords,
      language,
      abstract,
      defense_date,
      user_id,
    } = req.body;

    const existingThesis = await prisma.theses.findUnique({
      where: { id: thesisId },
    });

    if (!existingThesis) {
      return res.status(404).json({ message: "Rad nije pronadjen" });
    }

    const parsedYear = year ? Number(year) : existingThesis.year;
    if (Number.isNaN(parsedYear) || parsedYear < 1900 || parsedYear > 2100) {
      return res.status(400).json({ message: "Godina mora biti izmedju 1900 i 2100" });
    }

    const updatedThesis = await prisma.theses.update({
      where: { id: thesisId },
      data: {
        first_name: first_name ? first_name.trim() : existingThesis.first_name,
        last_name: last_name ? last_name.trim() : existingThesis.last_name,
        title: title ? title.trim() : existingThesis.title,
        subtitle: subtitle !== undefined ? (subtitle ? subtitle.trim() : null) : existingThesis.subtitle,
        title_language: title_language ? title_language.trim() : existingThesis.title_language,
        additional_title: additional_title !== undefined ? (additional_title ? additional_title.trim() : null) : existingThesis.additional_title,
        additional_subtitle: additional_subtitle !== undefined ? (additional_subtitle ? additional_subtitle.trim() : null) : existingThesis.additional_subtitle,
        additional_title_language: additional_title_language !== undefined ? (additional_title_language ? additional_title_language.trim() : null) : existingThesis.additional_title_language,
        type: type ? type.trim().toLowerCase() : existingThesis.type,
        year: parsedYear,
        file_url: file_url !== undefined ? file_url : existingThesis.file_url,
        mentor: mentor !== undefined ? (mentor ? mentor.trim() : null) : existingThesis.mentor,
        committee_members: committee_members !== undefined ? committee_members : existingThesis.committee_members,
        grade: grade !== undefined ? grade : existingThesis.grade,
        keywords: keywords !== undefined ? (keywords ? keywords.trim() : null) : existingThesis.keywords,
        language: language !== undefined ? language : existingThesis.language,
        abstract: abstract !== undefined ? abstract : existingThesis.abstract,
        defense_date: defense_date !== undefined ? (defense_date ? new Date(defense_date) : null) : existingThesis.defense_date,
        user_id: user_id !== undefined ? user_id : existingThesis.user_id,
      },
    });

    res.json({
      message: "Rad uspjesno azuriran",
      thesis: updatedThesis,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Greska pri azuriranju rada" });
  }
});

router.delete("/:id", authenticate, async (req, res) => {
  try {
    const thesisId = Number(req.params.id);
    if (!thesisId || Number.isNaN(thesisId)) {
      return res.status(400).json({ message: "Neispravan ID rada" });
    }

    const existingThesis = await prisma.theses.findUnique({
      where: { id: thesisId },
      select: { file_url: true, zip_file: true, user_id: true },
    });

    if (!existingThesis) {
      return res.status(404).json({ message: "Rad nije pronadjen" });
    }

    if (req.user?.role !== "admin" && req.user?.id !== existingThesis.user_id) {
      return res.status(403).json({ message: "Nemate pravo da obrisete ovaj rad" });
    }

    await prisma.theses.delete({ where: { id: thesisId } });

    if (existingThesis.file_url && existingThesis.file_url.startsWith("/uploads/")) {
      const relativePath = existingThesis.file_url.replace(/^\/uploads\//, "");
      const filePath = path.join(uploadsRoot, relativePath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.json({ message: "Rad uspjesno obrisan" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Greska pri brisanju rada" });
  }
});

router.post("/:id/download", async (req, res) => {
  try {
    const thesisId = Number(req.params.id);
    if (!thesisId || Number.isNaN(thesisId)) {
      return res.status(400).json({ message: "Neispravan ID rada" });
    }

    const thesis = await prisma.theses.findUnique({
      where: { id: thesisId },
    });

    if (!thesis) {
      return res.status(404).json({ message: "Rad nije pronadjen" });
    }

    // Povećaj brojač preuzimanja
    await prisma.theses.update({
      where: { id: thesisId },
      data: {
        download_count: {
          increment: 1,
        },
      },
    });

    res.json({ message: "Brojac preuzimanja azuriran", download_count: thesis.download_count + 1 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Greska pri azuriranju brojaca" });
  }
});

export default router;











