"use server";

import { db } from "@/db";
import { todos } from "@/db/schema";    
import { revalidatePath } from "next/cache";
import { eq, sql, and, gte, lt, gt, lte } from "drizzle-orm";

export async function createTodo(prevState: unknown, formData: FormData) {
  try {
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    if (!title) throw new Error("Title is required");

    // Get the current maximum order
    const result = await db.select({
      maxOrder: sql<number>`COALESCE(MAX(${todos.order}), 0)`
    }).from(todos);
    const newOrder = (result[0]?.maxOrder ?? 0) + 1;

    await db.insert(todos).values({ 
      title,
      description: description || null,
      order: newOrder,
      completed: false
    });

    revalidatePath("/");
    return { message: "Todo added" };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { message: error.message };
    }
    return { message: "Failed to add todo" };
  }
}

export async function toggleTodo(id: number) {
  try {
    const todo = await db.query.todos.findFirst({
      where: eq(todos.id, id),
      columns: {
        completed: true,
        order: true
      }
    });

    if (!todo) throw new Error("Todo not found");

    await db
      .update(todos)
      .set({ 
        completed: !todo.completed,
        order: todo.order // Explicitly preserve the order
      })
      .where(eq(todos.id, id));

    revalidatePath("/");
    return { 
      success: true, 
      completed: !todo.completed,
      order: todo.order
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

    // Update orders for remaining todos
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

export async function updateTodo(formData: FormData) {
  try {
    const id = Number(formData.get("id"));
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    if (!title) throw new Error("Title is required");

    const currentTodo = await db.query.todos.findFirst({
      where: eq(todos.id, id),
    });

    if (!currentTodo) throw new Error("Todo not found");

    await db.update(todos).set({ 
      title,
      description: description || null,
      order: currentTodo.order
    }).where(eq(todos.id, id));

    revalidatePath("/");
    return { message: "Success", order: currentTodo.order };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { message: error.message };
    }
    return { message: "Failed to update todo" };
  }
}

export async function reorderTodos(activeId: number, overId: number) {
  try {
    const allTodos = await db.query.todos.findMany({
      orderBy: (todos, { asc }) => [asc(todos.order)]
    });
    
    const activeItem = allTodos.find(todo => todo.id === activeId);
    const overItem = allTodos.find(todo => todo.id === overId);
    
    if (!activeItem || !overItem) {
      return { success: false, error: "Todo items not found" };
    }

    const oldOrder = activeItem.order;
    const newOrder = overItem.order;

    // Update orders without transaction
    if (oldOrder < newOrder) {
      // Moving down
      await db
        .update(todos)
        .set({ order: sql`${todos.order} - 1` })
        .where(
          and(
            gt(todos.order, oldOrder),
            lte(todos.order, newOrder)
          )
        );
    } else {
      // Moving up
      await db
        .update(todos)
        .set({ order: sql`${todos.order} + 1` })
        .where(
          and(
            gte(todos.order, newOrder),
            lt(todos.order, oldOrder)
          )
        );
    }

    // Update the active item's order
    await db
      .update(todos)
      .set({ order: newOrder })
      .where(eq(todos.id, activeId));

    // Normalize orders in a separate step
    const updatedTodos = await db.query.todos.findMany({
      orderBy: (todos, { asc }) => [asc(todos.order)]
    });

    // Update all orders to be sequential
    for (const [index, todo] of updatedTodos.entries()) {
      await db
        .update(todos)
        .set({ order: index + 1 })
        .where(eq(todos.id, todo.id));
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error('Reorder error:', error);
    return { success: false, error: "Failed to reorder todos" };
  }
}