"use client";

import { useState } from "react";
import { createTodo } from "@/app/action";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusIcon, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { NewTodoSchema } from "@/db/schema";
import { z } from "zod";
import type { todos } from "@/db/schema";
import { TodosDisplay } from "./todos-display";
import { toast } from "sonner";

type Todo = typeof todos.$inferSelect;

interface TodoFormProps extends React.ComponentProps<typeof Card> {
  allTodos: Todo[];
}

export function TodoForm({ className, allTodos }: TodoFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  const validateAndSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);

    try {
      const newTodo = NewTodoSchema.parse({
        title: title.trim(),
        description: description.trim(),
      });

      setPending(true);
      await createTodo(newTodo);

      setTitle("");
      setDescription("");
      toast.success("Todo created successfully");
    } catch (error) {
      if (error instanceof z.ZodError) {
        setError(error.errors[0].message);
      } else {
        toast.error("Failed to create todo");
      }
    } finally {
      setPending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      validateAndSubmit();
    }
  };

  const handleSavedClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowSaved((prev) => !prev);
  };

  return (
    <>
      <Card className={cn("w-full", className)}>
        <form onSubmit={validateAndSubmit}>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex gap-4">
                <PlusIcon className="w-4 h-4 mt-3 text-muted-foreground" />
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter tasks, ideas, notes, etc."
                  disabled={pending}
                  className={cn(
                    "flex-1",
                    error && "border-destructive focus-visible:ring-destructive"
                  )}
                />
              </div>
              {error && (
                <p className="text-sm text-destructive px-12">{error}</p>
              )}
            </div>
            <div className="relative mb-4 mt-4">
              <ScrollArea className="h-[100px] w-full rounded-md border">
                <div className="p-4">
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add a description..."
                    disabled={pending}
                    className="min-h-[100px] h-auto resize-none border-0 focus-visible:ring-0 overflow-hidden"
                  />
                </div>
              </ScrollArea>
            </div>
            <div className="flex justify-center mt-6 gap-2">
              <Button
                type="submit"
                disabled={pending}
                className="gap-2"
              >
                Add Todo
              </Button>
              <Button
                type="button"
                onClick={handleSavedClick}
                disabled={pending}
                variant={showSaved ? "default" : "outline"}
              >
                Saved
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    showSaved && "rotate-180"
                  )}
                />
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
      <TodosDisplay allTodos={allTodos} showSaved={showSaved} />
    </>
  );
}
