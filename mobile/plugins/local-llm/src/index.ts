import { registerPlugin } from '@capacitor/core';
import type { LocalLlmPlugin } from './definitions';

const LocalLlm = registerPlugin<LocalLlmPlugin>('LocalLlm', {
  web: () => import('./web').then(m => new m.LocalLlmWeb()),
});

export * from './definitions';
export { LocalLlm };
