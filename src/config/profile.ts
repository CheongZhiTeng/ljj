import type { ProfileConfig } from '../types/profile';
import { isAssetPath } from './validate';
import rawProfile from 'virtual:profile';

export const profileConfig: ProfileConfig = rawProfile;

export function assetUrl(value: string) {
  return isAssetPath(value) ? import.meta.env.BASE_URL + value : value;
}
