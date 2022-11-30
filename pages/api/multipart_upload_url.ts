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
  const { fileKey, fileId, parts } = req.body;

  const multipartParams = {
    Bucket: BUCKET,
    Key: fileKey,
    UploadId: fileId,
  };

  const promises = []

  for (let index = 0; index < parts; index++) {
    const command = new UploadPartCommand({
      ...multipartParams,
      PartNumber: index + 1,
    });
    //const signedUrl = await getSignedUrl(client, command, {
      //expiresIn: 3600,
    //});
    promises.push(
      getSignedUrl(client, command, {
        expiresIn: 3600,
      })
    );
      //s3.getSignedUrlPromise("uploadPart", {
        //...multipartParams,
        //PartNumber: index + 1,
      //}),
  }

  //const command = new UploadPartCommand(input);
  //const response = await client.send(command);

  const signedUrls = await Promise.all(promises)
  //console.log('signed urls', signedUrls);
  // assign to each URL the index of the part to which it corresponds
  const partSignedUrlList = signedUrls.map((signedUrl, index) => {
    return {
      signedUrl: signedUrl,
      PartNumber: index + 1,
    }
  })

  res.status(201).json({
    parts: partSignedUrlList,
  })
}
