import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  HeadObjectCommand,
  CopyObjectCommand,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';
import { config } from '../../config';

const s3Client = new S3Client({
  region: config.s3.region,
  endpoint: config.s3.endpoint,
  credentials: {
    accessKeyId: config.s3.accessKeyId,
    secretAccessKey: config.s3.secretAccessKey,
  },
  forcePathStyle: config.s3.forcePathStyle,
});

export interface UploadFileParams {
  file: Buffer | Readable;
  key: string;
  bucket?: string;
  contentType?: string;
  metadata?: Record<string, string>;
  acl?: 'private' | 'public-read' | 'public-read-write' | 'authenticated-read';
}

export interface DownloadFileParams {
  key: string;
  bucket?: string;
}

export interface DeleteFileParams {
  key: string;
  bucket?: string;
}

export interface GetSignedUrlParams {
  key: string;
  bucket?: string;
  expiresIn?: number;
}

export interface ListFilesParams {
  prefix?: string;
  bucket?: string;
  maxKeys?: number;
}

export interface CopyFileParams {
  sourceKey: string;
  destinationKey: string;
  sourceBucket?: string;
  destinationBucket?: string;
}

/**
 * อัพโหลดไฟล์ไปยัง S3/MinIO
 */
export async function uploadFile(params: UploadFileParams) {
  const { file, key, bucket = config.s3.bucket, contentType, metadata, acl } = params;

  try {
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: bucket,
        Key: key,
        Body: file,
        ContentType: contentType,
        Metadata: metadata,
        ACL: acl,
      },
    });

    const result = await upload.done();
    
    return {
      success: true,
      key: key,
      bucket: bucket,
      location: result.Location,
      etag: result.ETag,
    };
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    throw error;
  }
}

/**
 * ดาวน์โหลดไฟล์จาก S3/MinIO
 */
export async function downloadFile(params: DownloadFileParams) {
  const { key, bucket = config.s3.bucket } = params;

  try {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const response = await s3Client.send(command);
    
    return {
      success: true,
      body: response.Body,
      contentType: response.ContentType,
      contentLength: response.ContentLength,
      metadata: response.Metadata,
    };
  } catch (error) {
    console.error('Error downloading file from S3:', error);
    throw error;
  }
}

/**
 * ลบไฟล์จาก S3/MinIO
 */
export async function deleteFile(params: DeleteFileParams) {
  const { key, bucket = config.s3.bucket } = params;

  try {
    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    await s3Client.send(command);
    
    return {
      success: true,
      message: `File ${key} deleted successfully`,
    };
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    throw error;
  }
}

/**
 * สร้าง Signed URL สำหรับดาวน์โหลดไฟล์ชั่วคราว
 */
export async function getSignedDownloadUrl(params: GetSignedUrlParams) {
  const { key, bucket = config.s3.bucket, expiresIn = 3600 } = params;

  try {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    
    return {
      success: true,
      url: signedUrl,
      expiresIn: expiresIn,
    };
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw error;
  }
}

/**
 * สร้าง Signed URL สำหรับอัพโหลดไฟล์ชั่วคราว
 */
export async function getSignedUploadUrl(params: GetSignedUrlParams) {
  const { key, bucket = config.s3.bucket, expiresIn = 3600 } = params;

  try {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    
    return {
      success: true,
      url: signedUrl,
      expiresIn: expiresIn,
    };
  } catch (error) {
    console.error('Error generating signed upload URL:', error);
    throw error;
  }
}

/**
 * ตรวจสอบว่าไฟล์มีอยู่หรือไม่
 */
export async function fileExists(params: DownloadFileParams) {
  const { key, bucket = config.s3.bucket } = params;

  try {
    const command = new HeadObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const response = await s3Client.send(command);
    
    return {
      exists: true,
      size: response.ContentLength,
      lastModified: response.LastModified,
      contentType: response.ContentType,
    };
  } catch (error: any) {
    if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
      return { exists: false };
    }
    throw error;
  }
}

/**
 * แสดงรายการไฟล์ใน bucket
 */
export async function listFiles(params: ListFilesParams = {}) {
  const { prefix, bucket = config.s3.bucket, maxKeys = 1000 } = params;

  try {
    const command = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix,
      MaxKeys: maxKeys,
    });

    const response = await s3Client.send(command);
    
    return {
      success: true,
      files: response.Contents?.map((item) => ({
        key: item.Key,
        size: item.Size,
        lastModified: item.LastModified,
        etag: item.ETag,
      })) || [],
      count: response.KeyCount,
      isTruncated: response.IsTruncated,
    };
  } catch (error) {
    console.error('Error listing files from S3:', error);
    throw error;
  }
}

/**
 * คัดลอกไฟล์ภายใน S3/MinIO
 */
export async function copyFile(params: CopyFileParams) {
  const {
    sourceKey,
    destinationKey,
    sourceBucket = config.s3.bucket,
    destinationBucket = config.s3.bucket,
  } = params;

  try {
    const command = new CopyObjectCommand({
      Bucket: destinationBucket,
      Key: destinationKey,
      CopySource: `${sourceBucket}/${sourceKey}`,
    });

    const response = await s3Client.send(command);
    
    return {
      success: true,
      sourceKey,
      destinationKey,
      etag: response.CopyObjectResult?.ETag,
    };
  } catch (error) {
    console.error('Error copying file in S3:', error);
    throw error;
  }
}

/**
 * อัพโหลดไฟล์จาก Express multipart form
 */
export async function uploadFromMultipart(
  file: Express.Multer.File,
  folder: string = 'uploads'
) {
  const timestamp = Date.now();
  const fileName = `${folder}/${timestamp}-${file.originalname}`;

  return await uploadFile({
    file: file.buffer,
    key: fileName,
    contentType: file.mimetype,
    metadata: {
      originalName: file.originalname,
      uploadedAt: new Date().toISOString(),
    },
    acl: 'public-read-write',
  });
}

/**
 * ดาวน์โหลดไฟล์เป็น Buffer
 */
export async function downloadFileAsBuffer(params: DownloadFileParams): Promise<Buffer> {
  const result = await downloadFile(params);
  
  if (result.body instanceof Readable) {
    const chunks: Buffer[] = [];
    for await (const chunk of result.body) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  }
  
  throw new Error('Unexpected response body type');
}

/**
 * Helper function สำหรับสร้าง key จาก path
 */
export function generateS3Key(prefix: string, filename: string): string {
  const timestamp = Date.now();
  const cleanFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `${prefix}/${timestamp}-${cleanFilename}`;
}

export default {
  uploadFile,
  downloadFile,
  deleteFile,
  getSignedDownloadUrl,
  getSignedUploadUrl,
  fileExists,
  listFiles,
  copyFile,
  uploadFromMultipart,
  downloadFileAsBuffer,
  generateS3Key,
  s3Client,
};