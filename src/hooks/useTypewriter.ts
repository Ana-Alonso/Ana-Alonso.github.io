import { useEffect, useState } from "react";

export function useTypewriter(text: string, speed = 18): string {
  const [typed, setTyped] = useState("");

  useEffect(() => {
    setTyped("");
    let index = 0;

    const timer = window.setInterval(() => {
      index += 1;
      setTyped(text.slice(0, index));

      if (index >= text.length) {
        window.clearInterval(timer);
      }
    }, speed);

    return () => window.clearInterval(timer);
  }, [text, speed]);

  return typed;
}

