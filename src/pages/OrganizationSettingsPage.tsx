/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Mail, UserPlus, Trash2, Save } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { toast } from "sonner";
import { API_URL } from "@/lib/constants";

const OrganizationSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { organizationId } = useParams();
  const { user } = useAuth();

  const [organization, setOrganization] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [organizationName, setOrganizationName] = useState("");
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);
  const [showDeleteOrg, setShowDeleteOrg] = useState(false);

  useEffect(() => {
    if (organizationId) {
      fetchOrganizationAndMembers();
    }
  }, [organizationId]);

  const fetchOrganizationAndMembers = async () => {
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
      setOrganizationName(orgResponse.data.name);

      // Fetch members
      const membersResponse = await axios.get(
        `${API_URL}/api/organization/${organizationId}/members`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setMembers(membersResponse.data);

      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setIsLoading(false);
    }
  };

  const handleUpdateOrganization = async () => {
    if (!organizationName.trim()) return;

    try {
      const response = await axios.put(
        `${API_URL}/api/organization/${organizationId}`,
        { name: organizationName },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setOrganization(response.data);
      toast("Your changes have been saved successfully.");
    } catch (error) {
      console.error("Error updating organization:", error);
      toast("There was a problem updating the organization.");
    }
  };

  const handleAddMember = async () => {
    if (!newMemberEmail.trim()) return;

    try {
      const response = await axios.post(
        `${API_URL}/api/organization/${organizationId}/members`,
        { email: newMemberEmail },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setOrganization(response.data);
      setMembers(response.data.members);
      setNewMemberEmail("");
      setShowAddMember(false);
      toast("The user has been added to your organization.");
    } catch (error: any) {
      console.error("Error adding member:", error);
      toast(
        error.response?.data?.message ||
          "There was a problem adding the member."
      );
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;

    try {
      await axios.delete(
        `${API_URL}/api/organization/${organizationId}/members/${memberToRemove}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setMembers(members.filter((member) => member._id !== memberToRemove));
      setMemberToRemove(null);
      toast("The user has been removed from your organization.");
    } catch (error) {
      console.error("Error removing member:", error);
      toast("There was a problem removing the member.");
    }
  };

  const handleDeleteOrganization = async () => {
    try {
      await axios.delete(`${API_URL}/api/organization/${organizationId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      navigate("/organizations");
      toast("The organization has been permanently deleted.");
    } catch (error) {
      console.error("Error deleting organization:", error);
      toast("There was a problem deleting the organization.");
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
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/organizations/${organizationId}`)}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Boards
          </Button>
          <h1 className="text-xl font-bold text-gray-900">
            Organization Settings
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Tabs defaultValue="general">
          <TabsList className="mb-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="danger">Danger Zone</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
              <h2 className="text-lg font-medium">General Settings</h2>

              <div className="space-y-2">
                <Label htmlFor="orgName">Organization Name</Label>
                <Input
                  id="orgName"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                />
              </div>

              <div className="pt-2">
                <Button
                  onClick={handleUpdateOrganization}
                  disabled={
                    !organizationName.trim() ||
                    organizationName === organization.name
                  }
                >
                  <Save className="h-4 w-4 mr-1" />
                  Save Changes
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="members" className="space-y-4">
            <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium">Members</h2>
                <Button onClick={() => setShowAddMember(true)}>
                  <UserPlus className="h-4 w-4 mr-1" />
                  Add Member
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => (
                    <TableRow key={member._id}>
                      <TableCell className="font-medium">
                        {member.name}
                      </TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>{member.role || "Member"}</TableCell>
                      <TableCell className="text-right">
                        {member._id !== user?._id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => setMemberToRemove(member._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="danger" className="space-y-4">
            <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
              <h2 className="text-lg font-medium text-red-600">Danger Zone</h2>
              <p className="text-gray-500">
                Once you delete an organization, there is no going back. All
                boards, tasks, and data will be permanently deleted.
              </p>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteOrg(true)}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete Organization
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Add Member Dialog */}
      <Dialog open={showAddMember} onOpenChange={setShowAddMember}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Member</DialogTitle>
            <DialogDescription>
              Invite a user to join your organization by email address.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="memberEmail">Email</Label>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <Input
                  id="memberEmail"
                  placeholder="Enter email address"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              onClick={handleAddMember}
              disabled={!newMemberEmail.trim()}
            >
              Add Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Member Alert */}
      <AlertDialog
        open={!!memberToRemove}
        onOpenChange={(open) => !open && setMemberToRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this member from your
              organization? They will lose access to all boards and tasks in
              this organization.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              className="bg-red-600 hover:bg-red-700"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Organization Alert */}
      <AlertDialog open={showDeleteOrg} onOpenChange={setShowDeleteOrg}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Organization</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              organization, all its boards, and all tasks. Please type the
              organization name to confirm.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              placeholder={`Type "${organization.name}" to confirm`}
              className="mt-2"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteOrganization}
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

export default OrganizationSettingsPage;
