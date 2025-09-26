import { Request, Response } from "express";
import { ElevenTTS } from "../utils/tts";

export const generateTTS = async (req: Request, res: Response) => {
  try {
    const protocol = req.protocol;
    const host = req.get("host");
    const baseUrl = `${protocol}://${host}`;
    const { voice, text, speed } = req.body;
    const tts = new ElevenTTS();
    await tts.loadProxies();
    const result = await tts.streamTtsToMp3(voice as string, text as string, speed)
    res.status(200).json({ message: "success generate voice", data: { path: `${baseUrl}/${result.audioPath}`, subtitle: result.srtContent } });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "failed to generate naration", error: `${error}` });
  }
}