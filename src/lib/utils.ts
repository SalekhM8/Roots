import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(minorUnits: number, currency = "GBP"): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
  }).format(minorUnits / 100);
}

export function formatDate(date: Date | null): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
}

export function formatDateTime(date: Date | null): string {
  if (!date) return "—";
  return new Date(date).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function calculateAge(dateOfBirth: Date): number {
  return Math.floor(
    (Date.now() - new Date(dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
  );
}

export function parsePage(pageStr: string | undefined): number {
  return Math.max(1, parseInt(pageStr ?? "1", 10) || 1);
}

export function humanizeStatus(status: string): string {
  return status.replace(/_/g, " ");
}

export function getDisplayName(
  user: {
    email: string;
    customerProfile?: { firstName: string; lastName: string } | null;
  } | null,
  guestEmail?: string | null
): string {
  if (!user) return guestEmail ? `Guest (${guestEmail})` : "Guest";
  return user.customerProfile
    ? `${user.customerProfile.firstName} ${user.customerProfile.lastName}`
    : user.email;
}
