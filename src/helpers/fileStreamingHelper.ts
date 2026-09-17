import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import mime from 'mime';
import { Readable } from 'stream';
import { getObjectFromS3, isS3Configured } from './s3Helper';

const streamLocalFile = (req: Request, res: Response, filePath: string) => {
  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const contentType = mime.getType(filePath) || 'application/octet-stream';

  if (req.method === 'HEAD') {
    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': fileSize,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=3600',
    });
    return res.end();
  }

  const range = req.headers.range;

  if (!range) {
    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': fileSize,
      'Cache-Control': 'public, max-age=3600',
      'Accept-Ranges': 'bytes',
    });
    fs.createReadStream(filePath).pipe(res);
    return;
  }

  const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB chunks for large files
  const [startStr, endStr] = range.replace(/bytes=/, '').split('-');
  const start = parseInt(startStr, 10);
  const end = endStr
    ? Math.min(parseInt(endStr, 10), fileSize - 1)
    : Math.min(start + CHUNK_SIZE - 1, fileSize - 1);

  if (start >= fileSize || end >= fileSize) {
    return res.status(416).send(`Requested range not satisfiable\n${start} >= ${fileSize}`);
  }

  const contentLength = end - start + 1;

  res.writeHead(206, {
    'Content-Range': `bytes ${start}-${end}/${fileSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': contentLength,
    'Content-Type': contentType,
    'Cache-Control': 'public, max-age=3600',
    Connection: 'keep-alive',
  });

  const stream = fs.createReadStream(filePath, { start, end });

  stream.on('open', () => stream.pipe(res));
  stream.on('error', err => {
    console.error(`Error streaming file ${filePath}:`, err);
    res.status(500).end('Error streaming file');
  });
};

export const fileStreamHandler = async (req: Request, res: Response) => {
  try {
    const { folder, file } = req.params;
    const key = `${folder}/${file}`;
    const filePath = path.join(process.cwd(), 'uploads', folder, file);

    if (fs.existsSync(filePath)) {
      return streamLocalFile(req, res, filePath);
    }

    if (!isS3Configured()) {
      return res.status(404).json({ message: 'File not found' });
    }

    const range = typeof req.headers.range === 'string' ? req.headers.range : undefined;
    let result;
    try {
      result = await getObjectFromS3(key, range);
    } catch {
      result = await getObjectFromS3(`uploads/${file}`, range);
    }
    const body = result.Body as Readable | undefined;

    if (!body) {
      return res.status(404).json({ message: 'File not found' });
    }

    const headers: Record<string, string | number> = {
      'Content-Type': result.ContentType || mime.getType(file) || 'application/octet-stream',
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=3600',
    };

    if (result.ContentLength !== undefined) {
      headers['Content-Length'] = result.ContentLength;
    }

    if (req.method === 'HEAD') {
      res.writeHead(200, headers);
      return res.end();
    }

    if (result.ContentRange) {
      headers['Content-Range'] = result.ContentRange;
      res.writeHead(206, headers);
    } else {
      res.writeHead(200, headers);
    }

    body.pipe(res);
  } catch (err: any) {
    if (err?.name === 'NoSuchKey' || err?.$metadata?.httpStatusCode === 404) {
      return res.status(404).json({ message: 'File not found' });
    }
    console.error('File stream handler error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
