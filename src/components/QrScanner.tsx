import { Html5Qrcode } from "html5-qrcode";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface QrScannerProps {
  onScan: (decodedText: string) => void;
  className?: string;
}

export function QrScanner({ onScan, className }: QrScannerProps) {
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const mountedRef = useRef<boolean>(true);

  useEffect(() => {
    mountedRef.current = true;
    const elementId = "reader";
    
    // Instantiate the scanner
    const html5QrCode = new Html5Qrcode(elementId);
    scannerRef.current = html5QrCode;
    let isRunning = false;

    const startScanner = async () => {
      try {
        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            if (mountedRef.current) {
              onScan(decodedText);
            }
          },
          (errorMessage) => {
            // parse error, ignore
          }
        );
        
        if (mountedRef.current) {
          isRunning = true;
        } else {
          // If unmounted during start, stop immediately
          html5QrCode.stop().then(() => html5QrCode.clear()).catch(() => {});
        }
      } catch (err) {
        if (mountedRef.current) {
          console.error("Error starting scanner", err);
          setError("Gagal memulai kamera. Pastikan izin kamera diberikan.");
        }
      }
    };

    startScanner();

    return () => {
      mountedRef.current = false;
      if (scannerRef.current) {
        if (isRunning) {
          scannerRef.current
            .stop()
            .then(() => {
              // Only clear if we successfully stopped
              return scannerRef.current?.clear();
            })
            .catch((err) => {
              // Ignore stop errors
              console.warn("Scanner cleanup warning:", err);
            });
        } else {
           // If not running, just try to clear to be safe, but ignore errors
           try {
             scannerRef.current.clear();
           } catch (e) {
             // ignore
           }
        }
      }
    };
  }, [onScan]);

  return (
    <div className={cn("w-full max-w-md mx-auto", className)}>
      <div 
        id="reader" 
        className="overflow-hidden rounded-xl border-2 border-slate-200 shadow-sm bg-black min-h-[300px]"
      ></div>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}
