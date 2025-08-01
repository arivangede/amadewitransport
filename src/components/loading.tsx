import React from "react";

// Catatan: CSS tidak bisa langsung ditulis di file .tsx seperti di HTML.
// Solusi: gunakan style JSX, atau lebih baik, gunakan file CSS terpisah dan import ke sini.
// Berikut contoh dengan style JSX:

export function Loading({ color = "#000" }: { color?: string }) {
  // Default warna hitam jika color tidak diberikan
  // color bisa berupa hex, rgb, atau nama warna CSS
  return (
    <>
      <div className="loader flex flex-row gap-[5px]">
        <span className="bar"></span>
        <span className="bar"></span>
        <span className="bar"></span>
        <span className="bar"></span>
        <span className="bar"></span>
      </div>
      <style jsx>{`
        /* Dari Uiverse.io oleh aryamitra06 */
        .loader {
          display: flex;
          align-items: center;
        }

        .bar {
          width: 3px;
          height: 20px;
          background-color: ${color ? color + "5" : "#0005"};
          border-radius: 10px;
          animation: scale-up4 1s linear infinite;
        }

        .bar:nth-child(2) {
          animation-delay: 0.2s;
        }

        .bar:nth-child(3) {
          animation-delay: 0.4s;
        }

        .bar:nth-child(4) {
          animation-delay: 0.6s;
        }

        .bar:nth-child(5) {
          animation-delay: 0.8s;
        }

        @keyframes scale-up4 {
          20% {
            background-color: ${color ? color : "#000"};
            transform: scaleY(1.5);
          }
          40% {
            transform: scaleY(1);
          }
        }
      `}</style>
    </>
  );
}
