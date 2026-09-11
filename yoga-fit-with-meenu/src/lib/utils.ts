import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPhoneForTel(phone: string): string {
  return phone.replace(/[^\d+]/g, "");
}

export function whatsappUrl(phone: string, message?: string): string {
  const clean = phone.replace(/[^\d]/g, "");
  const base = `https://wa.me/${clean}`;
  if (message) {
    return `${base}?text=${encodeURIComponent(message)}`;
  }
  return base;
}

export const SITE = {
  name: "Yoga Fit with Meenu",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://yogafitwithmeenu.online",
  phone: process.env.NEXT_PUBLIC_PHONE || "+917678200212",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP || "917678200212",
  email: process.env.NEXT_PUBLIC_EMAIL || "yoga@yogafitwithmeenu.online",
  address: {
    street: "I-55, Gali No. 2, Jaitpur, Badarpur",
    city: "New Delhi",
    region: "Delhi",
    postal: "110044",
    country: "IN",
  },
  serviceArea: "Delhi NCR",
} as const;
