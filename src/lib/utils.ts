import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateRange(
  startDate: string,
  endDate: string | null,
  locale: string,
  presentLabel: string,
): string {
  const formatter = new Intl.DateTimeFormat(locale === "en" ? "en-US" : "es-AR", {
    month: "short",
    year: "numeric",
  });

  const format = (value: string) => {
    const [year, month] = value.split("-").map(Number);
    return formatter.format(new Date(year, (month ?? 1) - 1, 1));
  };

  const start = format(startDate);
  const end = endDate ? format(endDate) : presentLabel;
  return `${start} — ${end}`;
}
