import { TodosDisplay } from "@/components/todos-display";
import { todos } from "@/db/schema";
import { db } from "@/db";
import { TodoForm } from "@/components/todo-form";
export default async function Home() {
  const allTodos = await db.select().from(todos).orderBy(todos.createdAt);

  return (
    <div className="container mx-auto max-w-3xl px-4">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">
            🪴 Essential To-Do
          </h1>
        </div>
        <TodoForm allTodos={allTodos} />
        <TodosDisplay allTodos={allTodos} showSaved={false} />
      </div>
    </div>
  );
}
