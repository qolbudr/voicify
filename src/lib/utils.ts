import type { Exception } from "@/core/api/exception";
import type { Voice } from "@/core/types/voice";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const handleError = (error: unknown): Exception => {
  if (error && typeof error === 'object' && 'message' in error && 'error' in error && 'code' in error) {
    return error as Exception;
  }
  return { message: 'Unknown Error', error: 'An unknown error occurred', code: 500 };
}

export const voice: Voice[] = [
  { id: '1k39YpzqXZn52BgyLyGO', name: 'Gibran', gender: 'Male', country: 'ID' },
  { id: 'Lpe7uP03WRpCk9XkpFnf', name: 'Puan', gender: 'Female', country: 'ID' },
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', gender: 'Female', country: 'US' },
  { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', gender: 'Female', country: 'US' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', gender: 'Female', country: 'US' },
  { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli', gender: 'Female', country: 'US' },
  { id: 'yoZ06aMxZJJ28mfd3POQ', name: 'Sam', gender: 'Female', country: 'US' },
  { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', gender: 'Male', country: 'GB' },
  { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', gender: 'Male', country: 'US' },
  { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold', gender: 'Male', country: 'AU' },
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', gender: 'Male', country: 'US' },
]
