"use client";
import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

export default function TrafficTrackProvider() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    let visitorId = localStorage.getItem("visitor_uuid");
    if (!visitorId) {
      visitorId = uuidv4();
      localStorage.setItem("visitor_uuid", visitorId);
    }

    fetch("/api/track-visitor", {
      method: "POST",
      body: JSON.stringify({
        uuid: visitorId,
        userAgent: navigator.userAgent,
        screenWidth: window.innerWidth,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  }, []);

  return null;
}
