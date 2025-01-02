export type Todo = {
  id: number;
  title: string;
  completed: boolean | null;
  description: string | null;
  createdAt: Date | null;
};

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
  warning?: boolean;
  errors?: {
    title?: string[];
    description?: string[];
  };
}
