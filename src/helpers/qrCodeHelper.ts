import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs';
import { isS3Configured, uploadFile } from './s3Helper';

export async function generateQRCode(data: string) {
  try {
    const fileName = `qrcode_${Math.random().toString(36).substr(2, 9)}.png`;
    const imgPath = `/qrCode/${fileName}`;
    const imageUrl = path.join(process.cwd(), 'uploads', imgPath);
    fs.mkdirSync(path.dirname(imageUrl), { recursive: true });

    const buffer = await QRCode.toBuffer(data, {
      color: {
        dark: '#000',
        light: '#FFF',
      },
    });
    fs.writeFileSync(imageUrl, buffer);

    if (isS3Configured()) {
      return (await uploadFile(imgPath)).url;
    }

    return imgPath;
  } catch (error) {
    console.error('Error generating QR code:', error);
  }
}
