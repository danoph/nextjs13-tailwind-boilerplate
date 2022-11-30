// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import {
  S3Client,
  ListObjectsCommand,
}
from "@aws-sdk/client-s3";

const REGION = "us-east-1";
// Create an Amazon S3 service client object.
const s3Client = new S3Client({ region: REGION });

const bucketParams = { Bucket: "danoph-image-resizer-output" };

const getImages = async () => {
  try {
    const data = await s3Client.send(
      new ListObjectsCommand(bucketParams)
    );
    console.log("Success", data);
    return data;
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

  const response = await getImages();

  const images = response?.Contents || [];

  //const image1 = {
    //id: 1,
    //url: '',
  //};

  //const images = [
    //image1,
  //];

  res.status(200).json(images);
}
