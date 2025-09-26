import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import axios from "axios";
import { HttpsProxyAgent } from "https-proxy-agent";

const headers = {
  "Accept": "*/*",
  "Accept-Encoding": "gzip, deflate, br",
  "Accept-Language": "en-US,en;q=0.9",
  "Content-Type": "application/json",
  "Origin": "https://elevenlabs.io",
  "Referer": "https://elevenlabs.io/",
  "DNT": "1",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",
};

const wordLimit = 1000;
const concurrency = 20;

// --- HELPERS ---
function formatTime(seconds: number): string {
  const hours = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const secs = String(Math.floor(seconds % 60)).padStart(2, "0");
  const ms = String(Math.floor((seconds % 1) * 1000)).padStart(3, "0");
  return `${hours}:${minutes}:${secs},${ms}`;
}

// --- CLASS ---
export class ElevenTTS {
  private proxies: string[] = [];
  private proxyIndex = 0;

  async loadProxies(): Promise<void> {
    try {
      const res = await axios.get(process.env.PROXY_URL!);
      this.proxies = res.data
        .split("\n")
        .map((line: string) => line.trim())
        .filter(Boolean);
      this.proxyIndex = 0;
      console.log(`✔ Loaded ${this.proxies.length} proxies`);
    } catch (err) {
      console.error("Failed to fetch proxies:", err);
      this.proxies = [];
    }
  }

  async streamTtsToMp3(
    voice: string,
    text: string,
    speed: number = 1,
    outputDir = "./public/generated/"
  ): Promise<{ audioPath: string; srtContent: string }> {
    const voiceId = voice;
    if (!voiceId) throw new Error(`Voice '${voice}' not found.`);
    if (!this.proxies.length) throw new Error("No proxies loaded");

    const url = process.env.ELEVEN_LABS_URL!.replace("{voice_id}", voiceId);
    const payload = { text, model_id: "eleven_v3", voice_settings: { speed: speed } };

    for (let i = 0; i < this.proxies.length; i += concurrency) {
      const batch = this.proxies.slice(i, i + concurrency);
      const controllers: AbortController[] = [];

      try {
        const result = await Promise.any(
          batch.map((proxy) => {
            const controller = new AbortController();
            controllers.push(controller);
            return this.runProxy(proxy, url, payload, outputDir, controller);
          })
        );

        // kalau ada yang sukses → abort semua sisanya
        controllers.forEach((c) => c.abort());
        return result;
      } catch {
        console.warn(`Batch ${i / concurrency + 1} gagal, lanjut batch berikutnya...`);
      }
    }

    throw new Error("All proxies failed.");
  }

  private async runProxy(
    proxy: string,
    url: string,
    payload: any,
    outputDir: string,
    controller: AbortController
  ): Promise<{ audioPath: string; srtContent: string }> {
    try {
      console.log(`→ Trying proxy: ${proxy}`);
      const agent = new HttpsProxyAgent(
        proxy.startsWith("http") ? proxy : `http://${proxy}`, {
        signal: controller.signal,
      }
      );

      const response = await axios.post(url, payload, {
        headers,
        proxy: false,
        httpsAgent: agent,
        signal: controller.signal,
      });

      if (!response) throw new Error("Empty response");
      return this.processResponse(response.data, outputDir);
    } catch (err: any) {
      if (controller.signal.aborted) {
        throw new Error("Request aborted");
      }
      console.error(`✘ Proxy failed (${proxy}):`, err.message);
      throw err;
    }
  }

  private processResponse(
    response: string,
    outputDir: string
  ): { audioPath: string; srtContent: string } {
    const lines = response.toString().split("\n");
    const audioData: Buffer[] = [];
    let srtContent = "";
    let chunkIndex = 1;

    for (const line of lines) {
      if (!line.trim()) continue;

      let chunk: any;
      try {
        chunk = JSON.parse(line);
      } catch {
        continue;
      }

      if (chunk.error) {
        console.error(`[API ERROR]: ${chunk.error}`);
        continue;
      }
      if (!chunk.audio_base64) continue;

      audioData.push(Buffer.from(chunk.audio_base64, "base64"));

      if (chunk.alignment) {
        const chars = chunk.alignment.characters || [];
        const startTimes = chunk.alignment.character_start_times_seconds || [];
        const endTimes = chunk.alignment.character_end_times_seconds || [];

        let word = "";
        let wordStart = 0;

        chars.forEach((ch: string, i: number) => {
          if (ch === " ") {
            if (word) {
              srtContent += this.makeSrtBlock(chunkIndex++, word, wordStart, startTimes[i]);
              word = "";
            }
          } else {
            if (!word) wordStart = startTimes[i];
            word += ch;
          }
        });

        if (word) {
          srtContent += this.makeSrtBlock(
            chunkIndex++,
            word,
            wordStart,
            endTimes[endTimes.length - 1]
          );
        }
      }
    }

    const audioPath = path.join(outputDir, `${randomUUID()}.mp3`);
    fs.writeFileSync(audioPath, Buffer.concat(audioData));

    return { audioPath, srtContent };
  }

  private makeSrtBlock(index: number, text: string, start: number, end: number): string {
    return `${index}\n${formatTime(start)} --> ${formatTime(end)}\n${text}\n\n`;
  }
}
