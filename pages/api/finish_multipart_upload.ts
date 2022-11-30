import type { NextApiRequest, NextApiResponse } from 'next'

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  S3Client,
  CompleteMultipartUploadCommand,
}
from "@aws-sdk/client-s3";

const BUCKET = 'danoph-image-resizer';

const REGION = "us-east-1";
const client = new S3Client({ region: REGION });

export default async function finalizeMultipartUpload(req, res) {
  console.log('finishing multipart upload');
  const { uploadId, key, parts } = JSON.parse(req.body)
  console.log(req.body);

  const multipartParams = {
    Bucket: BUCKET,
    Key: key,
    UploadId: uploadId,
    MultipartUpload: {
      Parts: parts.sort((a, b) => {
        if (a.PartNumber < b.PartNumber) {
          return -1;
        }

        if (a.PartNumber > b.PartNumber) {
          return 1;
        }

        return 0;
      })
    },
  }

  const command = new CompleteMultipartUploadCommand(multipartParams);
  const response = await client.send(command);
  console.log('output', response);
  // completeMultipartUploadOutput.Location represents the
  // URL to the resource just uploaded to the cloud storage
  res.status(200).json({})
};
