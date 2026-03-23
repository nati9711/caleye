/**
 * Barcode detection using the native BarcodeDetector API.
 *
 * Available in Chrome/Edge (Chromium-based browsers).
 * Returns null silently if the API is not supported — the caller
 * should fall back to the Gemini + USDA pipeline.
 */

export async function detectBarcode(base64Frame: string): Promise<string | null> {
  // Check if BarcodeDetector is available (Chromium only)
  if (!('BarcodeDetector' in globalThis)) return null;

  try {
    const blob = await fetch(`data:image/jpeg;base64,${base64Frame}`).then(r => r.blob());
    const bitmap = await createImageBitmap(blob);
    const detector = new (globalThis as any).BarcodeDetector({
      formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e'],
    });
    const results = await detector.detect(bitmap);
    return results.length > 0 ? results[0].rawValue : null;
  } catch {
    return null;
  }
}
