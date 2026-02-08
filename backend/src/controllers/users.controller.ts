// src/controllers/users.controller.ts
import { Request, Response } from "express";
import prisma from "../prisma";

export async function searchUsers(req: Request, res: Response) {
  const query = String(req.query.query || "").trim();

  if (!query || query.length < 2) {
    return res.json({ users: [] });
  }

  const users = await prisma.users.findMany({
    where: {
      is_active: true,
      OR: [
        { username: { contains: query, mode: "insensitive" } },
        { first_name: { contains: query, mode: "insensitive" } },
        { last_name: { contains: query, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      username: true,
      first_name: true,
      last_name: true,
    },
    take: 10,
    orderBy: { username: "asc" },
  });

  return res.json({ users });
}

// vrati profil ulogovanog korisnika
export async function getMyProfile(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const user = await prisma.users.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        first_name: true,
        last_name: true,
        enrollment_year: true,
        occupation: true,
        profile_picture: true,
        work_location: true,
        is_public: true,
        cv_url: true,
        position: true,
        study_level: true,
        study_direction: true,
        role: true,
        is_active: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(user);
  } catch (error) {
    console.error("getMyProfile error:", error);
    return res.status(500).json({ message: "Failed to load profile" });
  }
}

// ažuriraj profil ulogovanog korisnika (tekstualna polja + URL-ovi)
export async function updateMyProfile(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const body: any = req.body;
    console.log("updateMyProfile received data:", body); // Debug log
    const data: any = {};

    // Username validacija
    const username = body.username;
    if (username !== undefined) {
      if (typeof username !== "string" || !username.trim()) {
        return res.status(400).json({ message: "Username is required" });
      }
      
      // Provjeri da li username već postoji (osim za trenutnog korisnika)
      const existingUser = await prisma.users.findFirst({
        where: {
          username: username.trim(),
          id: { not: req.user.id }
        }
      });

      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      data.username = username.trim();
    }

    // Email validacija
    const email = body.email;
    if (email !== undefined) {
      if (typeof email !== "string" || !email.trim()) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return res.status(400).json({ message: "Invalid email format" });
      }

      // Provjeri da li email već postoji (osim za trenutnog korisnika)
      const existingUser = await prisma.users.findFirst({
        where: {
          email: email.trim(),
          id: { not: req.user.id }
        }
      });

      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }

      data.email = email.trim();
    }

    // Ime: "ime" ili "first_name"
    const firstName = body.ime ?? body.first_name;
    if (typeof firstName === "string" && firstName.trim()) {
      data.first_name = firstName.trim();
    }

    // Prezime: "prezime" ili "last_name"
    const lastName = body.prezime ?? body.last_name;
    if (typeof lastName === "string" && lastName.trim()) {
      data.last_name = lastName.trim();
    }

    // Godina završetka: "godinaZavrsetka" ili "enrollment_year"
    const yearRaw = body.godinaZavrsetka ?? body.enrollment_year;
    if (yearRaw !== undefined && yearRaw !== null && yearRaw !== "") {
      const yearNumber = Number(yearRaw);
      if (!Number.isNaN(yearNumber)) {
        data.enrollment_year = yearNumber;
      }
    }

    // Pozicija
    if (typeof body.pozicija === "string" && body.pozicija.trim()) {
      data.position = body.pozicija.trim();
    }

    // Nivo studija
    if (typeof body.nivoStudija === "string" && body.nivoStudija.trim()) {
      data.study_level = body.nivoStudija.trim();
    }

    // Smjer
    if (typeof body.smjer === "string" && body.smjer.trim()) {
      data.study_direction = body.smjer.trim();
    }

    // Firma / zanimanje: "firma" ili "occupation"
    const occupationRaw = body.firma ?? body.occupation;
    if (typeof occupationRaw === "string" && occupationRaw.trim()) {
      data.occupation = occupationRaw.trim();
    }

    // Mjesto rada: "mjestoRada"
    if (typeof body.mjestoRada === "string" && body.mjestoRada.trim()) {
      data.work_location = body.mjestoRada.trim();
    }

    // Javni/privatan profil: "javniProfil" (boolean)
    const isPublic = body.javniProfil ?? body.is_public;
    if (typeof isPublic === "boolean") {
      data.is_public = isPublic;
    }

    // URL slike profila (ako se šalje kao string, npr. neki URL sa fronta)
    const profilePicture =
      body.profile_picture ?? body.slika ?? body.slikaProfila;
    if (typeof profilePicture === "string" && profilePicture.trim()) {
      data.profile_picture = profilePicture.trim();
    }

    // CV URL (ako front šalje link umjesto fajla)
    const cvUrl = body.cvUrl ?? body.cv_url ?? body.cv;
    if (typeof cvUrl === "string" && cvUrl.trim()) {
      data.cv_url = cvUrl.trim();
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    console.log("Data to update:", data); // Debug log

    const updated = await prisma.users.update({
      where: { id: req.user.id },
      data,
      select: {
        id: true,
        username: true,
        email: true,
        first_name: true,
        last_name: true,
        enrollment_year: true,
        occupation: true,
        profile_picture: true,
        work_location: true,
        is_public: true,
        cv_url: true,
        position: true,
        study_level: true,
        study_direction: true,
        role: true,
        is_active: true,
        created_at: true,
        updated_at: true,
      },
    });

    return res.json(updated);
  } catch (error) {
    console.error("updateMyProfile error:", error);
    return res.status(500).json({ message: "Failed to update profile" });
  }
}

// upload avatar handler (za fajl upload)
export async function uploadAvatarHandler(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    const relativePath = `/uploads/avatars/${req.file.filename}`;

    const updated = await prisma.users.update({
      where: { id: req.user.id },
      data: {
        profile_picture: relativePath,
      },
      select: {
        id: true,
        profile_picture: true,
      },
    });

    return res.json(updated);
  } catch (error) {
    console.error("uploadAvatarHandler error:", error);
    return res.status(500).json({ message: "Failed to upload avatar" });
  }
}

export async function uploadCvHandler(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    const relativePath = `/uploads/cv/${req.file.filename}`;

    const updated = await prisma.users.update({
      where: { id: req.user.id },
      data: {
        cv_url: relativePath,
      },
      select: {
        id: true,
        cv_url: true,
      },
    });

    return res.json(updated);
  } catch (error) {
    console.error("uploadCvHandler error:", error);
    return res.status(500).json({ message: "Failed to upload CV" });
  }
}
