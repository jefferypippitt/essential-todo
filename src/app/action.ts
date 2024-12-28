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

export async function toggleTodo(formData: FormData) {
  try {
    const id = Number(formData.get("id"));
    const completed = formData.get("completed") === "true";

    await db
      .update(todos)
      .set({ completed: completed })
      .where(eq(todos.id, id));

    revalidatePath("/");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    throw new Error("Failed to toggle todo");
  }
}

export async function deleteTodo(formData: FormData) {
  try {
    const id = Number(formData.get("id"));
    await db.delete(todos).where(eq(todos.id, id));
    revalidatePath("/");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    throw new Error("Failed to delete todo");
  }
}

export async function updateTodo(formData: FormData) {
  try {
    const id = Number(formData.get("id"));
    const title = formData.get("title") as string;

    if (!title) throw new Error("Title is required");

    await db.update(todos).set({ title }).where(eq(todos.id, id));

    revalidatePath("/");
    return { message: "Success" };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return { message: "Failed to update todo" };
  }
}
