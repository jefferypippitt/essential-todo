"use server";

import { db } from "@/db";
import { todos } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function addTodo(prevState: unknown, formData: FormData) {
  try {
    const title = formData.get("title") as string;
    if (!title) throw new Error("Title is required");

    await db.insert(todos).values({ title });
    revalidatePath("/");
    return { message: "Todo added" };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return { message: "Failed to add todo" };
  }
}

export async function toggleTodo(id: number) {
  try {
    const todo = await db.query.todos.findFirst({
      where: eq(todos.id, id),
    });

    if (!todo) throw new Error("Todo not found");

    await db
      .update(todos)
      .set({ completed: !todo.completed })
      .where(eq(todos.id, id));

    revalidatePath("/");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    throw new Error("Failed to toggle todo");
  }
}

export async function deleteTodo(id: number) {
  try {
    await db.delete(todos).where(eq(todos.id, id));
    revalidatePath("/");
    return { success: true };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return { success: false };
  }
}

export async function updateTodo(formData: FormData) {
  try {
    const id = Number(formData.get("id"));
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    if (!title) throw new Error("Title is required");

    await db.update(todos).set({ 
      title,
      description: description || null 
    }).where(eq(todos.id, id));

    revalidatePath("/");
    return { message: "Success" };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return { message: "Failed to update todo" };
  }
}

export async function createTodo(data: {
  title: string;
  description?: string;
}) {
  try {
    await db.insert(todos).values({
      title: data.title,
      description: data.description || null,
      completed: false,
    });

    revalidatePath('/');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    throw new Error("Failed to create todo");
  }
}
