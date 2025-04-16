import { Todo } from "@/database/schema";
import { Checkbox } from "@/components/ui/checkbox";
import { useOptimistic } from "react";
import { toggleTodo } from "@/actions/todos";

export function TodoItem({ todo }: { todo: Todo }) {
    const [optimisticTodo, toggleOptimistic] = useOptimistic(
        todo,
        (currentTodo) => ({
          ...currentTodo,
          completed: !currentTodo.completed,
        })
      );

    const handleToggle = async () => {
        // skip temporary todos
        if (todo.id.startsWith("temp-")) return;
    
        // optimistically update the UI
        toggleOptimistic(optimisticTodo);

        // call server action
        await toggleTodo(todo.id);
    };
    
    return (
        <li
            key={optimisticTodo.id}
            className={`flex items-center gap-2 rounded-lg border px-4 py-2`}
        >
            <Checkbox
                defaultChecked={optimisticTodo.completed}
                onCheckedChange={handleToggle}
                className="h-4 w-4"
                disabled={todo.id.startsWith("temp-")} 
            />
            <span className={`flex-1 ${optimisticTodo.completed ? "line-through text-muted-foreground" : ""}`}>
                {optimisticTodo.title}
                {todo.id.startsWith("temp-") && (
                    <span className="ml-2 text-gray-400 text-sm">Saving...</span>
                )}
            </span>
        </li>
    )
}