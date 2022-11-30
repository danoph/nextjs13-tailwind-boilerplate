// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { S3Client, HeadObjectCommand } from "@aws-sdk/client-s3";

const REGION = "us-east-1";
// Create an Amazon S3 service client object.
const s3Client = new S3Client({ region: REGION });

const bucketParams = { Bucket: "danoph-image-resizer-output" };

const getImageMetadata = async (key) => {
  try {
    const response = await s3Client.send(
      new HeadObjectCommand({
        Bucket: "danoph-image-resizer-output",
        Key: key,
      })
    );
    console.log("IMAGE METADATA", response);
    return response;
  } catch (err) {
    console.log("Error", err);
  }
};

//https://docs.aws.amazon.com/AmazonS3/latest/userguide/example_s3_ListObjects_section.html

//type Data = {
  //name: string
//}

//https://docs.aws.amazon.com/AmazonS3/latest/userguide/example_s3_ListObjects_section.html
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {

  const { filename } = JSON.parse(req.body);
  const response = await getImageMetadata(filename);

  res.status(200).json(response);
}
