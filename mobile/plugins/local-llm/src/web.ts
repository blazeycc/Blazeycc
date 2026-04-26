import { WebPlugin } from '@capacitor/core';
import type { LocalLlmPlugin } from './definitions';

export class LocalLlmWeb extends WebPlugin implements LocalLlmPlugin {
  async downloadModel(): Promise<{ success: boolean; error?: string }> {
    console.warn('LocalLlm: web fallback');
    return { success: false, error: 'Web platform not supported' };
  }
  async loadModel(): Promise<{ success: boolean; error?: string }> {
    return { success: false, error: 'Web platform not supported' };
  }
  async unloadModel(): Promise<void> {}
  async generate(): Promise<{ text: string; tokensGenerated: number }> {
    return { text: '', tokensGenerated: 0 };
  }
  async isModelLoaded(): Promise<{ loaded: boolean }> {
    return { loaded: false };
  }
  async getModelPath(): Promise<{ path: string }> {
    return { path: '' };
  }
  async isNativeLibAvailable(): Promise<{ available: boolean }> {
    return { available: false };
  }
}
