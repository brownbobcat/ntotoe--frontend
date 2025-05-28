/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Plus,
  Users,
  ClipboardList,
  Clock,
  Search,
  Briefcase,
  ArrowUpCircle,
  CircleDot,
  CheckCircle,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { API_URL } from "@/lib/constants";

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [organizations, setOrganizations] = useState<any[]>([]);
  const [recentTasks, setRecentTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);

      // Fetch user's organizations
      const orgsResponse = await axios.get(`${API_URL}/api/organization`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setOrganizations(orgsResponse.data);

      // Fetch recent tasks
      const tasksResponse = await axios.get(`${API_URL}/api/tasks`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        params: {
          limit: 5,
          sort: "-updatedAt",
        },
      });
      setRecentTasks(tasksResponse.data);

      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setIsLoading(false);
    }
  };

  // Debounced search function
  const debouncedSearch = useCallback(
    (() => {
      let timer: NodeJS.Timeout | null = null;
      return (value: string) => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
          if (value.trim()) {
            handleSearch(value);
          } else {
            setSearchResults([]);
          }
        }, 500); // 500ms debounce delay
      };
    })(),
    []
  );

  // Update search query and trigger debounced search
  const updateSearchQuery = (value: string) => {
    setSearchQuery(value);
    debouncedSearch(value);
  };

  const handleSearch = async (query: string = searchQuery) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);

      const response = await axios.get(`${API_URL}/api/tasks/search`, {
        params: {
          query: query,
          // We don't filter by organizationId here to search across all organizations
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      // Process the results to add more context
      const processedResults = await Promise.all(
        response.data.map(async (task: any) => {
          // Add board name and organization name for context
          try {
            if (task.board) {
              const boardResponse = await axios.get(
                `${API_URL}/api/board/${task.board}`,
                {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
                }
              );

              return {
                ...task,
                boardName: boardResponse.data?.name || "Unknown Board",
                organizationName:
                  boardResponse.data?.organizationName ||
                  "Unknown Organization",
              };
            }
          } catch (error) {
            console.error("Error fetching board details:", error);
          }

          return task;
        })
      );

      setSearchResults(processedResults);
      setIsSearching(false);
    } catch (error) {
      console.error("Error searching tasks:", error);
      setIsSearching(false);
    }
  };

  // Handle pressing Enter in search input
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Task priority badge component
  const getPriorityBadge = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return (
          <div className="flex items-center text-red-600 text-xs font-medium">
            <ArrowUpCircle className="h-3 w-3 mr-1" />
            High
          </div>
        );
      case "medium":
        return (
          <div className="flex items-center text-orange-600 text-xs font-medium">
            <CircleDot className="h-3 w-3 mr-1" />
            Medium
          </div>
        );
      case "low":
        return (
          <div className="flex items-center text-blue-600 text-xs font-medium">
            <Clock className="h-3 w-3 mr-1" />
            Low
          </div>
        );
      default:
        return (
          <div className="flex items-center text-gray-600 text-xs font-medium">
            <CircleDot className="h-3 w-3 mr-1" />
            {priority}
          </div>
        );
    }
  };

  // Task status indicator component
  const getStatusIndicator = (status: string) => {
    switch (status.toLowerCase()) {
      case "done":
      case "completed":
        return (
          <div className="flex items-center text-green-600 text-xs font-medium">
            <CheckCircle className="h-3 w-3 mr-1" />
            Done
          </div>
        );
      case "in-progress":
      case "in progress":
        return (
          <div className="flex items-center text-blue-600 text-xs font-medium">
            <Clock className="h-3 w-3 mr-1" />
            In Progress
          </div>
        );
      case "review":
        return (
          <div className="flex items-center text-purple-600 text-xs font-medium">
            <CircleDot className="h-3 w-3 mr-1" />
            Review
          </div>
        );
      default:
        return (
          <div className="flex items-center text-gray-600 text-xs font-medium">
            <CircleDot className="h-3 w-3 mr-1" />
            {status}
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Project Manager</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
            <Button variant="outline" onClick={logout}>
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 w-full max-w-md">
            <div className="relative w-full">
              <Input
                placeholder="Search tasks across all boards..."
                value={searchQuery}
                onChange={(e) => updateSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="pr-8"
              />
              {searchQuery && (
                <button
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => updateSearchQuery("")}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSearch()}
              disabled={isSearching}
            >
              {isSearching ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-gray-600" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
          <Button onClick={() => navigate("/organizations")}>
            <Briefcase className="h-4 w-4 mr-1" />
            View Organizations
          </Button>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Search Results</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchResults([])}
              >
                Clear Results
              </Button>
            </div>
            <div className="space-y-2">
              {searchResults.map((task) => (
                <div
                  key={task._id}
                  className="p-4 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => navigate(`/boards/${task.board}`)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-base">{task.title}</div>
                      <div className="text-sm text-gray-700 mt-1">
                        {task.description && task.description.length > 100
                          ? `${task.description.substring(0, 100)}...`
                          : task.description}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        Board:{" "}
                        <span className="font-medium">
                          {task.boardName || "Unknown"}
                        </span>
                        {task.organizationName && (
                          <>
                            {" "}
                            • Organization:{" "}
                            <span className="font-medium">
                              {task.organizationName}
                            </span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        {getStatusIndicator(task.status)}
                        {getPriorityBadge(task.priority)}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {task.assignee && (
                        <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {typeof task.assignee === "object"
                            ? task.assignee.name
                            : task.assignee}
                        </div>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/boards/${task.board}`);
                        }}
                      >
                        View Board
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Tabs defaultValue="tasks">
          <TabsList className="mb-4">
            <TabsTrigger value="tasks">Recent Tasks</TabsTrigger>
            <TabsTrigger value="organizations">Your Organizations</TabsTrigger>
          </TabsList>

          {/* Recent Tasks Tab */}
          <TabsContent value="tasks">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium mb-4">Recent Tasks</h2>

              {recentTasks.length === 0 ? (
                <div className="text-center py-8">
                  <ClipboardList className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No tasks yet</h3>
                  <p className="text-gray-500 mb-4">
                    You haven't created any tasks yet. Start by creating a board
                    and adding tasks.
                  </p>
                  <Button onClick={() => navigate("/organizations")}>
                    <Plus className="h-4 w-4 mr-1" />
                    Create Board
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Assignee</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentTasks.map((task) => (
                      <TableRow key={task._id}>
                        <TableCell className="font-medium">
                          {task.title}
                        </TableCell>
                        <TableCell>{getStatusIndicator(task.status)}</TableCell>
                        <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                        <TableCell>
                          {task.assignee ? task.assignee.name : "Unassigned"}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/boards/${task.board}`)}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>

          {/* Organizations Tab */}
          <TabsContent value="organizations">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium">Your Organizations</h2>
                <Button
                  variant="outline"
                  onClick={() => navigate("/organizations")}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Create Organization
                </Button>
              </div>

              {organizations.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    No organizations yet
                  </h3>
                  <p className="text-gray-500 mb-4">
                    You haven't created any organizations yet. Create one to
                    start managing your boards and tasks.
                  </p>
                  <Button onClick={() => navigate("/organizations")}>
                    <Plus className="h-4 w-4 mr-1" />
                    Create Organization
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {organizations.map((org) => (
                    <Card
                      key={org._id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardHeader>
                        <CardTitle>{org.name}</CardTitle>
                        <CardDescription>
                          {org.members?.length || 0} Member
                          {org.members?.length !== 1 ? "s" : ""}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm text-gray-500">
                          {org.boards?.length || 0} Board
                          {org.boards?.length !== 1 ? "s" : ""}
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button
                          variant="outline"
                          onClick={() => navigate(`/organizations/${org._id}`)}
                          className="w-full"
                        >
                          View Boards
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default HomePage;
