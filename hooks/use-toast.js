"use client";
import { toast as sonnerToast } from "sonner";

// Assuming ToastActionElement and ToastProps are defined elsewhere or can be inferred
// For the purpose of this file, we'll use basic types.
// In a real shadcn/ui setup, these would come from components/ui/toast.
/**
 * @typedef {Object} ToastActionElement
 * @property {string} altText
 * @property {React.ReactNode} children
 */

/**
 * @typedef {Object} ToastProps
 * @property {string} id
 * @property {React.ReactNode} [title]
 * @property {React.ReactNode} [description]
 * @property {ToastActionElement} [action]
 * @property {boolean} [open]
 */

const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 1000000;

/**
 * @typedef {ToastProps & { id: string, title?: React.ReactNode, description?: React.ReactNode, action?: ToastActionElement }} ToasterToast
 */

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
};

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_VALUE;
  return count.toString();
}

/**
 * @typedef {typeof actionTypes} ActionType
 */

/**
 * @typedef {
 *   | { type: ActionType["ADD_TOAST"], toast: ToasterToast }
 *   | { type: ActionType["UPDATE_TOAST"], toast: Partial<ToasterToast> }
 *   | { type: ActionType["DISMISS_TOAST"], toastId?: ToasterToast["id"] }
 *   | { type: ActionType["REMOVE_TOAST"], toastId?: ToasterToast["id"] }
 * } Action
 */

/**
 * @typedef {Object} State
 * @property {ToasterToast[]} toasts
 */

const toastTimeouts = new Map();

const addToRemoveQueue = (toastId) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    });
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(toastId, timeout);
};

/**
 * @param {State} state
 * @param {Action} action
 * @returns {State}
 */
export const reducer = (state, action) => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };

    case "DISMISS_TOAST": {
      const { toastId } = action;

      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id);
        });
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      };
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
  }
};

const listeners = [];

let memoryState = { toasts: [] };

function dispatch(action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

const toast = sonnerToast;

function useToast() {
  return {
    toast,
    dismiss: sonnerToast.dismiss,
  };
}

export { useToast, toast };
