"use client";

import { useState } from "react";
import { todos } from "@/db/schema";
import { formatDate } from "@/lib/utils";
import { Trash2, Pencil, X, Check } from "lucide-react";
import { deleteTodo, toggleTodo, updateTodo } from "@/app/action";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function TodoItem({
  todo,
}: {
  todo: typeof todos.$inferSelect;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(todo.title);

  async function handleChange(checked: boolean) {
    const formData = new FormData();
    formData.set("id", todo.id.toString());
    formData.set("completed", checked.toString());

    try {
      await toggleTodo(formData);
      toast.success(checked ? "Todo completed! 🎉" : "Todo unmarked");
    } catch {
      toast.error("Failed to update todo status");
    }
  }

  async function handleDelete(formData: FormData) {
    try {
      await deleteTodo(formData);
      toast.error("Todo deleted", {
        style: {
          backgroundColor: "rgb(239 68 68)",
          color: "white",
        },
        duration: 3000,
      });
    } catch {
      toast.error("Failed to delete todo");
    }
  }

  async function handleUpdate(formData: FormData) {
    if (!editedTitle.trim()) {
      toast.error("Todo title cannot be empty");
      return;
    }

    try {
      const result = await updateTodo(formData);
      if (result.message === "Success") {
        setIsEditing(false);
        toast.success("Todo updated successfully");
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to update todo");
    }
  }

  function handleCancel() {
    setIsEditing(false);
    setEditedTitle(todo.title); // Reset to original title
  }

  return (
    <li className="flex items-center gap-3 group hover:bg-muted/50 p-2 rounded-lg transition-colors">
      <Checkbox
        id={todo.id.toString()}
        className="peer"
        checked={todo.completed ?? false}
        onCheckedChange={handleChange}
      />

      {isEditing ? (
        <form action={handleUpdate} className="flex-1 flex items-center gap-2">
          <input type="hidden" name="id" value={todo.id} />
          <Input
            name="title"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            className="flex-1"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                handleCancel();
              }
            }}
          />
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            disabled={!editedTitle.trim()}
          >
            <Check className="h-4 w-4 text-green-500" />
            <span className="sr-only">Save changes</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleCancel}
          >
            <X className="h-4 w-4 text-red-500" />
            <span className="sr-only">Cancel editing</span>
          </Button>
        </form>
      ) : (
        <>
          <Label
            htmlFor={todo.id.toString()}
            className="cursor-pointer flex-1 peer-data-[state=checked]:text-gray-500 peer-data-[state=checked]:line-through"
          >
            {todo.title}
          </Label>
          <span className="text-sm text-gray-500 peer-data-[state=checked]:text-gray-500 peer-data-[state=checked]:line-through">
            {formatDate(todo.createdAt ?? new Date())}
          </span>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditing(true)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Pencil className="h-4 w-4 text-blue-500" />
              <span className="sr-only">Edit task</span>
            </Button>

            <form action={handleDelete}>
              <input type="hidden" name="id" value={todo.id} />
              <Button
                variant="ghost"
                size="icon"
                type="submit"
                className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete task</span>
              </Button>
            </form>
          </div>
        </>
      )}
    </li>
  );
}
