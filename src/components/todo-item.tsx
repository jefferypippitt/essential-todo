"use client";

import { deleteTodo, toggleTodo } from "@/app/action";
import { toast } from "sonner";
import type { todos } from "@/db/schema";
import { Checkbox } from "./ui/checkbox";
import { Button } from "./ui/button";
import { Trash2Icon } from "lucide-react";
import { Label } from "./ui/label";

type Todo = typeof todos.$inferSelect;

interface TodoItemProps {
  todo: Todo;
}

export function TodoItem({ todo }: TodoItemProps) {
  const handleToggle = async () => {
    try {
      await toggleTodo(todo.id);
      toast.success(todo.completed ? "Todo uncompleted" : "Todo completed");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to toggle todo");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTodo(todo.id);
      toast.success("Todo deleted");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to delete todo");
    }
  };

  return (
    <div className="group py-3 hover:bg-muted/50 rounded-lg transition-colors">
      <div className="px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`todo-${todo.id}`}
              checked={todo.completed ?? false}
              onCheckedChange={handleToggle}
            />
            <Label
              htmlFor={`todo-${todo.id}`}
              className={`font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                todo.completed ? "line-through text-muted-foreground" : ""
              }`}
            >
              {todo.title}
            </Label>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2Icon className="h-4 w-4" />
          </Button>
        </div>
        {todo.description && (
          <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap pl-6">
            {todo.description}
          </p>
        )}
      </div>
    </div>
  );
}
