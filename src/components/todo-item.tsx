"use client";

import { Pencil, Trash2, GripVertical } from "lucide-react";
import { useState, useRef } from "react";
import { deleteTodo, toggleTodo, updateTodo } from "@/app/action";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Textarea } from "./ui/textarea";
import { format } from "date-fns";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Label } from "./ui/label";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { TodoItemProps } from "@/types/todo";

export function TodoItem({
  id,
  title,
  completed,
  description,
  createdAt,
}: TodoItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const form = useRef<HTMLFormElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: id,
    disabled: isLoading,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      setIsLoading(true);
      await updateTodo({ message: "" }, formData);
      toast.success("Todo updated successfully");
      setIsOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update todo"
      );
    } finally {
      setIsLoading(false);
    }
  };

  async function handleToggle() {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const result = await toggleTodo(id);
      if (result?.success) {
        toast.success(completed ? "Todo uncompleted" : "Todo completed");
      } else {
        toast.error(result?.error || "Failed to update todo status");
      }
    } catch (error) {
      toast.error("Failed to update todo status");
      console.error("Toggle error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete() {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const result = await deleteTodo(id);
      if (result.success) {
        toast.success("Todo deleted successfully");
      } else {
        toast.error(result.error || "Failed to delete todo");
      }
    } catch (error) {
      toast.error("Failed to delete todo");
      console.error("Delete error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-4 rounded-lg shadow"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
      >
        <GripVertical className="h-4 w-4 text-gray-400" />
      </div>
      <div className="flex-1">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={completed ?? false}
              onCheckedChange={handleToggle}
              disabled={isLoading}
            />
            <div className="flex flex-col">
              <span className={completed ? "line-through text-gray-500" : ""}>
                {title}
              </span>
              {createdAt && (
                <span className="text-xs text-muted-foreground">
                  Created {format(new Date(createdAt), "MMM d, yyyy")}
                </span>
              )}
            </div>
          </div>
          {description && (
            <span className="text-sm text-muted-foreground pl-6 line-clamp-2">
              {description}
            </span>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
          <DrawerTrigger asChild>
            <Button variant="ghost" size="icon" disabled={isLoading}>
              <Pencil className="h-4 w-4 text-green-500" />
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <div className="mx-auto w-full max-w-xl">
              <form ref={form} onSubmit={handleSubmit} className="space-y-6">
                <DrawerHeader>
                  <DrawerTitle>Edit Todo</DrawerTitle>
                  <DrawerDescription>
                    Make changes to your todo item here.
                  </DrawerDescription>
                </DrawerHeader>
                <div className="px-4">
                  <input type="hidden" name="id" value={id} />
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        name="title"
                        defaultValue={title}
                        placeholder="Enter todo title"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        defaultValue={description || ""}
                        placeholder="Enter todo description"
                        className="min-h-[200px]"
                      />
                    </div>
                  </div>
                </div>
                <DrawerFooter>
                  <div className="flex flex-col gap-2 w-full">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full"
                      onClick={(e) => {
                        e.preventDefault();
                        form.current?.requestSubmit();
                      }}
                    >
                      {isLoading ? "Saving..." : "Save changes"}
                    </Button>
                    <DrawerClose asChild>
                      <Button
                        variant="outline"
                        type="button"
                        className="w-full"
                      >
                        Cancel
                      </Button>
                    </DrawerClose>
                  </div>
                </DrawerFooter>
              </form>
            </div>
          </DrawerContent>
        </Drawer>
        <Button
          onClick={handleDelete}
          variant="ghost"
          size="icon"
          disabled={isLoading}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </li>
  );
}
