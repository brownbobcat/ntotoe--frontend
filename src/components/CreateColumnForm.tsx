/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CreateColumnFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const CreateColumnForm: React.FC<CreateColumnFormProps> = ({
  onSubmit,
  onCancel,
}) => {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      return;
    }

    onSubmit({ name });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4 py-2">
        <div className="space-y-2">
          <Label htmlFor="name">Column Name</Label>
          <Input
            id="name"
            placeholder="Enter column name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 mt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!name.trim()}>
          Create Column
        </Button>
      </div>
    </form>
  );
};

export default CreateColumnForm;
