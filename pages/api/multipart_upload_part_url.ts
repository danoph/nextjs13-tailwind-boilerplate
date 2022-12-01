import type { NextApiRequest, NextApiResponse } from 'next'

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  S3Client,
  UploadPartCommand,
}
from "@aws-sdk/client-s3";

const BUCKET = 'danoph-image-resizer';

const REGION = "us-east-1";
const client = new S3Client({ region: REGION });

export default async function getMultipartPreSignedUrls(req, res) {
  const { fileKey, fileId, partNumber } = req.body;

  const multipartParams = {
    Bucket: BUCKET,
    Key: fileKey,
    UploadId: fileId,
  };

  const command = new UploadPartCommand({
    ...multipartParams,
    PartNumber: partNumber,
  });

  const signedUrl = getSignedUrl(client, command, {
    expiresIn: 3600,
  });

  res.status(201).json({
    signedUrl,
    PartNumber: partNumber,
  })
}
