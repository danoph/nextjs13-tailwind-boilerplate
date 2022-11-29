// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import {
  S3Client,
  CreateBucketCommand,
  DeleteObjectCommand,
  PutObjectCommand,
  DeleteBucketCommand }
from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import fetch from "node-fetch";

const BUCKET = 'danoph-image-resizer';

const REGION = "us-east-1";
const s3Client = new S3Client({ region: REGION });

//export const run = async () => {
  ////try {
    ////// Create an S3 bucket.
    ////console.log(`Creating bucket ${bucketParams.Bucket}`);
    ////await s3Client.send(new CreateBucketCommand({ Bucket: bucketParams.Bucket }));
    ////console.log(`Waiting for "${bucketParams.Bucket}" bucket creation...`);
  ////} catch (err) {
    ////console.log("Error creating bucket", err);
  ////}
  //try {
    //// Create a command to put the object in the S3 bucket.
    //const command = new PutObjectCommand(bucketParams);
    //// Create the presigned URL.
    //const signedUrl = await getSignedUrl(s3Client, command, {
      //expiresIn: 3600,
    //});
    //console.log(
      //`\nPutting "${bucketParams.Key}" using signedUrl with body "${bucketParams.Body}" in v3`
    //);
    //console.log(signedUrl);
    //const response = await fetch(signedUrl, {method: 'PUT', body: bucketParams.Body});
    //console.log(
      //`\nResponse returned by signed URL: ${await response.text()}\n`
    //);
  //} catch (err) {
    //console.log("Error creating presigned URL", err);
  //}
  //try {
    //// Delete the object.
    //console.log(`\nDeleting object "${bucketParams.Key}"} from bucket`);
    //await s3Client.send(
      //new DeleteObjectCommand({ Bucket: bucketParams.Bucket, Key: bucketParams.Key })
    //);
  //} catch (err) {
    //console.log("Error deleting object", err);
  //}
  ////try {
    ////// Delete the S3 bucket.
    ////console.log(`\nDeleting bucket ${bucketParams.Bucket}`);
    ////await s3Client.send(
      ////new DeleteBucketCommand({ Bucket: bucketParams.Bucket })
    ////);
  ////} catch (err) {
    ////console.log("Error deleting bucket", err);
  ////}
//};

//run();

type Data = {
  name: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const { filename } = JSON.parse(req.body);

  //const signedUrl = 'https://asd123123123.com';

  //const bucketParams = {
    ////Bucket: `test-bucket-${Math.ceil(Math.random() * 10 ** 10)}`,
    //Bucket: BUCKET,
    //Key: filename,
    ////Body: "BODY"
  //};

  //const command = new PutObjectCommand(bucketParams);
  //const signedUrl = await getSignedUrl(s3Client, command, {
    //expiresIn: 3600,
  //});
  const client = new S3Client({ region: "us-east-1" });

  const Conditions = [
    { acl: "private" },
    { bucket: BUCKET },
    //["starts-with", "$key", "user/eric/"]
  ];

  //const Bucket = "johnsmith";
  //const Key = "user/eric/1";
  const Fields = {
    acl: "private",
    //key: filename,
  };

  const { url, fields } = await createPresignedPost(client, {
    Bucket: BUCKET,
    Key: filename,
    Conditions,
    Fields,
    //Expires: 600, //Seconds before the presigned post expires. 3600 by default.
  });

  console.log('url', url, 'fields', fields);

  res.status(200).json({ url, fields })
}
