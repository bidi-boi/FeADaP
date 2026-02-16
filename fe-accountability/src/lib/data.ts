import { Task } from './types';

// Helper to encode string to Base64 (supporting UTF-8)
function toBase64(str: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str).toString('base64');
  } else {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) =>
        String.fromCharCode(parseInt(p1, 16))
      ));
  }
}

// Helper to decode Base64 to string (supporting UTF-8)
function fromBase64(str: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str, 'base64').toString('utf-8');
  } else {
    return decodeURIComponent(Array.prototype.map.call(atob(str), (c: string) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
  }
}

export function encodeTasks(tasks: Task[]): string {
  return toBase64(JSON.stringify(tasks));
}

export function decodeTasks(data: string): Task[] {
  try {
    const json = fromBase64(data);
    return JSON.parse(json);
  } catch (error) {
    console.error("Failed to decode tasks", error);
    return [];
  }
}
