import {
  Client,
  Databases,
  Account,
  ID,
  Teams,
  Storage,
  Query,
} from "appwrite";
const client = new Client();

client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);
const database = new Databases(client);
const account = new Account(client);
const teams = new Teams(client);
const storage = new Storage(client);

export { client, database, account, ID, teams, storage, Query };

export async function publishPost({ title, description, image }) {
  try {
    if (!description) {
      throw new Error("All fields (description) are required.");
    }

    const response = await database.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID,
      ID.unique(),
      {
        title,
        description,
        image,
      }
    );
    return response;
  } catch (error) {
    console.error("Failed to publish post:", error);
    throw error;
  }
}

export async function uploadImage(file) {
  try {
    const response = await storage.createFile(
      process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID,
      ID.unique(),
      file
    );
    return response;
  } catch (error) {
    console.error("Failed to upload image:", error);
    throw error;
  }
}

export async function updateImage(oldfileId, newFile) {
  try {
    const bucketId = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID;

    if (oldfileId) {
      await storage.deleteFile(bucketId, oldfileId);
    }

    const uploadedFile = await storage.createFile(
      bucketId,
      ID.unique(),
      newFile
    );
    return uploadedFile.$id;
  } catch (error) {
    console.error("Failed to update image:", error);
    throw error;
  }
}

export async function deleteImage(imageId) {
  try {
    await storage.deleteFile(
      process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID,
      imageId
    );
  } catch (error) {
    console.error("Failed to delete image:", error);
    throw error;
  }
}
