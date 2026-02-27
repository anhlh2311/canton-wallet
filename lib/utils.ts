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

/**
 * Create a popup window positioned at the top-right of the browser window,
 * just below the toolbar (like MetaMask).
 */
export async function createCenteredPopup(
  url: string,
  width: number,
  height: number,
): Promise<chrome.windows.Window | undefined> {
  let left: number | undefined;
  let top: number | undefined;

  try {
    const allWindows = await chrome.windows.getAll({ windowTypes: ['normal'] });
    const parent = allWindows.find((w) => w.focused) || allWindows[0];
    if (parent) {
      if (parent.left != null && parent.width != null) {
        // Align to right edge with a small inset
        left = Math.round(parent.left + parent.width - width - 16);
      }
      if (parent.top != null) {
        // Position below the browser toolbar area
        top = parent.top + 80;
      }
    }
  } catch {
    // No window context — fall back to OS default positioning
  }

  return chrome.windows.create({ url, type: 'popup', width, height, left, top, focused: true });
}
