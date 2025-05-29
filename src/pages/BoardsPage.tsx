/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Plus, Settings, ChevronRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { API_URL } from "@/lib/constants";

const BoardsPage: React.FC = () => {
  const navigate = useNavigate();
  const { organizationId } = useParams();
  //   const { user } = useAuth();

  const [boards, setBoards] = useState<any[]>([]);
  const [organization, setOrganization] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateBoard, setShowCreateBoard] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  const [boardToDelete, setBoardToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (organizationId) {
      fetchOrganizationAndBoards();
    }
  }, [organizationId]);

  const fetchOrganizationAndBoards = async () => {
    try {
      setIsLoading(true);

      // Fetch organization details
      const orgResponse = await axios.get(
        `${API_URL}/api/organization/${organizationId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setOrganization(orgResponse.data);

      // Fetch boards for this organization
      const boardsResponse = await axios.get(
        `${API_URL}/api/board/organization/${organizationId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setBoards(boardsResponse.data);

      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setIsLoading(false);
    }
  };

  const handleCreateBoard = async () => {
    if (!newBoardName.trim()) return;

    try {
      const response = await axios.post(
        `${API_URL}/api/board`,
        {
          name: newBoardName,
          organizationId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setBoards([...boards, response.data]);
      setNewBoardName("");
      setShowCreateBoard(false);
    } catch (error) {
      console.error("Error creating board:", error);
    }
  };

  const handleDeleteBoard = async () => {
    if (!boardToDelete) return;

    try {
      await axios.delete(`${API_URL}/api/board/${boardToDelete}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setBoards(boards.filter((board) => board._id !== boardToDelete));
      setBoardToDelete(null);
    } catch (error) {
      console.error("Error deleting board:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="flex items-center justify-center h-screen">
        Organization not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {organization.name}
            </h1>
            <p className="text-sm text-gray-500">
              {organization.members?.length} Member
              {organization.members?.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                navigate(`/organizations/${organizationId}/settings`)
              }
            >
              <Settings className="h-4 w-4 mr-1" />
              Organization Settings
            </Button>
            <Button onClick={() => setShowCreateBoard(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Create Board
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <h2 className="text-lg font-medium mb-4">Boards</h2>

        {boards.length === 0 ? (
          <div className="bg-white shadow-sm rounded-lg p-8 text-center">
            <h3 className="text-lg font-medium mb-2">No boards yet</h3>
            <p className="text-gray-500 mb-4">
              Create your first board to get started with task management.
            </p>
            <Button onClick={() => setShowCreateBoard(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Create Board
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {boards.map((board) => (
              <Card
                key={board._id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{board.name}</CardTitle>
                  <CardDescription>
                    {board.columns?.length || 0} Column
                    {board.columns?.length !== 1 ? "s" : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-sm text-gray-500">
                    Created {new Date(board.createdAt).toLocaleDateString()}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => setBoardToDelete(board._id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/boards/${board._id}`)}
                  >
                    View Board
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Create Board Dialog */}
      <Dialog open={showCreateBoard} onOpenChange={setShowCreateBoard}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Board</DialogTitle>
            <DialogDescription>
              Add a new board to your organization.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="boardName">Board Name</Label>
              <Input
                id="boardName"
                placeholder="Enter board name"
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              onClick={handleCreateBoard}
              disabled={!newBoardName.trim()}
            >
              Create Board
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Board Alert */}
      <AlertDialog
        open={!!boardToDelete}
        onOpenChange={(open) => !open && setBoardToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              board and all tasks within it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBoard}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BoardsPage;
