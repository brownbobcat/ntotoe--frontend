/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Draggable } from "react-beautiful-dnd";
import {
  Plus,
  MoreHorizontal,
  AlertCircle,
  Clock,
  CheckCircle2,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import TaskCard from "./TaskCard";
import { StrictModeDroppable } from "./StrictModeDroppable";

interface TaskColumnProps {
  column: {
    _id: string;
    name: string;
    tasks: any[];
    filteredTasks?: any[];
    hasMatchingTasks?: boolean;
  };
  onAddTask: () => void;
  onEditTask: (task: any) => void;
  onDeleteColumn: () => void;
  isFiltered?: boolean;
}

const TaskColumn: React.FC<TaskColumnProps> = ({
  column,
  onAddTask,
  onEditTask,
  onDeleteColumn,
  isFiltered = false,
}) => {
  // Function to get priority icon based on priority level
  const getPriorityIcon = (priority: string) => {
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

  return (
    <div
      className={`bg-gray-50 border border-solid rounded-md shadow-sm p-3 min-w-[300px] max-w-[300px] flex flex-col ${
        isFiltered && !column.hasMatchingTasks ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-700 flex items-center">
          <span>{column.name}</span>
          <span className="ml-2 bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full">
            {column.tasks.length}
          </span>
          {isFiltered && (
            <Badge
              variant="outline"
              className="ml-2 bg-blue-50 text-blue-700 border-blue-200"
            >
              <Filter className="h-3 w-3 mr-1" />
              {column.tasks.length} filtered
            </Badge>
          )}
        </h3>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={onAddTask}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={onDeleteColumn}
                className="text-red-600"
              >
                Delete Column
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <StrictModeDroppable
        droppableId={column._id}
        isDropDisabled={false}
        isCombineEnabled={false}
        ignoreContainerClipping={false}
      >
        {(provided, snapshot) => (
          <div
            className={`flex-1 min-h-[200px] ${
              snapshot.isDraggingOver ? "bg-blue-50" : ""
            } rounded p-1 overflow-y-auto`}
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {column.tasks.length === 0 ? (
              <div className="text-center p-2 text-sm text-gray-400">
                {isFiltered
                  ? "No tasks match filters"
                  : "No tasks in this column"}
              </div>
            ) : (
              column.tasks.map((task, index) => (
                <Draggable
                  key={task._id}
                  draggableId={task._id.toString()}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{
                        ...provided.draggableProps.style,
                        opacity: snapshot.isDragging ? 0.8 : 1,
                      }}
                    >
                      <TaskCard
                        task={task}
                        onClick={() => onEditTask(task)}
                        getPriorityIcon={getPriorityIcon}
                      />
                    </div>
                  )}
                </Draggable>
              ))
            )}
            {provided.placeholder}
          </div>
        )}
      </StrictModeDroppable>
    </div>
  );
};

export default TaskColumn;
