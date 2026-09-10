/**
 * Lightweight browser shim for iconv-lite.
 * Eliminates Node.js buffer/safer-buffer dependencies in client builds
 * by delegating to native TextEncoder and TextDecoder APIs.
 */
export function encode(text: string, _encoding?: string): Uint8Array {
  return new TextEncoder().encode(text);
}

export function decode(data: Uint8Array, _encoding?: string): string {
  return new TextDecoder().decode(data);
}

const iconv = {
  encode,
  decode,
};

export default iconv;
