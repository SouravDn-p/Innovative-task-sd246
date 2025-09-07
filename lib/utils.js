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

// Date validation utility
export function isValidDate(dateString) {
  const date = new Date(dateString);
  return date !== "Invalid Date" && !isNaN(date);
}

// Format date for display with error handling
export function formatDate(dateString) {
  try {
    if (!dateString || !isValidDate(dateString)) {
      return "Invalid Date";
    }
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid Date";
  }
}

// Format currency with proper localization
export function formatCurrencyINR(value, currency = "INR") {
  try {
    const num = safeNumber(value);
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(num);
  } catch (error) {
    console.error("Error formatting currency:", error);
    return "₹0.00";
  }
}
