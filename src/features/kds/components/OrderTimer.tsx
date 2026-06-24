import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface OrderTimerProps {
  createdAt: string;
}

function getElapsedSeconds(createdAt: string): number {
  return Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000);
}

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}dtk`;
  return `${m}mnt ${s}dtk`;
}

function getSlaColor(seconds: number): {
  bg: string;
  text: string;
  border: string;
} {
  if (seconds < 300) {
    return { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" };
  }
  if (seconds < 600) {
    return { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200" };
  }
  return { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" };
}

export function OrderTimer({ createdAt }: OrderTimerProps) {
  const [seconds, setSeconds] = useState(() => getElapsedSeconds(createdAt));

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(getElapsedSeconds(createdAt));
    }, 1000);
    return () => clearInterval(interval);
  }, [createdAt]);

  const sla = getSlaColor(seconds);

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${sla.bg} ${sla.text} ${sla.border} border`}
    >
      <Clock className="h-3 w-3" />
      {formatElapsed(seconds)}
    </span>
  );
}
