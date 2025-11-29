import "./globals.css";
import { ReactNode } from "react";
import { Navbar } from "@/components/Navbar";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";

export const metadata = {
  title: "IELTS Test Platform",
  description: "MCQ and Writing tests with AI grading"
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authConfig);

  return (
    <html lang="en">
      <body className="bg-slate-100 min-h-screen">
        {session?.user && <Navbar />}
        <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}

