import { TodoForm } from "@/components/todo-form";
import { TodosDisplay } from "@/components/todos-display";
import { todos } from "@/db/schema";
import { db } from "@/db";

export default async function Home() {
  const allTodos = await db.select().from(todos).orderBy(todos.createdAt);

  return (
    <div className="container mx-auto max-w-3xl px-4">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="scroll-m-20 text-xl font-bold tracking-tight lg:text-3xl">
            🪴 Essential To-Do
          </h1>
        </div>

        <TodoForm allTodos={allTodos} />

        {allTodos.length > 0 ? (
          <TodosDisplay allTodos={allTodos} showSaved={false} />
        ) : (
          <div className="text-center text-muted-foreground py-8">
            No tasks yet. Create one above!
          </div>
        )}
      </div>
    </div>
  );
}
