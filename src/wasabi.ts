import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { createReadStream, statSync } from "fs";

class Wasabi {
  private readonly accessKeyId = "9L534OTO5BFA4B1OR0YI";
  private readonly secretAccessKey = "7KagfZkDhpQFdfzsg3NroWt2Vb5RZB90zQzX4sw3";
  private readonly endpoint = "https://s3.eu-central-1.wasabisys.com";
  private readonly region = "eu-central-1";
  private readonly bucketName = "cartoonhub";
  private readonly client: S3Client;

  constructor() {
    this.client = new S3Client({
      region: this.region,
      endpoint: this.endpoint,
      credentials: {
        accessKeyId: this.accessKeyId,
        secretAccessKey: this.secretAccessKey,
      },
    });
  }

  async uploadFile(
    filePath: string,
    key: string
  ): Promise<{ ok: boolean; msg: string }> {
    try {
      const localFileStats = statSync(filePath);
      const localFileSize = localFileStats.size;

      try {
        const existingObject = await this.client.send(
          new GetObjectCommand({
            Bucket: this.bucketName,
            Key: key,
          })
        );

        if (existingObject.ContentLength === localFileSize) {
          return {
            ok: false,
            msg: `File ${key} already exists and is complete, skipping upload`,
          };
        } else {
          console.log(`File ${key} exists but size differs, re-uploading`);
        }
      } catch (error: any) {
        if (
          error.name === "NoSuchKey" ||
          error.$metadata?.httpStatusCode === 404
        ) {
          console.log("Uploading file to Wasabi...");
        } else {
          return {
            ok: false,
            msg: `Something went wrong`,
          };
        }
      }

      await this.client.send(
        new PutObjectCommand({
          Body: createReadStream(filePath),
          ContentLength: localFileSize,
          Bucket: this.bucketName,
          Key: key,
        })
      );
      console.log("File uploaded to wasabi");

      return { ok: true, msg: `File ${key} uploaded` };
    } catch (error) {
      if (error instanceof Error) {
        return { ok: false, msg: error.message };
      } else {
        return { ok: false, msg: "Something went wrong" };
      }
    }
  }
}

const wasabi = new Wasabi();
export default wasabi;
