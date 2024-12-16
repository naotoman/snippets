import {
  S3Client,
  ListObjectsV2Command,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ID,
    secretAccessKey: process.env.R2_SECRET,
  },
});

const deleteObjectsByPrefix = async (bucketName, prefix) => {
  let cnt = 0;
  try {
    // 1. 指定したプレフィックスのオブジェクトをリストする
    let continuationToken = null;
    do {
      const listCommand = new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      });

      const listResponse = await s3Client.send(listCommand);
      const objects = listResponse.Contents;
      cnt += 1;
      console.log(`${cnt}/408`);

      if (objects && objects.length > 0) {
        // 2. オブジェクトを削除する
        const deleteCommand = new DeleteObjectsCommand({
          Bucket: bucketName,
          Delete: {
            Objects: objects.map((object) => ({ Key: object.Key })),
            Quiet: true,
          },
        });

        const deleteResponse = await s3Client.send(deleteCommand);
        // console.log("Deleted objects:", deleteResponse.Deleted);
      }

      continuationToken = listResponse.NextContinuationToken;
    } while (continuationToken);
    console.log(cnt);
    console.log("All objects with the prefix have been deleted.");
  } catch (err) {
    console.error("Error deleting objects:", err);
  }
};

// 使用例
const bucketName = process.env.R2_BUCKET; // バケット名を指定
const prefix = "sku-pics/"; // 削除対象のプレフィックスを指定

deleteObjectsByPrefix(bucketName, prefix);
