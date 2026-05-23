import { useState, useEffect } from "react";

export default function LiveClock({ className = "" }: { className?: string }) {
  const [t, setT] = useState(() => new Date());

  useEffect(() => {
    const i = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(i);
  }, []);

  const d = t.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  
  const time = t.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return <span className={`font-mono ${className}`}>{d} · {time}</span>;
}
