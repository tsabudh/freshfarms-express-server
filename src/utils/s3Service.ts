import { S3 } from 'aws-sdk';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' })
// import AWS from 'aws-sdk';

// Set your AWS credentials
// AWS.config.update({
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.ACCESS_SECRET_ACCESS_KEY,
//   region: process.env.AWS_REGION, // Optional, specify your AWS region
// });

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

export const s3uploadV3 = async (file: any,userRole) => {
    const s3 = new S3Client({ region: process.env.AWS_REGION });

    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `${userRole}s/profilePicture/${file.originalname}`,
        Body: file.buffer,
    };

    const parallelUploads3 = new Upload({
        client: s3,
        params: params,
    });

    try {
        await parallelUploads3.done();
        console.log("Upload successful");
    } catch (err) {
        console.error("Error", err);
    }
};


export const s3uploadV2 = async (file: any) => {
    const s3 = new S3();

    const param = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `admins/profilePicture/${file.originalname}`,
        Body: file.buffer,
    }

    //* Error: Not assignable to putObjectRequest type
    return s3.upload(param).promise();
}