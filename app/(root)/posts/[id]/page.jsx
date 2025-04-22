"use client";
import { useEffect, useState } from "react";
import { uploadImage, deleteImage } from "@/app/utils/appwrite";
import { db } from "@/app/utils/database";
import { Button } from "@/components/ui/button";
import { useRouter, useParams } from "next/navigation";

const UPDATE_LABEL = "Update";
const DELETE_LABEL = "Delete";
const TITLE_LABEL = "Title";
const MEDIA_LABEL = "Media";
const DESCRIPTION_LABEL = "Description";
const UPLOAD_PROMPT = "Click to upload an image";
const UPLOAD_HINT = "PNG, JPG up to 10MB";
const PLACEHOLDER_TITLE = "Enter post title...";
const PLACEHOLDER_DESCRIPTION = "Write your post content...";
const PAGE_TITLE = "Edit Post";

export default function EditPost() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [post, setPost] = useState(null);
  const [imageId, setImageId] = useState(null);
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    if (!params || !params.id) return;

    db.posts.get(params.id).then((fetchedPost) => {
      if (fetchedPost) {
        setTitle(fetchedPost.title);
        setDescription(fetchedPost.description);
        setPreview(fetchedPost.image);
        setPost(fetchedPost);
        if (fetchedPost.image) {
          setImageId(extractImageId(fetchedPost.image));
        }
      }
    });
  }, []);

  function extractImageId(url) {
    const parts = url.split("/");
    return parts[parts.length - 2];
  }

  async function handleFileInput(e) {
    const file = e.target.files[0];
    setImage(file);
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  }

  async function handleUpdate(e) {
    e.preventDefault();
    try {
      const updates = { title, description };

      if (image) {
        const uploadResponse = await uploadImage(image);
        if (!uploadResponse || !uploadResponse.$id) {
          throw new Error("Image upload failed");
        }
        const imageUrl = `https://cloud.appwrite.io/v1/storage/buckets/67c473c5000b71ec23e0/files/${uploadResponse.$id}/view?project=67b9cb2500144405cbac&mode=admin`;
        updates.image = imageUrl;

        if (imageId) {
          await deleteImage(imageId);
        }
      }

      await db.posts.update(params.id, updates);
      alert("Post updated successfully");
      router.push("/admin");
    } catch (error) {
      console.error("Error updating post:", error);
      alert("Failed to update post. Please try again.");
    }
  }

  async function handleDelete() {
    try {
      if (imageId) {
        await deleteImage(imageId);
      }
      await db.posts.delete(params.id);
      alert("Post deleted successfully");
      router.push(`/admin`);
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <form className="w-full max-w-2xl bg-white rounded-xl shadow-2xl p-8 space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">
          {PAGE_TITLE}
        </h1>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            {TITLE_LABEL}
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500"
            placeholder={PLACEHOLDER_TITLE}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            {MEDIA_LABEL}
          </label>
          <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-xl cursor-pointer">
            <input
              type="file"
              onChange={handleFileInput}
              className="hidden"
              id="image-upload"
              accept="image/*"
            />
            <label
              htmlFor="image-upload"
              className="cursor-pointer w-full h-full"
            >
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-fill rounded-lg"
                />
              ) : (
                <div className="text-center p-4 w-full h-full flex items-center justify-center">
                  <p className="text-gray-500 text-sm">{UPLOAD_PROMPT}</p>
                  <p className="text-gray-400 text-xs mt-2">{UPLOAD_HINT}</p>
                </div>
              )}
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            {DESCRIPTION_LABEL}
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="4"
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500"
            placeholder={PLACEHOLDER_DESCRIPTION}
            required
          />
        </div>

        <Button
          type="button"
          onClick={handleUpdate}
          className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-600"
        >
          {UPDATE_LABEL}
        </Button>
        <Button
          type="button"
          onClick={handleDelete}
          className="w-full py-3.5 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600"
        >
          {DELETE_LABEL}
        </Button>
      </form>
    </div>
  );
}
