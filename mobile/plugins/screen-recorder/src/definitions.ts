export interface RecordingOptions {
  /** Video bitrate in bits per second. Defaults to 8_000_000 */
  videoBitrate?: number;
  /** Frame rate. Defaults to 30 */
  frameRate?: number;
  /** Output format: 'mp4' | 'webm'. Defaults to 'mp4' */
  format?: string;
  /** Quality preset: 'low' | 'medium' | 'high' | 'ultra'. Used to pick bitrate if videoBitrate not set. */
  quality?: string;
}

export interface ScreenRecorderPlugin {
  startRecording(options?: RecordingOptions): Promise<{ started: boolean }>;
  stopRecording(): Promise<{ path: string }>;
}

declare module '@capacitor/core' {
  interface PluginRegistry {
    ScreenRecorder: ScreenRecorderPlugin;
  }
}
