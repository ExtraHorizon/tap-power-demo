/* eslint-disable no-bitwise */
import { useEffect, useState } from 'react';

export function useDebounce(value: any, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(
    () => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);
      return () => {
        clearTimeout(handler);
      };
    },
    [value, delay]
  );
  return debouncedValue;
}

export function hashCode(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
}

export function intToHSL(i: number) {
  const hue = Math.round(((i & 0x000000FF) * 360) / 0xFF);
  const sat = Math.round(((((i & 0x0000FF00) >> 8) * 50) / 0xFF) + 0);
  const lum = Math.round(((((i & 0x00FF0000) >> 16) * 50) / 0xFF) + 50);
  return `hsl(${hue}, ${sat}%, ${lum}%, 1)`;
}

export function capitalizeFirstWord(string: string): string {
  if (!string) {
    return '';
  }
  const separateWord = string.toLowerCase().split(' ');
  separateWord[0] = separateWord[0].charAt(0).toUpperCase() + separateWord[0].substring(1);
  return separateWord.join(' ');
}

export function stringObjectSort(prop:string) {
  return (a:any, b:any) => {
    const nameA = a[prop].toUpperCase(); // ignore upper and lowercase
    const nameB = b[prop].toUpperCase(); // ignore upper and lowercase
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
    return 0;
  };
}
