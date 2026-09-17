import * as faceapi from 'face-api.js';
import canvas, { Canvas, Image, ImageData } from 'canvas';
import path from 'path';
import sharp from 'sharp';
import axios from 'axios';
import ApiError from '../errors/ApiError';
import { getS3ObjectBuffer, isS3Configured } from './s3Helper';

// Patch face-api with node-canvas
faceapi.env.monkeyPatch({ Canvas: Canvas as any, Image: Image as any, ImageData: ImageData as any });

const MODEL_PATH = path.join(process.cwd(), 'models');

// Load models
export const loadModels = async () => {
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_PATH);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_PATH);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_PATH);
  console.log('✅ Models loaded');
};

loadModels();

const getExtension = (imagePath: string) => {
  try {
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return path.extname(new URL(imagePath).pathname).toLowerCase();
    }
  } catch {
    // fall through
  }
  return path.extname(imagePath).toLowerCase();
};

const ensureSupportedImageBuffer = async (buffer: Buffer, imagePath: string) => {
  const ext = getExtension(imagePath);
  if (!['.jpg', '.jpeg', '.png', '.bmp', '.gif'].includes(ext)) {
    return sharp(buffer).jpeg().toBuffer();
  }
  return buffer;
};

const loadImageBuffer = async (imagePath: string) => {
  if (isS3Configured()) {
    try {
      return await getS3ObjectBuffer(imagePath);
    } catch {
      // fall back to HTTP or local disk
    }
  }

  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    const response = await axios.get(imagePath, { responseType: 'arraybuffer' });
    return Buffer.from(response.data);
  }

  const filePath = path.join(process.cwd(), 'uploads', imagePath.replace(/^\/+/, ''));
  return sharp(filePath).toBuffer();
};

// Detect face and return descriptor
export const detectFace = async (imagePath: string) => {
  try {
    const buffer = await ensureSupportedImageBuffer(
      await loadImageBuffer(imagePath),
      imagePath,
    );
    const img = (await canvas.loadImage(buffer)) as unknown as HTMLImageElement;

    const detection = await faceapi
      .detectSingleFace(img)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) throw new ApiError(400, 'No face detected in the image');

    return detection.descriptor;
  } catch (err: any) {
    throw new ApiError(400, err.message);
  }
};

// Verify array of images
export const verifyFace = async (imagePath: string,existingDescriptor:any): Promise<boolean> => {
    

  const descriptor = await detectFace(imagePath);
  
  // Compare all descriptors
  const threshold = 0.6;
 const result = await faceapi
       .euclideanDistance(descriptor, objectToFloat32Array(existingDescriptor))
       
       if(result > threshold){
        throw new ApiError(400, 'Face not matched');
       }

  return true; // no match
};

function objectToFloat32Array(obj: Record<string, number>): Float32Array {
  const values = Object.keys(obj)
    .sort((a, b) => Number(a) - Number(b))
    .map((key) => obj[key]);

  return new Float32Array(values);
}
