/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useParams } from "react-router-dom";

interface EditTaskFormProps {
  task: any;
  onSubmit: (data: any) => void;
  onDelete: () => void;
  onCancel: () => void;
}

const EditTaskForm: React.FC<EditTaskFormProps> = ({
  task,
  onSubmit,
  onDelete,
  onCancel,
}) => {
  const { boardId } = useParams();
  const [title, setTitle] = useState(task.title || "");
  const [description, setDescription] = useState(task.description || "");
  const [priority, setPriority] = useState(task.priority || "medium");
  const [columnId, setColumnId] = useState(task.columnId || "");
  const [assignee, setAssignee] = useState(task.assignee?._id || "unassigned");
  const [users, setUsers] = useState<any[]>([]);
  const [columns, setColumns] = useState<any[]>([]);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [currentColumnId, setCurrentColumnId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
    fetchBoardColumns();
    findCurrentColumn();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/auth/users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchBoardColumns = async () => {
    try {
      // Get board ID from the URL
      const urlPath = window.location.pathname;
      const match = urlPath.match(/\/boards\/([a-zA-Z0-9]+)/);
      const currentBoardId = match && match[1] ? match[1] : boardId;

      if (!currentBoardId) {
        console.error("Could not determine board ID");
        return;
      }

      const response = await axios.get(
        `${API_URL}/api/board/${currentBoardId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data && response.data.columns) {
        // Sort columns by order
        const sortedColumns = [...response.data.columns].sort(
          (a, b) => a.order - b.order
        );
        setColumns(sortedColumns);

        // If columnId is not set, try to set it based on the task's status
        if (!columnId && task.status) {
          const matchingColumn = sortedColumns.find(
            (col) => col.name.toLowerCase() === task.status.toLowerCase()
          );
          if (matchingColumn) {
            setColumnId(matchingColumn._id);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching board columns:", error);
    }
  };

  const findCurrentColumn = async () => {
    try {
      // Get all columns and find which one contains this task
      const urlPath = window.location.pathname;
      const match = urlPath.match(/\/boards\/([a-zA-Z0-9]+)/);
      const currentBoardId = match && match[1] ? match[1] : boardId;

      if (!currentBoardId) {
        console.error("Could not determine board ID");
        return;
      }

      const response = await axios.get(
        `${API_URL}/api/board/${currentBoardId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data && response.data.columns) {
        for (const column of response.data.columns) {
          const hasTask = column.tasks.some((t: any) => {
            return typeof t === "object" ? t._id === task._id : t === task._id;
          });

          if (hasTask) {
            setCurrentColumnId(column._id);
            // If no column ID is set yet, set it to the current one
            if (!columnId) {
              setColumnId(column._id);
            }
            break;
          }
        }
      }
    } catch (error) {
      console.error("Error finding current column:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      return;
    }

    // Find the selected column to get its name
    const selectedColumn = columns.find((col) => col._id === columnId);
    const status = selectedColumn ? selectedColumn.name : "";

    // Check if the column has changed
    if (columnId !== currentColumnId && currentColumnId && columnId) {
      try {
        // Get current board ID
        const urlPath = window.location.pathname;
        const match = urlPath.match(/\/boards\/([a-zA-Z0-9]+)/);
        const currentBoardId = match && match[1] ? match[1] : boardId;

        if (!currentBoardId) {
          console.error("Could not determine board ID");
          return;
        }

        // Find the current index of the task in its column
        const currentColumnData = columns.find(
          (col) => col._id === currentColumnId
        );
        const sourceIndex = currentColumnData
          ? currentColumnData.tasks.findIndex((t: any) =>
              typeof t === "object" ? t._id === task._id : t === task._id
            )
          : 0;

        // Get the destination column's length for index
        const destColumnData = columns.find((col) => col._id === columnId);
        const destinationIndex = destColumnData
          ? destColumnData.tasks.length
          : 0;

        // Use the move-task endpoint to move the task to the new column
        await axios.post(
          `${API_URL}/api/column/${currentBoardId}/move-task`,
          {
            taskId: task._id,
            sourceColumnId: currentColumnId,
            destinationColumnId: columnId,
            sourceIndex: sourceIndex >= 0 ? sourceIndex : 0,
            destinationIndex: destinationIndex,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        console.log("Task moved successfully");
      } catch (error) {
        console.error("Error moving task:", error);
      }
    }

    // Update other task details
    const taskData = {
      title,
      description,
      priority,
      status,
      assignee: assignee === "unassigned" ? undefined : assignee,
    };

    onSubmit(taskData);
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the task..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="column">Status / Column</Label>
            <Select value={columnId} onValueChange={setColumnId}>
              <SelectTrigger>
                <SelectValue placeholder="Select column" />
              </SelectTrigger>
              <SelectContent>
                {columns.map((column) => (
                  <SelectItem key={column._id} value={column._id}>
                    {column.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignee">Assignee</Label>
            <Select value={assignee} onValueChange={setAssignee}>
              <SelectTrigger>
                <SelectValue placeholder="Unassigned" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user._id} value={user._id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-between mt-4">
          <Button
            type="button"
            variant="destructive"
            onClick={() => setShowDeleteAlert(true)}
          >
            Delete
          </Button>
          <div className="flex space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim()}>
              Save Changes
            </Button>
          </div>
        </div>
      </form>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              task.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EditTaskForm;
