import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { isS3Configured, uploadFile } from './s3Helper';

export const handleChunkUpload = async (req: Request, res: Response) => {
  try {
      const chunk = req.file;
  
    const { originalname, chunkIndex, totalChunks } = req.body;
    const uploadDir = path.join(__dirname, '../../uploads/video');
    const filePath = path.join(uploadDir, originalname);

    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    if (!chunk || !chunk.buffer) {
        return res.status(400).json({ status: 'error', message: 'No chunk received' });
    }

    fs.appendFileSync(filePath, chunk.buffer);

    if (Number(chunkIndex) + 1 === Number(totalChunks)) {
        if (isS3Configured()) {
          const result = await uploadFile(`/video/${originalname}`);
          return res.json(result.url);
        }

        return res.json(`/video/${originalname}`);
    }

    res.json({ status: 'chunkReceived', message: 'Chunk received!' });
  } catch (error) {
    console.log(error);
    
  }
};
