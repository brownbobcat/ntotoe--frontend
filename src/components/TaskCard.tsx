/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TaskCardProps {
  task: any;
  onClick: () => void;
  getPriorityIcon?: (priority: string) => React.ReactNode;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onClick,
  getPriorityIcon,
}) => {
  // Default priority icon function if one isn't provided
  const defaultGetPriorityIcon = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "medium":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "low":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  // Use provided function or default
  const renderPriorityIcon = getPriorityIcon || defaultGetPriorityIcon;

  // Priority color mapping
  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div
      className="mb-2 p-3 bg-white rounded-md shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="font-medium mb-1 line-clamp-2">{task.title}</div>

      {task.description && (
        <div className="text-xs text-gray-500 mb-2 line-clamp-2">
          {task.description}
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          {task.priority && (
            <Badge
              variant="outline"
              className={`flex items-center gap-1 ${getPriorityColor(
                task.priority
              )}`}
            >
              {renderPriorityIcon(task.priority)}
              <span className="text-xs">{task.priority}</span>
            </Badge>
          )}
        </div>

        {task.assignee && (
          <div className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full truncate max-w-[100px]">
            {typeof task.assignee === "object"
              ? task.assignee.name
              : task.assignee}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
