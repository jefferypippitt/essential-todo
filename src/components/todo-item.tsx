"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { deleteTodo, toggleTodo, updateTodo } from "@/app/action";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Textarea } from "./ui/textarea";
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

export function TodoItem({
  id,
  title,
  completed,
  description,
}: {
  id: number;
  title: string;
  completed: boolean | null;
  description: string | null;
}) {
  const [editedTitle, setEditedTitle] = useState(title);
  const [editedDescription, setEditedDescription] = useState(description || "");
  const [isOpen, setIsOpen] = useState(false);

  async function handleToggle() {
    try {
      await toggleTodo(id);
      toast.success(completed ? "Todo uncompleted" : "Todo completed");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to update todo status");
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
    try {
      await deleteTodo(id);
      toast.success("Todo deleted successfully");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to delete todo");
    }
  }

  return (
    <div className="flex items-center justify-between gap-2 p-4">
      <div className="flex-1">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={completed ?? false}
              onCheckedChange={handleToggle}
            />
            <span className={completed ? "line-through text-gray-500" : ""}>
              {title}
            </span>
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
            <Button
              variant="ghost"
              size="icon"
            >
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
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
