"use client";

import { Pencil, Trash2, GripVertical } from "lucide-react";
import { useState } from "react";
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

type TodoItemProps = {
  id: number;
  title: string;
  completed: boolean | null;
  description: string | null;
  createdAt: Date | null;
};

export function TodoItem({
  id,
  title,
  completed,
  description,
  createdAt,
}: TodoItemProps) {
  const [editedTitle, setEditedTitle] = useState(title);
  const [editedDescription, setEditedDescription] = useState(description || "");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  async function handleToggle() {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const result = await toggleTodo(id);
      if (result?.success) {
        toast.success(completed ? "Todo uncompleted" : "Todo completed");
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to update todo status");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    const formData = new FormData();
    formData.append("id", id.toString());
    formData.append("title", editedTitle);
    formData.append("description", editedDescription);

    const result = await updateTodo(formData);
    if (result.message === "Success") {
      toast.success("Todo updated successfully");
      setIsOpen(false);
    } else {
      toast.error("Failed to update todo");
    }
  }

  async function handleDelete() {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const result = await deleteTodo(id);
      if (result.success) {
        toast.success("Todo deleted successfully");
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to delete todo");
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
        className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
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
            <span className="text-sm text-muted-foreground pl-6">
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
              <DrawerHeader>
                <DrawerTitle>Edit Todo</DrawerTitle>
                <DrawerDescription>
                  Make changes to your todo item here.
                </DrawerDescription>
              </DrawerHeader>
              <form onSubmit={handleUpdate}>
                <div className="p-4 pb-0">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        placeholder="Enter todo title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={editedDescription}
                        onChange={(e) => setEditedDescription(e.target.value)}
                        placeholder="Enter todo description"
                        className="min-h-[100px]"
                      />
                    </div>
                  </div>
                </div>
                <DrawerFooter>
                  <Button type="submit">Save changes</Button>
                  <DrawerClose asChild>
                    <Button variant="outline" type="button">
                      Cancel
                    </Button>
                  </DrawerClose>
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
