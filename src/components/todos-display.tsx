"use client";

import { TodoItem } from "./todo-item";
import type { todos } from "@/db/schema";

type Todo = typeof todos.$inferSelect;

interface TodosDisplayProps {
  allTodos: Todo[];
  showSaved: boolean;
}

export function TodosDisplay({ allTodos, showSaved }: TodosDisplayProps) {
  if (!showSaved) return null;

  return (
    <div className="space-y-1">
      <ul className="grid gap-2">
        {allTodos.map((todo) => (
          <TodoItem key={todo.id} todo={todo} />
        ))}
      </ul>
    </div>
  );
}
