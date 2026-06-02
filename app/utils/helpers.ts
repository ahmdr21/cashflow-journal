/**
 * Utility functions for formatting and calculations
 */

export function formatCurrency(value: number | string): string {
  const numeric =
    typeof value === "string"
      ? parseFloat(
          value
            .toString()
            .replace(/\./g, "")
            .replace(/,/g, ".")
        )
      : value;

  if (isNaN(numeric)) return "Rp 0";

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numeric);
}

export function formatCurrencyInput(value: string): string {
  if (!value) return "";

  const cleaned = value.replace(/[^0-9,]/g, "");
  const [integerPart, decimalPart] = cleaned.split(",");
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  if (decimalPart !== undefined) {
    return `${formattedInteger},${decimalPart.slice(0, 2)}`;
  }

  return formattedInteger;
}

export function parseCurrencyInput(value: string): number {
  const cleaned = value.replace(/\./g, "").replace(",", ".");
  return parseFloat(cleaned) || 0;
}

export function formatDate(
  dateString: string,
  format: "short" | "long" = "short"
): string {
  const date = new Date(dateString);

  if (format === "short") {
    return date.toLocaleDateString("id-ID");
  }

  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getCurrentMonth(): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return { start, end };
}

export function isCurrentMonth(dateString: string): boolean {
  const date = new Date(dateString);
  const now = new Date();

  return (
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
}

export function getCategoryColor(category: string): string {
  const colors: { [key: string]: string } = {
    "Makanan & Minuman": "#ef4444",
    Transportasi: "#f97316",
    "Rumah Tangga (Listrik, Air, Internet)": "#eab308",
    "Hiburan & Rekreasi": "#ec4899",
    Pendidikan: "#0ea5e9",
    "Kesehatan & Medis": "#ef4444",
    "Fashion & Pakaian": "#ec4899",
    "Utility & Asuransi": "#6366f1",
    "Hobi & Gaya Hidup": "#06b6d4",
    Gaji: "#22c55e",
    Bonus: "#22c55e",
    Freelance: "#10b981",
    Investasi: "#14b8a6",
    Hadiah: "#f97316",
    Lainnya: "#6b7280",
  };

  return colors[category] || "#3b82f6";
}

export function calculatePercentage(
  value: number,
  total: number
): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}
