import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const sleep = (ms: number = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const onCopyText = async (text: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // no-op
  }
};

export const convertBase64ToHex = (text: string): string => {
  const raw = atob(text);
  let hex = '';
  for (let i = 0; i < raw.length; i++) {
    hex += raw.charCodeAt(i).toString(16).padStart(2, '0');
  }
  return hex;
};

export const convertHexToBase64 = (text: string): string => {
  const bytes = text.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) ?? [];
  return btoa(String.fromCharCode(...bytes));
};
