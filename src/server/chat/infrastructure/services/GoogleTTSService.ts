export interface ITTSService {
  synthesize(text: string): Promise<string | null>;
}

interface TTSConfig {
  apiKey: string;
  voiceLanguage: string;
  voiceName: string;
  speakingRate: number;
  pitch: number;
}

export class GoogleTTSService implements ITTSService {
  private static readonly API_URL = "https://texttospeech.googleapis.com/v1/text:synthesize";
  private readonly config: TTSConfig;

  constructor(config: Partial<TTSConfig> = {}) {
    this.config = this.buildConfig(config);
  }

  private buildConfig({
    apiKey = process.env.GOOGLE_TTS_API_KEY || "",
    voiceLanguage = process.env.GOOGLE_TTS_VOICE_LANGUAGE || "es-US",
    voiceName = process.env.GOOGLE_TTS_VOICE_NAME || "es-US-Standard-A",
    speakingRate = parseFloat(process.env.GOOGLE_TTS_SPEAKING_RATE || "1.0"),
    pitch = parseFloat(process.env.GOOGLE_TTS_PITCH || "0.0")
  }: Partial<TTSConfig>): TTSConfig {
    
    if (!apiKey) throw new Error("GOOGLE_TTS_API_KEY is required");

    return {
      apiKey,
      voiceLanguage,
      voiceName,
      speakingRate,
      pitch,
    };
  }

  async synthesize(text: string): Promise<string | null> {
    const cleanText = text && text.trim().replace(/"/g, "");
    if (!cleanText) return null;

    try {
      const response = await fetch(GoogleTTSService.API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": this.config.apiKey,
        },
        body: JSON.stringify(this.buildRequest(cleanText)),
      });

      if (!response.ok) {
        console.error("TTS error:", response.status);
        return null;
      }

      const data = await response.json();
      return data.audioContent ? `data:audio/mpeg;base64,${data.audioContent}` : null;
    } catch (error) {
      console.error("TTS error:", error);
      return null;
    }
  }

  private buildRequest(text: string) {
    return {
      input: { text },
      voice: { languageCode: this.config.voiceLanguage, name: this.config.voiceName },
      audioConfig: { audioEncoding: "MP3", speakingRate: this.config.speakingRate, pitch: this.config.pitch },
    };
  }
}
