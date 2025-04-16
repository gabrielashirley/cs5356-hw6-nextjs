import { db } from "@/database/db"
import { todos as todosTable} from "@/database/schema"
import { eq } from "drizzle-orm"

export async function getUserTodos(userId: string) {
  return db.query.todos.findMany({
    where: eq(todosTable.userId, userId),
    orderBy: (todosTable, { desc }) => [desc(todosTable.createdAt)],
  });
}