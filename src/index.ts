import { v4 as uuid } from "uuid";
import { Logger } from "moment-logger";
import { URL } from "url";

import {
  PutObjectCommand,
  S3Client,
  ListBucketsCommand,
  ListObjectsCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

import { spacesApiKey, spacesApSecret, spacesEndpoint } from "./config";

const logger = new Logger({
  showErrorStack: true,
});

// The region is the subdomain assigned to the spaces endpoint
// Example https://sfo3.digitaloceanspaces.com is sfo3

const { hostname } = new URL(spacesEndpoint);
const REGION = hostname.split(".")[0];

const s3Client = new S3Client({
  endpoint: spacesEndpoint,
  forcePathStyle: false,
  region: REGION,
  credentials: {
    accessKeyId: spacesApiKey,
    secretAccessKey: spacesApSecret,
  },
});

async function StartExample() {
  logger.log("Fetching existing buckets");

  const { Buckets } = await s3Client.send(new ListBucketsCommand({}));

  if (!Buckets?.length) {
    throw new Error("No buckets created");
  }

  const [selected] = Buckets;

  logger.log(`Selecting first bucket: ${selected.Name}`);

  logger.log("Attempting to upload image");

  const params = {
    Bucket: selected.Name,
    Key: "demo/hello-world.txt",
    Body: "Hello, World!",
    ACL: "public-read",
    Metadata: {
      "x-amz-meta-my-key": `demo-upload-${uuid()}`,
    },
  };

  // check if file exists and delete if it does

  const { Contents } = await s3Client.send(
    new ListObjectsCommand({
      Bucket: selected.Name,
    })
  );

  const file = Contents?.find((content) => content.Key === params.Key);

  if (file) {
    logger.log("File already exists, deleting file");
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: selected.Name,
        Key: file.Key,
      })
    );

    logger.info("Successfully deleted file");
  }

  await s3Client.send(new PutObjectCommand(params));
  logger.log(`File successfully uploaded to ${params.Bucket}/${params.Key}`);
  const resourceUrl = `https://${
    selected.Name
  }.${spacesEndpoint}/${encodeURIComponent(params.Key)}`;

  logger.info(`File is available at: ${resourceUrl}`);
}

StartExample().catch(logger.error);
