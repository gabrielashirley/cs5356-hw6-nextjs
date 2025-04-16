"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { Todo } from "@/database/schema"

import { TodoItem } from "./TodoItem"
import { useActionState, useOptimistic } from "react";
import { createTodo } from "@/actions/todos";

const initialState = {
    error: undefined,
    success: undefined
};

export function TodoList({ todos }: { todos: Todo[] }) {
    const [state, formAction] = useActionState(createTodo, initialState);
    const [optimisticTodos, addOptimisticTodo] = useOptimistic(
      todos,
      (currentTodos, newTitle: string) => [
        {
          id: `temp-${Date.now()}`,
          title: newTitle,
          completed: false,
          userId: "",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        ...currentTodos,
      ]
    );
  
    const handleSubmit = async (formData: FormData) => {
      const title = formData.get("title")?.toString().trim();
      
      if (!title) return;
      
      // add optimistic update
      addOptimisticTodo(title);
      
      // submit the form
      formAction(formData);
    };

    return (
        <div className="space-y-4">
            <form action={handleSubmit} className="flex gap-2 items-stretch">
                <Input
                    name="title"
                    placeholder={"Add a new todo..."}
                    className={state?.error ? "border-red-500" : ""}
                    aria-invalid={!!state?.error}
                />
                <Button type="submit" disabled={!!state?.pending}>
                    {state?.pending ? "Adding..." : "Add"}
                </Button>
            </form>

            {state?.error && (
                <p className="text-red-500 text-sm mt-1">{state.error}</p>
            )}

            <ul className="space-y-2">
                {optimisticTodos.map((todo) => (
                    <TodoItem key={todo.id} todo={todo} />
                ))}
            </ul>
        </div>
    )
} 