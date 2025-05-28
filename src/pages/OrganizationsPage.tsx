/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Plus, Users, ChevronRight, Briefcase } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
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
import { API_URL } from "@/lib/constants";

const OrganizationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [organizations, setOrganizations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateOrg, setShowCreateOrg] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/api/organization`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setOrganizations(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching organizations:", error);
      setIsLoading(false);
    }
  };

  const handleCreateOrganization = async () => {
    if (!newOrgName.trim()) return;

    try {
      const response = await axios.post(
        `${API_URL}/api/organization`,
        { name: newOrgName },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setOrganizations([...organizations, response.data]);
      setNewOrgName("");
      setShowCreateOrg(false);
    } catch (error) {
      console.error("Error creating organization:", error);
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
      <header className="bg-white shadow-sm border-b">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Organizations</h1>
          <Button onClick={() => setShowCreateOrg(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Create Organization
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {organizations.length === 0 ? (
          <div className="bg-white shadow-sm rounded-lg p-8 text-center">
            <Briefcase className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h2 className="text-lg font-medium mb-2">No organizations yet</h2>
            <p className="text-gray-500 mb-4">
              Create your first organization to get started with task
              management.
            </p>
            <Button onClick={() => setShowCreateOrg(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Create Organization
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {organizations.map((org) => (
              <Card key={org._id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle>{org.name}</CardTitle>
                  <CardDescription>
                    {org.members?.length || 0} Member
                    {org.members?.length !== 1 ? "s" : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-500 flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {org.boards?.length || 0} Board
                    {org.boards?.length !== 1 ? "s" : ""}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/organizations/${org._id}`)}
                  >
                    View Boards
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Create Organization Dialog */}
      <Dialog open={showCreateOrg} onOpenChange={setShowCreateOrg}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Organization</DialogTitle>
            <DialogDescription>
              Add a new organization to manage your projects and teams.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="orgName">Organization Name</Label>
              <Input
                id="orgName"
                placeholder="Enter organization name"
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              onClick={handleCreateOrganization}
              disabled={!newOrgName.trim()}
            >
              Create Organization
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrganizationsPage;
