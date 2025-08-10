"use client";
import { Button } from "./ui/button";

interface WhatsappButtonProps {
  item?: string;
  discount?: string;
  size?: "sm" | "default" | "lg" | "full" | "icon" | null;
}

export default function WhatsappButton({
  item,
  discount,
  size = "full",
}: WhatsappButtonProps) {
  const rawPhone: string =
    process.env.NEXT_PUBLIC_CONTACT_NUMBER || "+62 813-3933-9520";
  const formattedPhone = rawPhone.replace(/[^0-9]/g, "");

  function generateLink() {
    // Dynamic message, add discount if available
    let message = `Hello Amadewi Trans, I would like to book:\n• ${
      item ? item : "-"
    }`;
    if (discount) {
      message += `\nWith discount: ${discount}`;
    }

    message += "\nFor date:";
    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);
    // Create WhatsApp link
    return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
  }

  return (
    <Button
      onClick={() =>
        window.open(generateLink(), "_blank", "noopener,noreferrer")
      }
      size={size}
      type="button"
    >
      {discount ? "Book With Discount" : "Book Now"}
    </Button>
  );
}
