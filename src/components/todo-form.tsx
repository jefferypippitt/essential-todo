"use client";

import { toast } from "sonner";
import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addTodo } from "@/app/action";

const initialState = {
  message: "",
};

function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Adding..." : "Add Todo"}
    </Button>
  );
}

export default function NewTodoForm() {
  const [validationError, setValidationError] = useState({ title: "" });
  const [state, dispatch, pending] = useActionState(addTodo, initialState);

  useEffect(() => {
    if (state?.message) {
      if (state.message === "Todo added") {
        toast.success(state.message);
        // Clear the input after successful addition
        const form = document.querySelector("form") as HTMLFormElement;
        if (form) form.reset();
      } else {
        toast.error(state.message);
      }
    }
  }, [state]);

  const formAction = async (formData: FormData) => {
    await dispatch(formData);
  };

  function validate(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    if (name === "title") {
      if (!value.trim()) {
        setValidationError({ title: "Title is required" });
      } else if (value.length > 100) {
        setValidationError({ title: "Title is too long" });
      } else {
        setValidationError({ title: "" });
      }
    }
  }

  return (
    <form action={formAction}>
      <div className="mt-12 flex gap-3">
        <div className="w-full">
          <Input
            type="text"
            name="title"
            placeholder="Enter a todo"
            onChange={validate}
            required
          />
          {validationError.title && (
            <p className="ml-1 mt-2 text-sm text-red-500">
              {validationError.title}
            </p>
          )}
        </div>
        <SubmitButton pending={pending} />
      </div>
    </form>
  );
}
