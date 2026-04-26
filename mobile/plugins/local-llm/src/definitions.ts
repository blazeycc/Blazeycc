export interface LocalLlmPlugin {
  downloadModel(options: { url: string; filename: string }): Promise<{ success: boolean; path?: string; error?: string }>;
  loadModel(options: { path: string }): Promise<{ success: boolean; error?: string }>;
  unloadModel(): Promise<void>;
  generate(options: { prompt: string; maxTokens?: number; temperature?: number }): Promise<{ text: string; tokensGenerated: number }>;
  isModelLoaded(): Promise<{ loaded: boolean }>;
  getModelPath(): Promise<{ path: string }>;
  isNativeLibAvailable(): Promise<{ available: boolean }>;
}

declare module '@capacitor/core' {
  interface PluginRegistry {
    LocalLlm: LocalLlmPlugin;
  }
}
