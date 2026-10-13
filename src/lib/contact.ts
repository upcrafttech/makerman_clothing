/**
 * Contact link helpers for WhatsApp, Phone, and Email
 */

export function cleanPhoneDigits(rawPhone?: string | null): string {
  if (!rawPhone) return "";
  let digits = rawPhone.replace(/\D/g, "");
  // If 10-digit Indian phone without country code, prefix 91
  if (digits.length === 10) {
    digits = `91${digits}`;
  } else if (digits.length === 11 && digits.startsWith("0")) {
    digits = `91${digits.slice(1)}`;
  }
  return digits;
}

export function formatPhoneDisplay(rawPhone?: string | null): string {
  if (!rawPhone || !rawPhone.trim()) return "+91 98204 41120";
  const trimmed = rawPhone.trim();
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  if (digits.length === 12 && digits.startsWith("91")) {
    const local = digits.slice(2);
    return `+91 ${local.slice(0, 5)} ${local.slice(5)}`;
  }
  return trimmed;
}

export function getWhatsAppHref(
  rawPhone?: string | null,
  storeName = "Makerman",
  customMessage?: string
): string {
  const digits = cleanPhoneDigits(rawPhone);
  if (!digits) return "#";
  const message =
    customMessage || `Hi ${storeName || "Makerman"} team, I have an inquiry`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function getTelHref(rawPhone?: string | null): string {
  if (!rawPhone || !rawPhone.trim()) return "#";
  const trimmed = rawPhone.trim();
  if (trimmed.startsWith("+")) {
    return `tel:${trimmed.replace(/\s+/g, "")}`;
  }
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 10) {
    return `tel:+91${digits}`;
  }
  return `tel:+${digits}`;
}

export function getMailtoHref(
  email?: string | null,
  storeName = "Makerman",
  customSubject?: string
): string {
  if (!email || !email.trim()) return "#";
  const subject =
    customSubject || `Inquiry - ${storeName || "Makerman"} Client Concierge`;
  return `mailto:${email.trim()}?subject=${encodeURIComponent(subject)}`;
}
