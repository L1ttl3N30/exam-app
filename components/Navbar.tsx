"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="w-full bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
      <Link href="/" className="font-semibold text-lg">
        IELTS Test Platform
      </Link>
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className={pathname.startsWith("/dashboard") ? "underline" : ""}
        >
          Dashboard
        </Link>
        <Link href="/admin" className={pathname.startsWith("/admin") ? "underline" : ""}>
          Admin
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="rounded bg-slate-700 px-3 py-1 text-sm"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

