import fs from 'fs';
import path from 'path';
import { deleteFile, isS3Configured } from '../helpers/s3Helper';

const unlinkFile = (file?: string | null) => {
  if (!file) {
    return;
  }

  if (isS3Configured()) {
    deleteFile(file);
  }

  if (file.startsWith('http://') || file.startsWith('https://')) {
    return;
  }

  const filePath = path.join(process.cwd(), 'uploads', file.replace(/^\/+/, ''));
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

export default unlinkFile;
