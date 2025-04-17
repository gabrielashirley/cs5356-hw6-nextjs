"use server"

import { eq, and, sql } from "drizzle-orm"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"

import { auth } from "@/lib/auth"
import { db } from "@/database/db"
import { todos } from "@/database/schema"

export interface TodoState {
    error?: string;
    success?: boolean;
    pending?: boolean;
  }

export async function createTodo(prevState: TodoState, formData: FormData): Promise<TodoState> {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) {
        return { error: "Unauthorized" };
    }

    const title = formData.get("title")?.toString().trim();
    if (!title) {
        return { error: "Title cannot be empty" };
    }

    try {
        // simulate delay 
        await new Promise(resolve => setTimeout(resolve, 1000));
    
        await db.insert(todos).values({
          title,
          userId: session.user.id,
          completed: false,
          createdAt: new Date(),
        });
    
        revalidatePath("/todos");
        return { success: true };
      } catch (error) {
        console.error("Create todo error:", error);
        return { error: "Failed to create todo" };
      }
}

export async function toggleTodo(id: string): Promise<TodoState & { completed?: boolean }> {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) {
        return { error: "Unauthorized" };
    }

    try {
        // single DB query that updates the todo only if owned by the user
        const result = await db.update(todos)
            .set({ 
                completed: sql`NOT ${todos.completed}` // toggle directly in SQL
            })
            .where(
                and(
                    eq(todos.id, id),
                    eq(todos.userId, session.user.id) // only allow the todo's creator to toggle
                )
            )
            .returning();
        
        // if no rows were updated, the todo doesn't exist or doesn't belong to the user
        if (!result) {
          return { error: "Todo not found or you don't have permission to update it" };
        }
        
        revalidatePath("/todos");
        return { success: true, completed: result[0].completed };
    } catch (error) {
        console.error("Toggle todo error:", error);
        return { error: "Failed to update todo" };
    }
}

export async function deleteTodo(formData: FormData): Promise<void> {
    const session = await auth.api.getSession({
      headers: await headers()
    });
    
    // only admin can delete todos
    if (!session?.user || session.user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    try {
      const id = formData.get("id") as string;
      await db.delete(todos)
          .where(eq(todos.id, id));

      revalidatePath("/admin");
    } catch (error) {
      console.error("Delete todo error:", error);
      throw new Error("Failed to delete todo");
    }
}
