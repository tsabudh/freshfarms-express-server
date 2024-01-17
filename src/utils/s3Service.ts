import { S3 } from 'aws-sdk';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' })
// import AWS from 'aws-sdk';

// // Set your AWS credentials
// AWS.config.update({
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.ACCESS_SECRET_ACCESS_KEY,
//   region: process.env.AWS_REGION, // Optional, specify your AWS region
// });

export const s3uploadV2 = async (file: any) => {
    const s3 = new S3();

    const param = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `admins/profilePicture/${file.originalname}`,
        Body: file.buffer,

    }

    return s3.upload(param).promise();
}