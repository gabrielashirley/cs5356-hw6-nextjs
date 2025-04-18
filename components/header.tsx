"use client"

import Link from "next/link"
import { UserButton } from "@daveyplate/better-auth-ui"
import { Button } from "./ui/button"
import { AdminNavEntry } from "./AdminNavEntry"
import { useEffect, useState } from "react"
import { authClient } from "@/lib/auth-client"
import { usePathname } from 'next/navigation'

export function Header() {
    const [isAdmin, setIsAdmin] = useState(false);
    const pathname = usePathname();

    // check admin status
    const checkAdminStatus = () => {
        authClient.getSession().then(({ data }) => {
            setIsAdmin(data?.user?.role === "admin");
        });
    };

    useEffect(() => {
        // initial check
        checkAdminStatus();
        
        // poll every 3 seconds to check if the user is an admin
        const interval = setInterval(checkAdminStatus, 3000);
        
        // listen for path changes which might indicate login/logout
        return () => clearInterval(interval);
    }, [pathname]);

    return (
        <header className="sticky top-0 z-50 px-4 py-3 border-b bg-background/60 backdrop-blur">
            <div className="container mx-auto flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/" className="flex items-center gap-2">
                        CS 5356 – HW 6
                    </Link>
                    <nav className="flex items-center gap-2">
                        <Link href="/todos">
                            <Button variant="ghost">Todos</Button>
                        </Link>
                        {isAdmin && <AdminNavEntry />}
                    </nav>
                </div>

                <UserButton />
            </div>
        </header>
    )
}
