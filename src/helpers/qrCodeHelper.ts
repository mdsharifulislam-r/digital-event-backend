
import QRCode from 'qrcode';
import path from 'path'
import fs from 'fs'
export async function generateQRCode(data: string) {
try {
        const imgPath =  `/qrCode/qrcode_${Math.random().toString(36).substr(2, 9)}.png`
    const imageUrl = path.join(process.cwd(), 'uploads',imgPath);
    if(!fs.existsSync(imageUrl)){
        fs.mkdirSync(path.dirname(imageUrl), { recursive: true });
    }
    QRCode.toFile(
  imageUrl,
  data,
  {
    color: {
      dark: '#000',
      light: '#FFF',
    },
  },
  (err) => {
    if (err) throw err;

    console.log('QR Code generated!');
  }
  
);

return imgPath
} catch (error) {
    console.error('Error generating QR code:', error);
}
}