"use server";

import { db } from "@/db";
import { todos } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { eq, sql, and, gte, lt, gt, lte } from "drizzle-orm";
import { NewTodoSchema } from "@/db/schema";
import type { TodoActionState } from "@/types/todo";
import arcjet, { shield, detectBot, fixedWindow, request } from '@arcjet/next';

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    shield({
      mode: 'LIVE'
    }),
    detectBot({
      mode: 'LIVE',
      allow: []
    }),
    fixedWindow({
      mode: 'LIVE',
      window: '1m',
      max: 5
    })
  ]
});

export async function createTodo(
  prevState: TodoActionState,
  formData: FormData
): Promise<TodoActionState> {
  try {
    const req = await request();
    const decision = await aj.protect(req);

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return {
          success: false,
          warning: true,
          message: "You've reached the maximum attempts. Please wait a moment before trying again.",
        };
      }
      if (decision.reason.isBot()) {
        return {
          success: false,
          warning: true,
          message: "Automated submissions have been detected and blocked.",
        };
      }
      return {
        success: false,
        warning: true,
        message: "Your request was blocked for security reasons.",
      };
    }

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    const validated = NewTodoSchema.safeParse({
      title: title?.trim(),
      description: description?.trim(),
    });

    if (!validated.success) {
      return {
        success: false,
        message: "Please fix the errors in the form",
        errors: {
          title: validated.error.flatten().fieldErrors.title,
          description: validated.error.flatten().fieldErrors.description,
        },
      };
    }

    const result = await db
      .select({
        maxOrder: sql<number>`COALESCE(MAX(${todos.order}), 0)`,
      })
      .from(todos);
    const newOrder = (result[0]?.maxOrder ?? 0) + 1;

    await db.insert(todos).values({
      title: validated.data.title,
      description: validated.data.description || null,
      order: newOrder,
      completed: false,
    });

    revalidatePath("/");
    return {
      success: true,
      message: "Todo added successfully!",
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to add todo",
    };
  }
}

export async function toggleTodo(id: number) {
  try {
    const todo = await db.query.todos.findFirst({
      where: eq(todos.id, id),
      columns: {
        completed: true,
        order: true,
      },
    });

    if (!todo) throw new Error("Todo not found");

    await db
      .update(todos)
      .set({
        completed: !todo.completed,
        order: todo.order,
      })
      .where(eq(todos.id, id));

    revalidatePath("/");
    return {
      success: true,
      completed: !todo.completed,
      order: todo.order,
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to toggle todo" };
  }
}

export async function deleteTodo(id: number) {
  try {
    const todo = await db.query.todos.findFirst({
      where: eq(todos.id, id),
    });

    if (!todo) throw new Error("Todo not found");

    await db.delete(todos).where(eq(todos.id, id));

    await db
      .update(todos)
      .set({ order: sql`${todos.order} - 1` })
      .where(gt(todos.order, todo.order));

    revalidatePath("/");
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to delete todo" };
  }
}

export async function updateTodo(
  state: { message: string },
  formData: FormData
) {
  try {
    const id = formData.get("id");
    const title = formData.get("title");
    const description = formData.get("description");

    if (!id || !title) {
      throw new Error("Missing required fields");
    }

    const validated = NewTodoSchema.safeParse({
      title: title.toString().trim(),
      description: description?.toString().trim(),
    });

    if (!validated.success) {
      throw new Error(validated.error.errors[0].message);
    }

    const currentTodo = await db.query.todos.findFirst({
      where: eq(todos.id, Number(id)),
    });

    if (!currentTodo) {
      throw new Error("Todo not found");
    }

    await db
      .update(todos)
      .set({
        title: validated.data.title,
        description: validated.data.description || null,
        order: currentTodo.order,
      })
      .where(eq(todos.id, Number(id)));

    revalidatePath("/");

    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Failed to update todo");
  }
}

export async function reorderTodos(activeId: number, overId: number) {
  try {
    const allTodos = await db.query.todos.findMany({
      orderBy: (todos, { asc }) => [asc(todos.order)],
    });

    const activeItem = allTodos.find((todo) => todo.id === activeId);
    const overItem = allTodos.find((todo) => todo.id === overId);

    if (!activeItem || !overItem) {
      return { success: false, error: "Todo items not found" };
    }

    const oldOrder = activeItem.order;
    const newOrder = overItem.order;

    if (oldOrder < newOrder) {
      await db
        .update(todos)
        .set({ order: sql`${todos.order} - 1` })
        .where(and(gt(todos.order, oldOrder), lte(todos.order, newOrder)));
    } else {
      await db
        .update(todos)
        .set({ order: sql`${todos.order} + 1` })
        .where(and(gte(todos.order, newOrder), lt(todos.order, oldOrder)));
    }

    await db
      .update(todos)
      .set({ order: newOrder })
      .where(eq(todos.id, activeId));

    const updatedTodos = await db.query.todos.findMany({
      orderBy: (todos, { asc }) => [asc(todos.order)],
    });

    for (const [index, todo] of updatedTodos.entries()) {
      await db
        .update(todos)
        .set({ order: index + 1 })
        .where(eq(todos.id, todo.id));
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Reorder error:", error);
    return { success: false, error: "Failed to reorder todos" };
  }
}