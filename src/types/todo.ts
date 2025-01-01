import type { todos } from "@/db/schema";

export type Todo = typeof todos.$inferSelect;

export interface TodoItemProps {
  id: number;
  title: string;
  completed: boolean | null;
  description: string | null;
  createdAt: Date | null;
}

export interface TodosDisplayProps {
  allTodos: Todo[];
}

export interface TodoFormProps extends React.ComponentProps<"div"> {
  allTodos: Todo[];
}

export type TodoFormState = {
  message: string;
};

export interface TodoActionState {
  success: boolean;
  message: string;
  errors?: {
    title?: string[];
    description?: string[];
  };
}
