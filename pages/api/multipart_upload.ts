import type { NextApiRequest, NextApiResponse } from 'next'

import {
  S3Client,
  CreateMultipartUploadCommand,
}
from "@aws-sdk/client-s3";

const BUCKET = 'danoph-image-resizer';

const REGION = "us-east-1";
const client = new S3Client({ region: REGION });

export default async function initializeMultipartUpload(req, res) {
  const { filename } = req.body;

  const command = new CreateMultipartUploadCommand({
    Bucket: BUCKET,
    Key: filename,
    ACL: "private",
  });

  const multipartUpload = await client.send(command);

  //res.status(200).json({
    //fileId: "FDhUkMr8GQX8MkEQADI9mPdJZ_ee9wU_phoXDq2ZkoHevN1pU5aQvJIzTYhFJO6imi8xYhBJzH.qtWEyWrc8QY4r8DaWs4BJs4VbYHHr9AXeUqZIEKAN4EnHpPYFgc_s",
    //fileKey: "MediumTestFile"
  //});

  res.status(201).json({
    fileId: multipartUpload.UploadId,
    fileKey: multipartUpload.Key,
  })
}
