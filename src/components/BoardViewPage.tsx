/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import CreateTaskForm from "@/components/CreateTaskForm";
import EditTaskForm from "@/components/EditTaskForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { API_URL } from "@/lib/constants";
import axios from "axios";
import { Filter, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import { useParams } from "react-router-dom";
import CreateColumnForm from "./CreateColumnForm";
import TaskColumn from "./TaskColumn";

const BoardViewPage = () => {
  const { boardId } = useParams();

  const [board, setBoard] = useState<any>(null);
  const [columns, setColumns] = useState<any[]>([]);
  const [filteredColumns, setFilteredColumns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [, setIsSilentLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showCreateColumn, setShowCreateColumn] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);

  // Filter states
  const [priorityFilters, setPriorityFilters] = useState<string[]>([]);
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [assigneeFilters, setAssigneeFilters] = useState<string[]>([]);

  // Available filter options based on current board data
  const [availablePriorities, setAvailablePriorities] = useState<string[]>([]);
  const [availableStatuses, setAvailableStatuses] = useState<string[]>([]);
  const [availableAssignees, setAvailableAssignees] = useState<any[]>([]);
  const [isFiltersActive, setIsFiltersActive] = useState(false);

  // Memoize fetchBoard to avoid unnecessary rerenders
  const fetchBoard = useCallback(
    async (silent = false) => {
      try {
        if (!silent) {
          setIsLoading(true);
        } else {
          setIsSilentLoading(true);
        }

        const response = await axios.get(`${API_URL}/api/board/${boardId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        setBoard(response.data);

        // Sort columns by order
        const sortedColumns = [...response.data.columns].sort(
          (a, b) => a.order - b.order
        );

        // Ensure all task IDs are strings and tasks have necessary properties
        const processedColumns = sortedColumns.map((column) => {
          if (column.tasks && Array.isArray(column.tasks)) {
            return {
              ...column,
              tasks: column.tasks.map((task: any) => {
                // If task is already a complete object, make sure its ID is a string
                if (typeof task === "object" && task !== null) {
                  return {
                    ...task,
                    _id: String(task._id),
                    status: task.status || column.name, // Ensure status is set
                  };
                }
                // If task is just an ID, convert it to string
                else {
                  return {
                    _id: String(task),
                    title: "Loading...",
                    status: column.name,
                    priority: "Medium",
                  };
                }
              }),
            };
          }
          return {
            ...column,
            tasks: [],
          };
        });

        setColumns(processedColumns);
        setFilteredColumns(processedColumns);

        // Extract available filter options
        extractFilterOptions(processedColumns);

        if (!silent) {
          setIsLoading(false);
        } else {
          setIsSilentLoading(false);
        }
      } catch (error) {
        console.error("Error fetching board:", error);
        if (!silent) {
          setIsLoading(false);
        } else {
          setIsSilentLoading(false);
        }
      }
    },
    [boardId]
  );

  useEffect(() => {
    fetchBoard();
  }, [fetchBoard]);

  // Extract filter options from columns
  // Extract filter options from columns with proper case handling
  const extractFilterOptions = (columnsData: any[]) => {
    const priorityMap = new Map<string, string>(); // Map to store normalized priority names
    const statusesMap = new Map<string, string>(); // Map to store normalized status names
    const assignees = new Map();

    // Define standard display formats for priorities
    const normalizePriority = (priority: string): string => {
      const lowerPriority = priority.toLowerCase();
      switch (lowerPriority) {
        case "high":
          return "High";
        case "medium":
          return "Medium";
        case "low":
          return "Low";
        default:
          return priority; // Keep original if unknown
      }
    };

    // Define status normalizations to avoid duplicates
    const normalizeStatus = (status: string): string => {
      // Convert to lowercase for comparison
      const lowerStatus = status.toLowerCase();

      // Common status name mappings
      const statusMappings: { [key: string]: string } = {
        todo: "To Do",
        "to do": "To Do",
        "in progress": "In Progress",
        "in-progress": "In Progress",
        review: "Review",
        done: "Done",
        completed: "Done",
      };

      // Return the mapped value or the original with first letter capitalized
      return (
        statusMappings[lowerStatus] ||
        status.charAt(0).toUpperCase() + status.slice(1)
      );
    };

    columnsData.forEach((column) => {
      // Add column name as a status (normalized)
      const normalizedColumnName = normalizeStatus(column.name);
      statusesMap.set(normalizedColumnName.toLowerCase(), normalizedColumnName);

      if (column.tasks && Array.isArray(column.tasks)) {
        column.tasks.forEach((task: any) => {
          // Add priority with proper casing
          if (task.priority) {
            const normalizedPriority = normalizePriority(task.priority);
            priorityMap.set(
              normalizedPriority.toLowerCase(),
              normalizedPriority
            );
          }

          // Add status if not already from column name
          if (task.status) {
            const normalizedStatus = normalizeStatus(task.status);
            statusesMap.set(normalizedStatus.toLowerCase(), normalizedStatus);
          }

          // Add assignee
          if (task.assignee) {
            const assigneeId =
              typeof task.assignee === "object"
                ? task.assignee._id
                : task.assignee;
            const assigneeName =
              typeof task.assignee === "object"
                ? task.assignee.name
                : "Unknown";

            if (assigneeId && !assignees.has(assigneeId)) {
              assignees.set(assigneeId, assigneeName);
            }
          }
        });
      }
    });

    // Get the standard display values
    setAvailablePriorities(Array.from(priorityMap.values()));
    setAvailableStatuses(Array.from(statusesMap.values()));
    setAvailableAssignees(
      Array.from(assignees.entries()).map(([id, name]) => ({ _id: id, name }))
    );

    // Debug log
    console.log("Available priorities:", Array.from(priorityMap.values()));
  };

  // Apply filters and search to columns
  // Apply filters and search to columns
  const applyFiltersAndSearch = useCallback(() => {
    // Start with original columns
    let result = [...columns];

    // This handles mapping between display status names and actual task status values
    const normalizeStatus = (status: string): string[] => {
      // Convert to lowercase for comparison
      const lowerStatus = status.toLowerCase();

      // Create an array of possible matching values
      const mappings: { [key: string]: string[] } = {
        "to do": ["todo", "to do"],
        "in progress": ["in-progress", "in progress"],
        review: ["review"],
        done: ["done", "completed"],
      };

      // Return array of possible values that match this status
      return mappings[lowerStatus] || [lowerStatus];
    };

    // Convert selected status filters to all possible matching values
    const expandedStatusFilters = statusFilters.flatMap(normalizeStatus);

    // Debug log to check values
    console.log("Priority filters:", priorityFilters);

    // Filter tasks in each column
    result = result.map((column) => {
      // Filter tasks based on search query and filters
      const filteredTasks = column.tasks.filter((task: any) => {
        // Convert task priority to lowercase for case-insensitive comparison
        const taskPriority = task.priority?.toLowerCase() || "";

        // Check search query
        const matchesSearch =
          !searchQuery ||
          task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description?.toLowerCase().includes(searchQuery.toLowerCase());

        // Check priority filter - make case-insensitive comparison
        const matchesPriority =
          priorityFilters.length === 0 ||
          priorityFilters.some((p) => p.toLowerCase() === taskPriority);

        // Check status filter
        const matchesStatus =
          statusFilters.length === 0 ||
          expandedStatusFilters.includes(task.status?.toLowerCase()) ||
          statusFilters.some(
            (s) => s.toLowerCase() === column.name.toLowerCase()
          );

        // Check assignee filter
        const matchesAssignee =
          assigneeFilters.length === 0 ||
          (task.assignee &&
            assigneeFilters.includes(
              typeof task.assignee === "object"
                ? task.assignee._id
                : task.assignee
            ));

        // Debug log for non-matching priority tasks
        if (!matchesPriority && priorityFilters.length > 0) {
          console.log(
            "Task priority doesn't match:",
            task.title,
            taskPriority,
            "Filters:",
            priorityFilters
          );
        }

        return (
          matchesSearch && matchesPriority && matchesStatus && matchesAssignee
        );
      });

      // Return column with filtered tasks
      return {
        ...column,
        filteredTasks,
        hasMatchingTasks: filteredTasks.length > 0,
      };
    });

    setFilteredColumns(result);

    // Check if any filters are active
    setIsFiltersActive(
      searchQuery !== "" ||
        priorityFilters.length > 0 ||
        statusFilters.length > 0 ||
        assigneeFilters.length > 0
    );
  }, [columns, searchQuery, priorityFilters, statusFilters, assigneeFilters]);

  // Apply filters whenever filter criteria change
  useEffect(() => {
    applyFiltersAndSearch();
  }, [
    columns,
    searchQuery,
    priorityFilters,
    statusFilters,
    assigneeFilters,
    applyFiltersAndSearch,
  ]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Toggle priority filter
  // Toggle priority filter - updated to ensure case consistency
  const togglePriorityFilter = (priority: string) => {
    // Lowercase the priority for consistent comparison
    const lowerPriority = priority.toLowerCase();

    setPriorityFilters((prev) => {
      // Check if this priority (case-insensitive) is already in the filters
      const exists = prev.some((p) => p.toLowerCase() === lowerPriority);

      if (exists) {
        // Remove all variations of this priority
        return prev.filter((p) => p.toLowerCase() !== lowerPriority);
      } else {
        // Add the priority in its original form
        return [...prev, priority];
      }
    });
  };

  // Toggle status filter
  const toggleStatusFilter = (status: string) => {
    setStatusFilters((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  // Toggle assignee filter
  const toggleAssigneeFilter = (assigneeId: string) => {
    setAssigneeFilters((prev) =>
      prev.includes(assigneeId)
        ? prev.filter((a) => a !== assigneeId)
        : [...prev, assigneeId]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setPriorityFilters([]);
    setStatusFilters([]);
    setAssigneeFilters([]);
  };

  const handleDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result;

    // Dropped outside the list
    if (!destination) {
      return;
    }

    // Dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Optimistically update UI first before API call
    const updatedColumns = [...columns];

    // Find source and destination columns
    const sourceColumn = updatedColumns.find(
      (col) => col._id === source.droppableId
    );
    const destColumn = updatedColumns.find(
      (col) => col._id === destination.droppableId
    );

    if (sourceColumn && destColumn) {
      // Find the task in the original tasks array
      const taskIndex = sourceColumn.tasks.findIndex(
        (t: any) => t._id === draggableId
      );
      if (taskIndex === -1) return; // Task not found

      // Get the task
      const task = { ...sourceColumn.tasks[taskIndex] };

      // Update task status to match destination column
      task.status = destColumn.name;

      // Remove task from source column
      sourceColumn.tasks.splice(taskIndex, 1);

      // Add task to destination column
      destColumn.tasks.push(task);

      // Update state immediately for smooth UI
      setColumns(updatedColumns);

      // Apply filters to updated columns
      applyFiltersAndSearch();
    }

    // Now make the API call in the background
    try {
      await axios.post(
        `${API_URL}/api/column/${boardId}/move-task`,
        {
          taskId: draggableId,
          sourceColumnId: source.droppableId,
          destinationColumnId: destination.droppableId,
          sourceIndex: source.index,
          destinationIndex: destination.index,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Silently refresh in background to ensure data consistency
      // This won't cause flickering because we're not showing a loading state
      setTimeout(() => {
        fetchBoard(true);
      }, 300);
    } catch (error) {
      console.error("Error moving task:", error);
      // Only do a full refresh if the operation failed
      fetchBoard();
    }
  };

  const handleCreateColumn = async (columnData: any) => {
    try {
      // Create the column
      const response = await axios.post(
        `${API_URL}/api/column/${boardId}`,
        columnData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Optimistically update UI
      const newColumn = response.data;
      newColumn.tasks = []; // Ensure tasks array exists
      newColumn.filteredTasks = []; // Add filtered tasks array for consistency

      // Add the new column to the UI
      const updatedColumns = [...columns, newColumn];
      setColumns(updatedColumns);

      // Add the status to available statuses
      if (!availableStatuses.includes(newColumn.name)) {
        setAvailableStatuses([...availableStatuses, newColumn.name]);
      }

      // Apply filters to updated columns
      applyFiltersAndSearch();

      setShowCreateColumn(false);

      // Silently refresh in background to ensure data consistency
      setTimeout(() => {
        fetchBoard(true);
      }, 300);
    } catch (error) {
      console.error("Error creating column:", error);
      fetchBoard();
    }
  };

  const handleCreateTask = async (taskData: any) => {
    try {
      // Create the task
      const response = await axios.post(`${API_URL}/api/tasks`, taskData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      // Find the column to add the task to
      const columnToUpdate = columns.find(
        (col) => col._id === taskData.columnId
      );

      if (columnToUpdate && response.data) {
        // Optimistically update UI
        const updatedColumns = [...columns];
        const colIndex = updatedColumns.findIndex(
          (col) => col._id === taskData.columnId
        );

        if (colIndex !== -1) {
          // Add the new task to the column
          const newTask = {
            ...response.data,
            _id: String(response.data._id),
          };

          updatedColumns[colIndex].tasks.push(newTask);

          // Update state
          setColumns(updatedColumns);

          // Update filter options
          extractFilterOptions(updatedColumns);

          // Apply filters to updated columns
          applyFiltersAndSearch();
        }
      }

      setShowCreateTask(false);
      setActiveColumnId(null);

      // Silently refresh in background
      setTimeout(() => {
        fetchBoard(true);
      }, 300);
    } catch (error) {
      console.error("Error creating task:", error);
      fetchBoard();
    }
  };

  const handleUpdateTask = async (taskData: any) => {
    if (!selectedTask) return;

    try {
      // Optimistically update UI first
      const updatedColumns = [...columns];
      const taskId = selectedTask._id;

      // Find the task in all columns and update it
      let foundAndUpdated = false;

      for (const column of updatedColumns) {
        const taskIndex = column.tasks.findIndex((t: any) => t._id === taskId);

        if (taskIndex !== -1) {
          // Update the task in place
          column.tasks[taskIndex] = {
            ...column.tasks[taskIndex],
            ...taskData,
          };
          foundAndUpdated = true;
          break;
        }
      }

      if (foundAndUpdated) {
        setColumns(updatedColumns);

        // Update filter options
        extractFilterOptions(updatedColumns);

        // Apply filters to updated columns
        applyFiltersAndSearch();
      }

      // Make the API call in the background
      await axios.put(`${API_URL}/api/tasks/${selectedTask._id}`, taskData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setSelectedTask(null);

      // Silently refresh in background
      setTimeout(() => {
        fetchBoard(true);
      }, 300);
    } catch (error) {
      console.error("Error updating task:", error);
      fetchBoard();
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      // Optimistically update UI first
      const updatedColumns = columns.map((column) => ({
        ...column,
        tasks: column.tasks.filter((task: any) => task._id !== taskId),
      }));

      setColumns(updatedColumns);

      // Update filter options
      extractFilterOptions(updatedColumns);

      // Apply filters to updated columns
      applyFiltersAndSearch();

      // Make the API call in the background
      await axios.delete(`${API_URL}/api/tasks/${taskId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setSelectedTask(null);

      // Silently refresh in background
      setTimeout(() => {
        fetchBoard(true);
      }, 300);
    } catch (error) {
      console.error("Error deleting task:", error);
      fetchBoard();
    }
  };

  const handleDeleteColumn = async (columnId: string) => {
    try {
      // Optimistically update UI first
      const updatedColumns = columns.filter(
        (column) => column._id !== columnId
      );
      setColumns(updatedColumns);

      // Update filter options
      extractFilterOptions(updatedColumns);

      // Apply filters to updated columns
      applyFiltersAndSearch();

      // Make the API call in the background
      await axios.delete(`${API_URL}/api/column/${boardId}/${columnId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      // Silently refresh in background
      setTimeout(() => {
        fetchBoard(true);
      }, 300);
    } catch (error) {
      console.error("Error deleting column:", error);
      fetchBoard();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  if (!board) {
    return (
      <div className="flex items-center justify-center h-screen">
        Board not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">{board.name}</h1>
          <div className="flex items-center gap-4">
            <div className="relative flex items-center gap-2">
              <Input
                placeholder="Filter tasks..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-64 pr-8"
              />
              {searchQuery && (
                <button
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-4 w-4" />
                </button>
              )}

              {/* Filters Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Filter className="h-4 w-4" />
                    Filters
                    {isFiltersActive && (
                      <Badge variant="secondary" className="ml-1 h-5 px-1">
                        {priorityFilters.length +
                          statusFilters.length +
                          assigneeFilters.length +
                          (searchQuery ? 1 : 0)}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Filter Tasks</DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  {/* Priority Filter */}
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-xs font-medium text-gray-500 pl-2">
                      Priority
                    </DropdownMenuLabel>
                    {availablePriorities.map((priority) => (
                      <DropdownMenuCheckboxItem
                        key={`priority-${priority}`}
                        checked={priorityFilters.includes(priority)}
                        onCheckedChange={() => togglePriorityFilter(priority)}
                      >
                        {priority}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuGroup>

                  <DropdownMenuSeparator />

                  {/* Status Filter */}
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-xs font-medium text-gray-500 pl-2">
                      Status
                    </DropdownMenuLabel>
                    {availableStatuses.map((status) => (
                      <DropdownMenuCheckboxItem
                        key={`status-${status}`}
                        checked={statusFilters.includes(status)}
                        onCheckedChange={() => toggleStatusFilter(status)}
                      >
                        {status}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuGroup>

                  <DropdownMenuSeparator />

                  {/* Assignee Filter */}
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-xs font-medium text-gray-500 pl-2">
                      Assignee
                    </DropdownMenuLabel>
                    {availableAssignees.map((assignee) => (
                      <DropdownMenuCheckboxItem
                        key={`assignee-${assignee._id}`}
                        checked={assigneeFilters.includes(assignee._id)}
                        onCheckedChange={() =>
                          toggleAssigneeFilter(assignee._id)
                        }
                      >
                        {assignee.name}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuGroup>

                  <DropdownMenuSeparator />

                  {/* Clear Filters */}
                  <DropdownMenuItem
                    className="justify-center text-center font-medium text-red-600"
                    onClick={clearFilters}
                  >
                    Clear All Filters
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <Button
              onClick={() => setShowCreateColumn(true)}
              variant="outline"
              size="sm"
            >
              Add Column
            </Button>
          </div>
        </div>
      </header>

      {/* Active Filters Display */}
      {isFiltersActive && (
        <div className="bg-gray-50 border-b py-2">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center flex-wrap gap-2">
            <span className="text-sm font-medium text-gray-700">
              Active filters:
            </span>

            {/* Search filter */}
            {searchQuery && (
              <Badge variant="secondary" className="gap-1 pl-2">
                Search:{" "}
                {searchQuery.length > 15
                  ? `${searchQuery.substring(0, 15)}...`
                  : searchQuery}
                <button
                  className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {/* Priority filters */}
            {priorityFilters.map((priority) => (
              <Badge
                key={`filter-${priority}`}
                variant="secondary"
                className="gap-1 pl-2"
              >
                Priority: {priority}
                <button
                  className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                  onClick={() => togglePriorityFilter(priority)}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}

            {/* Status filters */}
            {statusFilters.map((status) => (
              <Badge
                key={`filter-${status}`}
                variant="secondary"
                className="gap-1 pl-2"
              >
                Status: {status}
                <button
                  className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                  onClick={() => toggleStatusFilter(status)}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}

            {/* Assignee filters */}
            {assigneeFilters.map((assigneeId) => {
              const assignee = availableAssignees.find(
                (a) => a._id === assigneeId
              );
              return (
                <Badge
                  key={`filter-${assigneeId}`}
                  variant="secondary"
                  className="gap-1 pl-2"
                >
                  Assignee: {assignee ? assignee.name : "Unknown"}
                  <button
                    className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                    onClick={() => toggleAssigneeFilter(assigneeId)}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              );
            })}

            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-gray-500 hover:text-gray-800"
              onClick={clearFilters}
            >
              Clear All
            </Button>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex space-x-4 overflow-x-auto pb-4">
            {filteredColumns.map((column) => (
              <TaskColumn
                key={column._id}
                column={{
                  ...column,
                  tasks: isFiltersActive ? column.filteredTasks : column.tasks,
                }}
                onAddTask={() => {
                  setActiveColumnId(column._id);
                  setShowCreateTask(true);
                }}
                onEditTask={(task) => setSelectedTask(task)}
                onDeleteColumn={() => handleDeleteColumn(column._id)}
                isFiltered={isFiltersActive}
              />
            ))}
          </div>
        </DragDropContext>
      </main>

      {/* Create Task Dialog */}
      <Dialog open={showCreateTask} onOpenChange={setShowCreateTask}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>Add a new task to your board.</DialogDescription>
          </DialogHeader>
          <CreateTaskForm
            onSubmit={handleCreateTask}
            onCancel={() => setShowCreateTask(false)}
            organizationId={board?.organizationId}
            columnId={activeColumnId}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog
        open={!!selectedTask}
        onOpenChange={(open) => !open && setSelectedTask(null)}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Update task details or change its status.
            </DialogDescription>
          </DialogHeader>
          {selectedTask && (
            <EditTaskForm
              task={{ ...selectedTask, _id: String(selectedTask._id) }}
              onSubmit={handleUpdateTask}
              onDelete={() => handleDeleteTask(selectedTask._id)}
              onCancel={() => setSelectedTask(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Create Column Dialog */}
      <Dialog open={showCreateColumn} onOpenChange={setShowCreateColumn}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Column</DialogTitle>
            <DialogDescription>
              Add a new column to your board.
            </DialogDescription>
          </DialogHeader>
          <CreateColumnForm
            onSubmit={handleCreateColumn}
            onCancel={() => setShowCreateColumn(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BoardViewPage;
