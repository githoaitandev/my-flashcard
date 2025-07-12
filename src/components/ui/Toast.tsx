"use client";
import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  show: boolean;
  onClose: () => void;
  duration?: number;
  status?: "success" | "error" | "default";
}

export default function Toast({
  message,
  show,
  onClose,
  duration = 2000,
  status = "default",
}: ToastProps) {
  const [remainingTime, setRemainingTime] = useState(duration / 1000);

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      const interval = setInterval(() => {
        setRemainingTime((prev) => Math.max(prev - 1, 0));
      }, 1000);

      return () => {
        clearTimeout(timer);
        clearInterval(interval);
      };
    }
  }, [show, duration, onClose]);

  if (!show) return null;

  const backgroundColor =
    status === "success"
      ? "bg-green-700"
      : status === "error"
      ? "bg-red-500"
      : "bg-gray-900";
  const noteColor = status === "error" ? "text-white" : "text-white";
  const messageColor = status === "error" ? "text-white" : "text-white";

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 font-semibold ${messageColor} px-6 py-3 rounded shadow-lg animate-fade-in ${backgroundColor}`}
    >
      <div>{message}</div>
      <div className={`text-sm font-light ${noteColor}`}>
        Closing in {remainingTime}s
      </div>
    </div>
  );
}
