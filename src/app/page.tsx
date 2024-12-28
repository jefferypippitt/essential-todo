import { MaxWidthWrapper } from "@/components/max-width-wrapper";

import TodoItem from "@/components/todo-item";
import AddTodoForm from "@/components/todo-form";
import { todos } from "@/db/schema";
import { db } from "@/db";

export default async function Home() {
  const allTodos = await db.select().from(todos).orderBy(todos.createdAt);
  return (
    <MaxWidthWrapper>
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">🪴 Essential To-Do</h1>
        <AddTodoForm />
        <ul className="flex flex-col gap-2">
          {allTodos.map((todo) => (
            <TodoItem key={todo.id} todo={todo} />
          ))}
        </ul>
      </div>
    </MaxWidthWrapper>
  );
}
