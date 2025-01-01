import { db } from "@/db";
import { TodoForm } from "@/components/todo-form";

export default async function Home() {
  const allTodos = await db.query.todos.findMany({
    orderBy: (todos, { asc }) => [asc(todos.order)],
  });

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">🪴Essential To-Do</h1>
      </div>
      <div className="mt-8">
        <TodoForm allTodos={allTodos} />
      </div>
    </div>
  );
}
