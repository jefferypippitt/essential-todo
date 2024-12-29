"use client";

import { TodoItem } from "./todo-item";
import type { todos } from "@/db/schema";
import { ScrollArea } from "./ui/scroll-area";

type Todo = typeof todos.$inferSelect;

interface TodosDisplayProps {
  allTodos: Todo[];
  showSaved: boolean;
}

export function TodosDisplay({ allTodos, showSaved }: TodosDisplayProps) {
  if (!showSaved) return null;

  return (
    <div className="mt-2">
      <ScrollArea className="h-[400px] w-full rounded-md">
        <div className="pr-4 h-full">
          <ul className="grid gap-2">
            {allTodos.map((todo) => (
              <TodoItem key={todo.id} todo={todo} />
            ))}
          </ul>
        </div>
      </ScrollArea>
    </div>
  );
}
