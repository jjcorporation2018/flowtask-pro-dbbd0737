import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function fixDateToBRT(dateStr: string | null | undefined): Date | null {
    if (!dateStr) return null;
    
    if (typeof dateStr === 'string' && dateStr.length === 10) {
        return new Date(`${dateStr}T12:00:00`);
    }

    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;

    d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
    return d;
}
