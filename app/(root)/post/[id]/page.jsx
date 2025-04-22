"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db, Query } from "@/app/utils/database";
import { Button } from "@/components/ui/button";
import { account } from "@/app/utils/appwrite";
import Link from "next/link";

const LOADING_LABEL = "Loading...";
const NOT_FOUND_LABEL = "Post not found.";
const COMMENT_LABEL = "Comments";
const SUMBMET_LABEL = "Submit";
const NOT_FOUND_COMMENNTS_LABEL = "No comments found. Be the first to comment!";

export default function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const userData = await account.get();
        setUser(userData);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    }
    fetchUser();
  }, []);

  useEffect(() => {
    async function fetchPost() {
      try {
        const response = await db.posts.get(id);
        setPost(response);
        fetchComments(response.$id);
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setLoading(false);
      }
    }

    async function fetchComments(postId) {
      try {
        const response = await db.comments.list([
          Query.equal("postId", postId),
          Query.orderDesc("$createdAt"),
        ]);
        setComments(response.documents || []);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    }

    fetchPost();
  }, [id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      if (db.comments) {
        const comment = await db.comments.create({
          postId: post.$id,
          userId: user.$id,
          userName: user.name || "Anonymous",
          content: newComment,
        });

        setComments((prevComments) => [...prevComments, comment]);
        setNewComment("");
      } else {
        console.error("Comments collection is not available");
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
    }
  };

  if (loading) {
    return <p className="text-center text-gray-600">{LOADING_LABEL}</p>;
  }

  if (!post) {
    return <p className="text-center text-gray-600">{NOT_FOUND_LABEL}</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-center text-gray-500 text-sm">
          Created at:{" "}
          {new Date(post.$createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </h1>
        <h2 className="text-5xl font-extrabold text-gray-900 mb-8 text-center">
          {post.title}
        </h2>

        <div className="mb-8">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-auto rounded-lg shadow-2xl object-cover"
          />
        </div>

        <div className="prose prose-lg text-gray-700 max-w-none">
          <p>{post.description}</p>
        </div>

        <div className="mt-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            {COMMENT_LABEL}
          </h3>

          {user ? (
            <form onSubmit={handleCommentSubmit} className="mb-8">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
              />
              <Button type="submit" className="mt-4">
                {SUMBMET_LABEL}
              </Button>
            </form>
          ) : (
            <p className="text-gray-600">
              Please <Link href="/login">log in</Link> to leave a comment.
            </p>
          )}

          <div className="space-y-4">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div
                  key={comment.$id}
                  className="bg-white p-4 rounded-lg shadow-sm"
                >
                  <p className="text-gray-700">{comment.content}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    By {comment.userName} on{" "}
                    {new Date(comment.$createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      clock: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-600">{NOT_FOUND_COMMENNTS_LABEL}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
