import type { BlockTone } from '../../shared/types';
import { PALETTE } from '../../shared/theme';

export const TONE_COLOR: Record<BlockTone, string> = {
  primary: PALETTE.acornDeep,
  secondary: PALETTE.sageDeep,
  accent: PALETTE.blushDeep,
};

export function splitBody(body: string) {
  const lines = body.split('\n');
  return {
    prose: lines.filter((line) => !line.startsWith('•')).join(' ').trim(),
    items: lines.filter((line) => line.startsWith('•')).map((line) => line.replace(/^•\s*/, '')),
  };
}
