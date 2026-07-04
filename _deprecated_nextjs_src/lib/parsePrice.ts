export function parseIDRPrice(price: string): number {
  if (!price || typeof price !== "string") {
    throw new Error("Invalid price input: Price must be a non-empty string");
  }

  // Hapus semua karakter non-numerik (misalnya, titik, koma, spasi)
  const cleanedPrice = price.replace(/[^0-9]/g, "");

  // Konversi ke integer
  const parsed = parseInt(cleanedPrice, 10);

  // Validasi hasil parsing
  if (isNaN(parsed)) {
    throw new Error(
      "Invalid price format: Could not parse price to a valid integer"
    );
  }

  // Pastikan tidak ada desimal (opsional, karena database integer)
  if (price.includes(".") || price.includes(",")) {
    const hasDecimal = price.match(/[\.,]\d+/);
    if (hasDecimal) {
      throw new Error("Price must be a whole number (no decimals)");
    }
  }

  return parsed;
}
