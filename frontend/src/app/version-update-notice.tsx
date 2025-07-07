"use client";
import { useEffect, useState } from "react";

export default function VersionUpdateNotice() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let currentHash = '';
    let interval: ReturnType<typeof setInterval>;
    // Check for updates every 30 seconds
    async function checkForUpdate() {
      try {
        // Fetch the current build hash from the Next.js build manifest
        const res = await fetch('/_next/static/webpack/webpack.js');
        const text = await res.text();
        // Extract hash from the file (works for most Next.js setups)
        const match = text.match(/__webpack_require__\.h=\(\)=>\"([a-f0-9]+)\"/);
        if (match && match[1]) {
          if (!currentHash) {
            currentHash = match[1];
          } else if (currentHash !== match[1]) {
            setShow(true);
            clearInterval(interval);
          }
        }
      } catch (e) {
        // Ignore errors
      }
    }
    interval = setInterval(checkForUpdate, 30000);
    // Run once on mount
    checkForUpdate();
    return () => clearInterval(interval);
  }, []);

  if (!show) return null;
  return (
    <div className="fixed top-0 left-0 w-full bg-yellow-500 text-black text-center py-2 z-50 shadow-lg">
      <span>New version available. Please refresh the page.</span>
      <button
        className="ml-4 px-3 py-1 bg-black text-yellow-300 rounded hover:bg-gray-800 transition-colors"
        onClick={() => setShow(false)}
      >
        Dismiss
      </button>
    </div>
  );
} 