import textToSpeech from "@google-cloud/text-to-speech";

const client = new textToSpeech.TextToSpeechClient({
  apiKey: process.env.GOOGLE_CLOUD_TTS_API_KEY,
});

export interface VoiceOption {
  id: string;
  name: string;
  languageCode: string;
  gender: "MALE" | "FEMALE";
}

export const availableVoices: {
  english: VoiceOption[];
  arabic: VoiceOption[];
} = {
  english: [
    {
      id: "en-US-Neural2-C",
      name: "Female (Clear)",
      languageCode: "en-US",
      gender: "FEMALE",
    },
    {
      id: "en-US-Neural2-E",
      name: "Female (Warm)",
      languageCode: "en-US",
      gender: "FEMALE",
    },
    {
      id: "en-US-Neural2-F",
      name: "Female (Young)",
      languageCode: "en-US",
      gender: "FEMALE",
    },
    {
      id: "en-US-Neural2-A",
      name: "Male (Deep)",
      languageCode: "en-US",
      gender: "MALE",
    },
    {
      id: "en-US-Neural2-D",
      name: "Male (Clear)",
      languageCode: "en-US",
      gender: "MALE",
    },
    {
      id: "en-US-Neural2-J",
      name: "Male (Mature)",
      languageCode: "en-US",
      gender: "MALE",
    },
  ],
  arabic: [
    {
      id: "ar-XA-Wavenet-A",
      name: "Female (Arabic)",
      languageCode: "ar-XA",
      gender: "FEMALE",
    },
    {
      id: "ar-XA-Wavenet-D",
      name: "Female Soft (Arabic)",
      languageCode: "ar-XA",
      gender: "FEMALE",
    },
    {
      id: "ar-XA-Wavenet-B",
      name: "Male (Arabic)",
      languageCode: "ar-XA",
      gender: "MALE",
    },
    {
      id: "ar-XA-Wavenet-C",
      name: "Male Deep (Arabic)",
      languageCode: "ar-XA",
      gender: "MALE",
    },
  ],
};

export async function generateAudioWithGoogle(
  text: string,
  voiceId: string,
  languageCode: string = "en-US"
): Promise<Buffer> {
  try {
    console.log(`🎙️ Generating audio with Google TTS...`);
    console.log(`Voice: ${voiceId}`);
    console.log(`Language: ${languageCode}`);
    console.log(`Text length: ${text.length} characters`);

    const [response] = await client.synthesizeSpeech({
      input: { text: text },
      voice: {
        languageCode: languageCode,
        name: voiceId,
      },
      audioConfig: {
        audioEncoding: "MP3",
        speakingRate: 1.0,
        pitch: 0.0,
      },
    });

    if (!response.audioContent) {
      throw new Error("No audio content received from Google TTS");
    }

    const audioBuffer = Buffer.from(response.audioContent as Uint8Array);
    console.log(`✅ Audio generated: ${audioBuffer.length} bytes`);

    return audioBuffer;
  } catch (error: any) {
    console.error("❌ Google TTS error:", error);
    throw new Error(`Failed to generate audio: ${error.message}`);
  }
}

export function calculateDuration(text: string): number {
  // Average speaking rate: ~150 words per minute
  const words = text.split(/\s+/).length;
  const minutes = words / 150;
  const seconds = Math.ceil(minutes * 60);
  return seconds;
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}
