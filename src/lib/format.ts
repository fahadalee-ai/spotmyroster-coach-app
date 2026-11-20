import { format, parseISO } from "date-fns";

export function shortDate(iso: string) {
  if (!iso) return "";
  const value = iso.length <= 10 ? parseISO(iso) : new Date(iso);
  if (Number.isNaN(value.getTime())) return iso;
  return format(value, "MMM d, yyyy");
}

export function timeLabel(value: string) {
  if (!value) return "";
  const [h, m] = value.split(":");
  const hour = Number(h);
  if (Number.isNaN(hour)) return value;
  const suffix = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${m ?? "00"} ${suffix}`;
}

export function greeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function newId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "");
  return letters.join("") || "SM";
}

export const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC",
];

export function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function passwordIssue(value: string) {
  if (value.length < 8) return "Use at least 8 characters.";
  if (!/\d/.test(value)) return "Include at least one number.";
  return "";
}

export function phoneIssue(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 10) return "Enter a mobile number with area code.";
  return "";
}
