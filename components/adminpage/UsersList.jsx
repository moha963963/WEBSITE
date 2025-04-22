import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { db } from "@/app/utils/database";
import { account } from "@/app/utils/appwrite";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function UsersList() {
  const [loading, setLoading] = useState(true);
  const [usersInfo, setUsersInfo] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ username: "", email: "" });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        const response = await db.users.list();
        setUsersInfo(response.documents);
      } catch (error) {
        console.error("Error fetching Users:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  const handleEdit = (user) => {
    setEditingId(user.$id);
    setEditForm({
      username: user.username || "",
      email: user.email || "",
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({ username: "", email: "" });
  };

  const handleSave = async (userId) => {
    try {
      setLoading(true);
      await db.users.update(userId, {
        username: editForm.username,
        email: editForm.email,
      });

      setUsersInfo(
        usersInfo.map((user) =>
          user.$id === userId
            ? { ...user, username: editForm.username, email: editForm.email }
            : user
        )
      );

      setEditingId(null);
    } catch (error) {
      console.error("Error updating user:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (userId) => {
    setUserToDelete(userId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    try {
      setLoading(true);

      // 1. First delete from Auth
      try {
        await account.delete(userToDelete);
      } catch (authError) {
        console.warn("Auth deletion error:", authError);
      }

      // 2. Then delete from Database
      await db.users.delete(userToDelete);

      // 3. Update local state
      setUsersInfo(usersInfo.filter((user) => user.$id !== userToDelete));
    } catch (error) {
      console.error("Error deleting user:", error);
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <div>
      <Table>
        <TableCaption>A list of registered users.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Username</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Created Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                Loading users...
              </TableCell>
            </TableRow>
          ) : usersInfo.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                No users found
              </TableCell>
            </TableRow>
          ) : (
            usersInfo.map((user) => (
              <TableRow key={user.$id}>
                <TableCell className="font-medium">
                  {editingId === user.$id ? (
                    <Input
                      value={editForm.username}
                      onChange={(e) =>
                        setEditForm({ ...editForm, username: e.target.value })
                      }
                    />
                  ) : (
                    user.username || "N/A"
                  )}
                </TableCell>
                <TableCell>
                  {editingId === user.$id ? (
                    <Input
                      value={editForm.email}
                      onChange={(e) =>
                        setEditForm({ ...editForm, email: e.target.value })
                      }
                    />
                  ) : (
                    user.email
                  )}
                </TableCell>
                <TableCell>
                  {new Date(user.$createdAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  {editingId === user.$id ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSave(user.$id)}
                        disabled={loading}
                      >
                        Save
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancelEdit}
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(user)}
                        disabled={loading}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteClick(user.$id)}
                        disabled={loading}
                      >
                        Delete
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              user account from both authentication and database systems.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
