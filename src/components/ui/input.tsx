import * as React from "react";

import { cn } from "@/lib/utils";
import { Eye, EyeClosed } from "lucide-react";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  const [show, setShow] = React.useState<boolean>(false);

  function toggleShow() {
    setShow((prev) => !prev);
  }

  const isPassword = type === "password";
  const inputType = isPassword ? (show ? "text" : "password") : type;

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

export { Input };
