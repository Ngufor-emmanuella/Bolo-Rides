// components/TawkToWidget.js
"use client";
import { useEffect } from "react";
import TawkMessengerReact from "@tawk.to/tawk-messenger-react";

export default function TawkToWidget() {
  useEffect(() => {
    // Ensure Tawk_API is globally accessible
    if (typeof window !== "undefined") {
      window.Tawk_API = window.Tawk_API || {};
    }
  }, []);

  return (
    <TawkMessengerReact
      propertyId={process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID}
      widgetId={process.env.NEXT_PUBLIC_TAWK_WIDGET_ID}
    />
  );
}
