import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import dotenv from 'dotenv';

dotenv.config();
export const s3 = new S3Client({
  region: process.env['AWS_REGION'],
  endpoint: process.env['AWS_ENDPOINT'], // useful for LocalStack
  credentials: {
    accessKeyId: process.env['AWS_ACCESS_KEY_ID'] || 'test',
    secretAccessKey: process.env['AWS_SECRET_ACCESS_KEY'] || 'test',
  },
  forcePathStyle: true, // needed for LocalStack
});

export const s3upload = async (file: Express.Multer.File, userRole: string) => {
  const bucket = process.env['AWS_BUCKET_NAME'];
  if (!bucket) throw new Error('AWS_BUCKET_NAME is not defined');

  const params = {
    Bucket: bucket,
    Key: `${userRole}s/profilePicture/${file.originalname}`,
    Body: file.buffer,
  };

  try {
    const upload = new Upload({ client: s3, params });
    await upload.done();
    console.log(`✅ Uploaded: ${params.Key}`);
  } catch (err) {
    console.error('❌ Upload error:', err);
    throw err;
  }
};
