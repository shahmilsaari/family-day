"use client";

import { useEffect, useState } from "react";

export function LiveClock() {
  const [timeStr, setTimeStr] = useState("");

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };

    updateClock();
    const clockId = setInterval(updateClock, 1000);

    // Subtle score jitter effect on the scoreboard champion score
    const jitterId = setInterval(() => {
      const championScore = document.getElementById("champion-score-val");
      if (championScore) {
        championScore.classList.add("scale-105", "transition-transform", "duration-200");
        setTimeout(() => {
          championScore.classList.remove("scale-105");
        }, 200);
      }
    }, 8000);

    return () => {
      clearInterval(clockId);
      clearInterval(jitterId);
    };
  }, []);

  return <span>{timeStr || "14:45:02"}</span>;
}
