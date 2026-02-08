import { Request, Response } from "express";
import prisma from "../prisma";

export const getTheses = async (req: Request, res: Response) => {
    try {
        const usersWithTheses = await prisma.users.findMany({
            where: {
                role: {
                    not: "admin",
                },
            },
            select: {
                id: true,
                first_name: true,
                last_name: true,
                thesis_title: true,
                thesis_document_url: true,
                thesis_type: true,
                created_at: true,
            },
            orderBy: {
                created_at: "desc",
            },
        });


        return res.json(usersWithTheses);
    } catch (error) {
        console.error("Error fetching theses:", error);
        return res.status(500).json({ message: "Server error while fetching theses" });
    }
};

export const deleteThesis = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        await prisma.users.update({
            where: { id: parseInt(id) },
            data: {
                thesis_title: null,
                thesis_document_url: null,
            },
        });

        return res.json({ message: "Thesis removed successfully" });
    } catch (error) {
        console.error("Error deleting thesis:", error);
        return res.status(500).json({ message: "Server error while deleting thesis" });
    }
};

export const uploadThesis = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { title, thesisType } = req.body;
    const file = req.file;

    if (!file) {
        return res.status(400).json({ message: "Niste izabrali fajl" });
    }

    try {
        const fileUrl = `/uploads/theses/${file.filename}`;

        await prisma.users.update({
            where: { id: parseInt(id) },
            data: {
                thesis_title: title || file.originalname,
                thesis_document_url: fileUrl,
                thesis_type: thesisType,
            },
        });

        return res.json({
            message: "Diplomski rad uspešno otpremljen",
            thesis_document_url: fileUrl,
            thesis_title: title || file.originalname
        });
    } catch (error) {
        console.error("Error uploading thesis:", error);
        return res.status(500).json({ message: "Greška na serveru prilikom otpremanja rada" });
    }
};
