import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Safe number handling utility to prevent runtime errors
export function safeNumber(value, defaultValue = 0) {
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
}

// Safe number formatting with proper error handling
export function formatCurrency(value, decimalPlaces = 2) {
  const num = safeNumber(value);
  return num.toFixed(decimalPlaces);
}

// Validation utilities
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone) {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ""));
}

// Sanitization utility to prevent XSS
export function sanitizeInput(input) {
  if (typeof input !== "string") return input;
  return input
    .replace(/[<>"'&]/g, (match) => {
      const htmlEntities = {
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#x27;",
        "&": "&amp;",
      };
      return htmlEntities[match];
    })
    .trim();
}

// MongoDB ObjectId validation
export function isValidObjectId(id) {
  return /^[0-9a-fA-F]{24}$/.test(id);
}
