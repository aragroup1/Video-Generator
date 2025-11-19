import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

interface MergeOptions {
  videoBuffer: Buffer;
  audioBuffer: Buffer;
  outputPath: string;
}

export class VideoProcessor {
  
  static async mergeVideoAudio(options: MergeOptions): Promise<string> {
    const { videoBuffer, audioBuffer, outputPath } = options;
    
    try {
      console.log('🎬 Merging video and audio...');
      
      // Create temp directory
      const tempDir = path.join('/tmp', `video-${Date.now()}`);
      await fs.mkdir(tempDir, { recursive: true });
      
      // Write buffers to temp files
      const videoPath = path.join(tempDir, 'video.mp4');
      const audioPath = path.join(tempDir, 'audio.mp3');
      
      await fs.writeFile(videoPath, videoBuffer);
      await fs.writeFile(audioPath, audioBuffer);
      
      // Merge using FFmpeg
      const command = `ffmpeg -i ${videoPath} -i ${audioPath} -c:v copy -c:a aac -shortest ${outputPath}`;
      
      await execAsync(command);
      
      // Cleanup temp files
      await fs.unlink(videoPath);
      await fs.unlink(audioPath);
      await fs.rmdir(tempDir);
      
      console.log('✅ Video and audio merged successfully');
      return outputPath;
      
    } catch (error: any) {
      console.error('❌ FFmpeg merge failed:', error);
      throw new Error(`Failed to merge video and audio: ${error.message}`);
    }
  }
  
  static async getVideoDuration(videoBuffer: Buffer): Promise<number> {
    try {
      const tempPath = `/tmp/temp-${Date.now()}.mp4`;
      await fs.writeFile(tempPath, videoBuffer);
      
      const { stdout } = await execAsync(
        `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 ${tempPath}`
      );
      
      await fs.unlink(tempPath);
      
      return parseFloat(stdout.trim());
    } catch (error: any) {
      console.error('Failed to get video duration:', error);
      return 15; // Default fallback
    }
  }
}
