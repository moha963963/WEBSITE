"use client";
import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { db } from "@/app/utils/database";
import { account, ID, teams } from "@/app/utils/appwrite";
import Link from "next/link";

const EDIT_LABEL = "Edit";
const NOT_FOUND_LABEL = "No posts found.";
const LODING_LABEL = "Loading...";

export default function Cards() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await db.posts.list();
        setPosts(response.documents);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  useEffect(() => {
    async function checkAdmin() {
      try {
        const user = await account.get();
        const userTeams = await teams.list();

        if (userTeams.teams.some((team) => team.name === "admins")) {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
      }
    }

    checkAdmin();
  }, []);

  if (loading) {
    return <p className="text-center text-gray-600">{LODING_LABEL}</p>;
  }

  return (
    <div className="flex flex-wrap gap-4 justify-start">
      {posts.length > 0 ? (
        posts.map((post) => (
          <Card key={post.$id} className="w-80 shadow-lg rounded-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-xl font-bold">{post.title}</CardTitle>
            </CardHeader>
            <Link href={`/post/${post.$id}`}>
              <CardContent className="flex justify-center">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-40 h-40 object-cover rounded-lg"
                />
              </CardContent>

              <CardContent>
                <CardDescription className="text-center text-gray-600">
                  {post.description}
                </CardDescription>
              </CardContent>
            </Link>
            {isAdmin && (
              <CardContent>
                <Button>
                  <Link href={`/posts/${post.$id}`}>{EDIT_LABEL}</Link>
                </Button>
              </CardContent>
            )}
          </Card>
        ))
      ) : (
        <p className="text-center col-span-3 text-gray-600">
          {NOT_FOUND_LABEL}
        </p>
      )}
    </div>
  );
}
