import { sha512 as digest512 } from '@noble/hashes/sha512'
import { sha256 as digest256 } from '@noble/hashes/sha256'
import { argon2id } from '@noble/hashes/argon2';
import { bytesToHex } from '@noble/hashes/utils';

export const btoa = (data: string) => window.btoa(data)

const BASE64_ALPHABET: string[] = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S',
    'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l',
    'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '0', '1', '2', '3', '4',
    '5', '6', '7', '8', '9', '+', '/',
];

export function base64(data: string): string {
    let result = '';
    let buffer = 0;
    let bits = 0;

    for (let i = 0; i < data.length; i++) {
        buffer = (buffer << 8) | data.charCodeAt(i);
        bits += 8;

        while (bits >= 6) {
            bits -= 6;
            let index = (buffer >> bits) & 0b111111;
            result += BASE64_ALPHABET[index];
        }
    }

    if (bits > 0) {
        buffer <<= 6 - bits;
        result += BASE64_ALPHABET[(buffer & 0b111111)];
    }

    while (result.length % 4 !== 0) {
        result += '=';
    }

    return result;
}

export function fib(n: number): number {
    if (n < 2) return n
    return fib(n - 1) + fib(n - 2)
}

export function fibObject(n: number, cache: Record<string, number> = {}): number {
    if (n in cache) return cache[n]
    if (n < 2) return n
    const result = fibObject(n - 2, cache) + fibObject(n - 1, cache)
    cache[n] = result
    return result
}

export function fibMap(n: number, cache: Map<number, number> = new Map()): number {
    if (cache.has(n)) return cache.get(n)!
    if (n < 2) return n
    const result = fibMap(n - 2, cache) + fibMap(n - 1, cache)
    cache.set(n, result)
    return result
}

export function generateMatrix(rows, cols) {
    let matrix = [];
    for (let i = 0; i < rows; i++) {
        matrix[i] = [];
        for (let j = 0; j < cols; j++) {
            matrix[i][j] = Math.floor(Math.random() * 10); // Generating random numbers between 0 and 9
        }
    }
    return matrix;
}

export function multiplyMatrices(a: number[][], b: number[][]) {
    const rowsA = a.length;
    const colsA = a[0].length;
    const colsB = b[0].length;

    const result = new Array(rowsA);
    for (let i = 0; i < rowsA; i++) {
        result[i] = new Array(colsB).fill(0);
    }

    for (let i = 0; i < rowsA; i++) {
        for (let j = 0; j < colsB; j++) {
            for (let k = 0; k < colsA; k++) {
                result[i][j] += a[i][k] * b[k][j];
            }
        }
    }

    return result;
}

const CRC32_POLY = 0xEDB88320;
const CRC64_POLY = 0xC96C5795D7870F42n;

export function crc32(data: Uint8Array): number {
  let crc = 0xFFFFFFFF;

  for (let i = 0; i < data.length; i++) {
    crc ^= data[i];

    for (let j = 0; j < 8; j++) {
      const mask = -(crc & 1);
      crc = (crc >>> 1) ^ (CRC32_POLY & mask);
    }
  }

  return crc ^ 0xFFFFFFFF;
}

export function crc64(data: Uint8Array): bigint {
  let crc = 0xFFFFFFFFFFFFFFFFn;

  for (let i = 0; i < data.length; i++) {
    crc ^= BigInt(data[i]);

    for (let j = 0; j < 8; j++) {
      const mask = -(crc & 1n);
      crc = (crc >> 1n) ^ (CRC64_POLY & mask);
    }
  }

  return crc ^ 0xFFFFFFFFFFFFFFFFn;
}


export const createElements = (n: number) => {
    const container = document.querySelector(".container")!

    for (let i = 0; i < n; ++i) {
        let div = document.createElement("div");
        container.appendChild(div);
    }
}

export const updateEvery2ndElement = () => {
    const container = document.querySelector(".container")!;
    const children = container.children

    for (let i = 0; i < children.length; i += 2) {
        const child = children.item(i)
        if (child) {
            if (!child.textContent) {
                child.textContent = i.toString()
            } else {
                child.textContent = null
            }
        }
    }
}

export const clearElements = () => {
    const container = document.querySelector(".container")!
    container.innerHTML = ''
}

export const sha256 = (data: Uint8Array) => {
    return bytesToHex(digest256(data))
}

export const sha512 = (data: Uint8Array) => {
    return bytesToHex(digest512(data))
}

export const cryptoSha256 = async (data: Uint8Array) => {
    const buffer = await window.crypto.subtle.digest('SHA-256', data)
    return bytesToHex(new Uint8Array(buffer))
}

export const cryptoSha512 = async (data: Uint8Array) => {
    const buffer = await window.crypto.subtle.digest('SHA-512', data)
    return bytesToHex(new Uint8Array(buffer))
}

async function bufferToBase64(buffer) {
  const base64url = await new Promise(r => {
    const reader = new FileReader()
    reader.onload = () => r(reader.result)
    reader.readAsDataURL(new Blob([buffer]))
  });
  return base64url.slice(base64url.indexOf(',') + 1);
}

export const argon2 = async () => {
    const salt = 'saltsalt';
    const m = 19 * 1024;
    const t = 2;
    const p = 1;
    const hashArray = argon2id('password', salt, { t, m, p });
    const b64salt = window.btoa(salt).replace(/=+$/, '');
    const b64hash = await bufferToBase64(hashArray).then(b64 => b64.replace(/=+$/, ''))
    return `$argon2id$v=19$m=${m},t=${t},p=${p}$${b64salt}$${b64hash}`
}
