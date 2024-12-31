import {
  integer,
  pgTable,
  serial,
  text,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { z } from "zod";

export const todos = pgTable("todos", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  order: integer("order").notNull().default(0),
});

export const NewTodoSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  completed: z.boolean().optional(),
  createdAt: z.date().optional(),
});

export type NewTodo = z.infer<typeof NewTodoSchema>;
