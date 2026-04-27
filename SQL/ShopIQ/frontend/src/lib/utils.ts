import clsx from "clsx";

export function cn(...values: Array<string | false | null | undefined>) {
  return clsx(values);
}

export function money(value: number | string) {
  const number = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0
  }).format(number || 0);
}

export function prettyDate(value: string | number | Date) {
  return new Date(value).toLocaleDateString("en-PK", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

export function getCsrfTokenFromCookie() {
  return document.cookie
    .split("; ")
    .find((entry) => entry.startsWith("shopiq_csrf="))
    ?.split("=")[1];
}
