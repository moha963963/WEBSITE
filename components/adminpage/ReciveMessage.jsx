import { db } from "@/app/utils/database";
import { useEffect, useState } from "react";

export default function ReciveMessage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMessages() {
      try {
        const response = await db.messages.list();
        setMessages(response.documents);
      } catch (error) {
        console.error("Error fetching Messages:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchMessages();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
        Recive Message
      </h2>
      {loading ? (
        <p className="text-center text-gray-600">Loading...</p>
      ) : messages.length ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {messages.map((message) => (
            <div
              key={message.$id}
              className="bg-white p-4 rounded-lg shadow-md"
            >
              <p className="text-lg font-semibold">{message.username}</p>
              <p className="text-gray-600">{message.email}</p>
              <p className="text-gray-800">{message.message}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-600">No messages found.</p>
      )}
    </div>
  );
}
