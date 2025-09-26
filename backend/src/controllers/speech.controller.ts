import { Request, Response } from "express";
import { ElevenTTS } from "../utils/tts";
import { PrismaClient } from "@prisma/client";

// Extend Express Request type to include 'user'
declare global {
  namespace Express {
    interface Request {
      user?: { id: string; email: string; validAt: Date | null; };
    }
  }
}

const prisma = new PrismaClient();

export const generateTTS = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const protocol = 'https';
    const host = req.get("host");
    const baseUrl = `${protocol}://${host}`;
    const { voice, text, speed } = req.body;
    const tts = new ElevenTTS();
    await tts.loadProxies();
    const result = await tts.streamTtsToMp3(voice as string, text as string, speed)

    const userData = await prisma.users.findUnique({ where: { id: req.user?.id } });
    
    if (userData?.freeQuota != null && userData.freeQuota > 0) {
      await prisma.users.update({
        where: { id: userData.id },
        data: { freeQuota: userData.freeQuota - 1 },
      });
    }

    res.status(200).json({ message: "Berhasil Generate Suara", data: { path: `${baseUrl}/${result.audioPath}`, subtitle: result.srtContent } });
  } catch (error) {
    res.status(500).json({ message: "Gagal untuk Mengenerate Suara", error: `${error}` });
  }
}