"use client";

import { useActionState } from "react";
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusIcon } from "lucide-react";
import { TodosDisplay } from "./todos-display";
import { toast } from "sonner";
import { createTodo } from "@/app/action";
import { TodoFormProps, TodoActionState } from "@/types/todo";
import { cn } from "@/lib/utils";

export function TodoForm({ allTodos }: TodoFormProps) {
  const initialState: TodoActionState = {
    success: false,
    message: "",
  };

  const [state, formAction, isPending] = useActionState(
    createTodo,
    initialState
  );

  useEffect(() => {
    if (state.success) {
      toast.success(state.message);
    } else if (state.warning) {
      toast.warning(state.message);
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const form = e.currentTarget.closest("form");
      if (form) form.requestSubmit();
    }
  };

  return (
    <Card>
      <form action={formAction}>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex gap-4">
              <PlusIcon className="w-4 h-4 mt-3 text-muted-foreground" />
              <Input
                name="title"
                onKeyDown={handleKeyDown}
                placeholder="Enter tasks, ideas, notes, etc."
                className={cn(
                  "flex-1",
                  state?.errors?.title && "border-destructive"
                )}
                aria-describedby="title-error"
              />
            </div>
            {state?.errors?.title && (
              <p id="title-error" className="text-sm text-destructive px-12">
                {state.errors.title[0]}
              </p>
            )}
          </div>
          <div className="relative mb-4 mt-4">
            <ScrollArea className="h-[100px] w-full rounded-md border">
              <div className="p-4">
                <Textarea
                  name="description"
                  placeholder="Add a description..."
                  className={cn(
                    "min-h-[100px] h-auto resize-none border-0 focus-visible:ring-0 overflow-hidden",
                    state?.errors?.description && "border-destructive"
                  )}
                  aria-describedby="description-error"
                />
              </div>
            </ScrollArea>
            {state?.errors?.description && (
              <p
                id="description-error"
                className="text-sm text-destructive mt-2"
              >
                {state.errors.description[0]}
              </p>
            )}
          </div>
        </CardContent>

        <div className="flex justify-center items-center gap-4 pb-6">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Adding..." : "Add Todo"}
          </Button>
          <div onClick={(e) => e.preventDefault()}>
            <TodosDisplay allTodos={allTodos} />
          </div>
        </div>
      </form>
    </Card>
  );
}
