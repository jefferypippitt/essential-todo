"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { todos } from "@/db/schema";
import { TodosDisplay } from "./todos-display";
import { toast } from "sonner";
import { createTodo } from "@/app/action";

type Todo = typeof todos.$inferSelect;

interface TodoFormProps extends React.ComponentProps<typeof Card> {
  allTodos: Todo[];
}

// Submit Button Component with loading state
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Adding..." : "Add Todo"}
    </Button>
  );
}

export function TodoForm({ className, allTodos }: TodoFormProps) {
  const [state, formAction] = useActionState(createTodo, { message: "" });

  useEffect(() => {
    if (state.message === "Todo added") {
      toast.success("Todo created successfully");
    } else if (state.message && state.message !== "Todo added") {
      toast.error(state.message);
    }
  }, [state.message]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const form = e.currentTarget.closest("form");
      if (form) form.requestSubmit();
    }
  };

  return (
    <>
      <Card className={cn("w-full", className)}>
        <div className="relative">
          <form action={formAction}>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex gap-4">
                  <PlusIcon className="w-4 h-4 mt-3 text-muted-foreground" />
                  <Input
                    name="title"
                    onKeyDown={handleKeyDown}
                    placeholder="Enter tasks, ideas, notes, etc."
                    className="flex-1"
                  />
                </div>
                {state.message && state.message !== "Todo added" && (
                  <p className="text-sm text-destructive px-12">
                    {state.message}
                  </p>
                )}
              </div>
              <div className="relative mb-4 mt-4">
                <ScrollArea className="h-[100px] w-full rounded-md border">
                  <div className="p-4">
                    <Textarea
                      name="description"
                      placeholder="Add a description..."
                      className="min-h-[100px] h-auto resize-none border-0 focus-visible:ring-0 overflow-hidden"
                    />
                  </div>
                </ScrollArea>
              </div>
            </CardContent>

            <div className="flex justify-center items-center gap-4 pb-6">
              <SubmitButton />
              <div onClick={(e) => e.preventDefault()}>
                <TodosDisplay allTodos={allTodos} />
              </div>
            </div>
          </form>
        </div>
      </Card>
    </>
  );
}
