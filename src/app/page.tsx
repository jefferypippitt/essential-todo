import { db } from "@/db";
import { TodoForm } from "@/components/todo-form";
import Link from "next/link";

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
      <div className="mt-8">
        <p className="text-xs text-muted-foreground font-semibold">
          This is a todo app built with Next.js, DND Kit, Figma, Neon, Drizzle, Arcjet,
          and Nextjs {"<"}Forms{" />"}.
        </p>
        <div className="mt-1">
          <Link
            href="https://www.figma.com/design/fN34mdUBE4ry6IuI1dCYoc/Essential-To-Do-(Community)?node-id=0-1&p=f&t=YppV80q6NpZ8GCic-0"
            className="text-xs text-blue-500 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Figma Design
          </Link>
        </div>
      </div>
    </div>
  );
}
