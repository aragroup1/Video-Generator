import axios from 'axios';

interface VoiceGenerationOptions {
  text: string;
  voiceId: string;
  stability?: number;
  similarityBoost?: number;
  style?: number;
}

export class ElevenLabsProvider {
  private apiKey: string;
  private baseUrl = 'https://api.elevenlabs.io/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateVoice(options: VoiceGenerationOptions): Promise<Buffer> {
    const {
      text,
      voiceId,
      stability = 0.5,
      similarityBoost = 0.75,
      style = 0.5,
    } = options;

    try {
      console.log('🎤 Generating voiceover with ElevenLabs...');
      console.log('📝 Text:', text);
      console.log('🎭 Voice ID:', voiceId);

      const response = await axios.post(
        `${this.baseUrl}/text-to-speech/${voiceId}`,
        {
          text,
          model_id: 'eleven_turbo_v2_5', // Fastest, cheapest model
          voice_settings: {
            stability,
            similarity_boost: similarityBoost,
            style,
            use_speaker_boost: true,
          },
        },
        {
          headers: {
            'xi-api-key': this.apiKey,
            'Content-Type': 'application/json',
          },
          responseType: 'arraybuffer',
        }
      );

      console.log('✅ Voiceover generated successfully');
      return Buffer.from(response.data);
    } catch (error: any) {
      console.error('❌ ElevenLabs generation failed:', error.response?.data || error.message);
      throw new Error(`Failed to generate voice: ${error.message}`);
    }
  }

  // Pre-selected voices for different use cases
  static getVoiceId(gender: 'female' | 'male', age: 'young' | 'professional' | 'mature'): string {
    const voices = {
      female: {
        young: '21m00Tcm4TlvDq8ikWAM', // Rachel - Young, energetic
        professional: 'EXAVITQu4vr4xnSDxMaL', // Bella - Professional, clear
        mature: 'MF3mGyEYCl7XYWbV9V6O', // Elli - Warm, mature
      },
      male: {
        young: 'pNInz6obpgDQGcFmaJgB', // Adam - Young, casual
        professional: 'VR6AewLTigWG4xSOukaG', // Arnold - Professional, confident
        mature: 'ErXwobaYiN019PkySvjV', // Antoni - Mature, authoritative
      },
    };

    return voices[gender][age];
  }
}
