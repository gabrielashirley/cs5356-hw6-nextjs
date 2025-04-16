import { TodoList } from "@/components/TodoList"
import { todos as todosTable, Todo } from "@/database/schema"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { getUserTodos } from "@/lib/db/queries"

export default async function TodosPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (session === null) {
        // if user is not authenticated, return placeholder
        return <h1 className="text-2xl font-bold mb-6">Please sign in</h1>;
    }

     // if users are authenticated, display their own todos
    const userTodos = await getUserTodos(session.user.id);

    return (
        <main className="py-8 px-4">
            <section className="container mx-auto">
                <h1 className="text-2xl font-bold mb-6">My Todos</h1>
                <TodoList todos={userTodos} />
            </section>
        </main>
    )
} 