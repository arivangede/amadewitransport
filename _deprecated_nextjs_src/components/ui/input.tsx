import * as React from "react";

import { cn } from "@/lib/utils";
import { Eye, EyeClosed } from "lucide-react";

// Komponen input utama
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  const [show, setShow] = React.useState<boolean>(false);

  function toggleShow() {
    setShow((prev) => !prev);
  }

  const isPassword = type === "password";
  const inputType = isPassword ? (show ? "text" : "password") : type;

  // Jika type adalah "price", render komponen PriceInput
  if (type === "price") {
    return <PriceInput className={className} {...props} />;
  }

  return (
    <div className="relative">
      <input
        type={inputType}
        data-slot="input"
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          isPassword && "pr-12",
          className
        )}
        {...props}
      />
      {isPassword && (
        <button
          type="button"
          onClick={toggleShow}
          tabIndex={-1}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground focus:outline-none"
        >
          {show ? <EyeClosed /> : <Eye />}
        </button>
      )}
    </div>
  );
}

// Komponen khusus untuk input harga dengan satuan IDR
function PriceInput({
  className,
  value,
  onChange,
  ...props
}: React.ComponentProps<"input">) {
  // Fungsi untuk format angka ke format IDR tanpa simbol
  function formatIDR(num: number | string): string {
    const clean =
      typeof num === "number" ? num.toString() : num.replace(/[^\d]/g, "");
    if (!clean) return "";
    return clean.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  // State lokal untuk menyimpan nilai terformat
  const [displayValue, setDisplayValue] = React.useState<string>(
    formatIDR(
      typeof value === "string" || typeof value === "number" ? value : 0
    )
  );

  // Sinkronkan displayValue dengan value dari props
  React.useEffect(() => {
    setDisplayValue(
      formatIDR(
        typeof value === "string" || typeof value === "number" ? value : 0
      )
    );
  }, [value]);

  // Handle perubahan input
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^\d]/g, ""); // Hapus karakter non-numerik
    const intValue = raw ? parseInt(raw, 10) : 0; // Konversi ke integer, default 0
    if (!isNaN(intValue)) {
      // Panggil onChange dengan event yang dimodifikasi untuk react-hook-form
      onChange?.({
        ...e,
        target: {
          ...e.target,
          value: intValue.toString(), // react-hook-form mengharapkan string di event
        },
      });
      // Update displayValue untuk UI
      setDisplayValue(formatIDR(intValue));
    }
  }

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm select-none">
        IDR
      </span>
      <input
        type="text"
        inputMode="numeric"
        data-slot="input"
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent pl-12 pr-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          className
        )}
        value={displayValue}
        onChange={handleChange}
        {...props}
      />
    </div>
  );
}

export { Input };
