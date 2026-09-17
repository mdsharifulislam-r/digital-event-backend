import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { unlinkSync } from 'fs';
import fs from 'fs/promises';
import mime from 'mime';
import path from 'path';
import config from '../config';
import {
  getMultipleFilesPath,
  getSingleFilePath,
} from '../shared/getFilePath';
import { errorLogger } from '../shared/logger';

const region = config.s3.region || 'eu-central-1';

let s3: S3Client | null = null;

export const isS3Configured = () =>
  Boolean(
    config.s3.accessKeyId &&
      config.s3.secretAccessKey &&
      config.s3.bucket,
  );

const getS3Client = () => {
  if (!s3) {
    s3 = new S3Client({
      region,
      credentials: {
        accessKeyId: config.s3.accessKeyId as string,
        secretAccessKey: config.s3.secretAccessKey as string,
      },
      endpoint: `https://s3.${region}.amazonaws.com`,
    });
  }

  return s3;
};

const getPublicUrl = (key: string) => {
  if (config.s3.baseUrl) {
    return `${config.s3.baseUrl.replace(/\/$/, '')}/${key}`;
  }

  return `https://${config.s3.bucket}.s3.${region}.amazonaws.com/${key}`;
};

const normalizePath = (filePath: string) => filePath.replace(/^\/+/, '');

export const getS3KeyFromPath = (file?: string | null) => {
  if (!file) {
    return null;
  }

  const marker = `${config.s3.bucket}.s3.${region}.amazonaws.com/`;
  if (file.includes(marker)) {
    return file.split(marker)[1];
  }

  const noRegionMarker = `${config.s3.bucket}.s3.amazonaws.com/`;
  if (file.includes(noRegionMarker)) {
    return file.split(noRegionMarker)[1];
  }

  const baseUrl = config.s3.baseUrl?.replace(/\/$/, '');
  if (baseUrl && file.startsWith(baseUrl)) {
    return file.slice(baseUrl.length).replace(/^\/+/, '');
  }

  if (file.startsWith('http://') || file.startsWith('https://')) {
    try {
      return new URL(file).pathname.replace(/^\/+/, '');
    } catch {
      return null;
    }
  }

  return normalizePath(file);
};

export const uploadFile = async (filePath: string) => {
  const relativePath = normalizePath(filePath);
  const localPath = path.join(process.cwd(), 'uploads', relativePath);
  const ext = path.extname(relativePath);
  const baseName = path.basename(relativePath, ext);
  const fileKey = `uploads/${baseName}${ext}`;
  const fileBuffer = await fs.readFile(localPath);
  const mimeType = mime.getType(localPath) || 'application/octet-stream';

  await getS3Client().send(
    new PutObjectCommand({
      Bucket: config.s3.bucket,
      Key: fileKey,
      Body: fileBuffer,
      ContentType: mimeType,
    }),
  );

  try {
    unlinkSync(localPath);
  } catch {
    // local file may already be removed
  }

  return {
    key: fileKey,
    url: getPublicUrl(fileKey),
  };
};

export const uploadMultipleFiles = async (filepaths: string[]) => {
  return Promise.all(filepaths.map(async filePath => (await uploadFile(filePath)).url));
};

export const deleteFile = async (filePath: string) => {
  const fileKey = getS3KeyFromPath(filePath);
  if (!fileKey || !isS3Configured()) {
    return;
  }

  try {
    await getS3Client().send(
      new DeleteObjectCommand({
        Bucket: config.s3.bucket,
        Key: fileKey,
      }),
    );
  } catch (error) {
    errorLogger.error('Failed to delete S3 object', error);
  }
};

export const deleteMultipleFiles = async (keys: string[]) => {
  await Promise.all(keys.map(key => deleteFile(key)));
};

export const uploadPhoto = async (files: any, fieldName = 'image') => {
  const filePath = getSingleFilePath(files, fieldName);
  if (!filePath) {
    return undefined;
  }

  if (!isS3Configured()) {
    return filePath;
  }

  return (await uploadFile(filePath)).url;
};

export const uploadPhotos = async (files: any, fieldName: string) => {
  const filePaths = getMultipleFilesPath(files, fieldName);
  if (!filePaths?.length) {
    return undefined;
  }

  if (!isS3Configured()) {
    return filePaths;
  }

  return uploadMultipleFiles(filePaths);
};

export const getObjectFromS3 = async (file: string, range?: string) => {
  const key = getS3KeyFromPath(file);
  if (!key) {
    throw new Error('Invalid S3 key');
  }

  return getS3Client().send(
    new GetObjectCommand({
      Bucket: config.s3.bucket,
      Key: key,
      ...(range ? { Range: range } : {}),
    }),
  );
};

export const getS3ObjectBuffer = async (file: string) => {
  const result = await getObjectFromS3(file);
  if (!result.Body) {
    throw new Error('Empty S3 object body');
  }

  const bytes = await result.Body.transformToByteArray();
  return Buffer.from(bytes);
};
