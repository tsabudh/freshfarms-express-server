import { S3 } from "aws-sdk";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });

// Set your AWS credentials
// AWS.config.update({
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.ACCESS_SECRET_ACCESS_KEY,
//   region: process.env.AWS_REGION, // Optional, specify your AWS region
// });

import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

export const s3uploadV3 = async (
  file: Express.Multer.File,
  userRole: string
) => {
  const region = process.env['AWS_REGION'];
  if (!region) throw new Error("AWS_REGION is not defined");
  const s3 = new S3Client({ region });

  const params = {
    Bucket: process.env['AWS_BUCKET_NAME'],
    Key: `${userRole}s/profilePicture/${file.originalname}`,
    Body: file.buffer,
  };

  const parallelUploads3 = new Upload({
    client: s3,
    params: params,
  });

  try {
    await parallelUploads3.done();
  } catch (err) {
    console.error("Error", err);
  }
};

export const s3uploadV2 = async (file: any) => {
  const s3 = new S3();

  const bucket = process.env['AWS_BUCKET_NAME'];

  if (!bucket) throw new Error("AWS_BUCKET_NAME is not defined");

  const param = {
    Bucket: bucket,
    Key: `admins/profilePicture/${file.originalname}`,
    Body: file.buffer,
  };

  //* Error: Not assignable to putObjectRequest type
  return s3.upload(param).promise();
};
