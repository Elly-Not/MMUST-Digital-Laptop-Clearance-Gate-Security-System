import QRCode from 'qrcode';
import jsQR from 'jsqr';

/**
 * Generates high quality QR code data URL (PNG)
 */
export async function generateQrDataUrl(data: string, options?: QRCode.QRCodeToDataURLOptions): Promise<string> {
  try {
    return await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 400,
      color: {
        dark: '#003B22', // MMUST deep university green
        light: '#FFFFFF',
      },
      ...options,
    });
  } catch (err) {
    console.error('Failed to generate QR code', err);
    throw err;
  }
}

/**
 * Scan / decode an image file or base64 data for QR code content
 */
export async function decodeQrFromImage(imageSrc: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(null);
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      if (code && code.data) {
        resolve(code.data);
      } else {
        resolve(null);
      }
    };
    img.onerror = () => {
      resolve(null);
    };
    img.src = imageSrc;
  });
}
