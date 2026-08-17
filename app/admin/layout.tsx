import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { getCurrentUser } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <span className="font-mono text-sm font-semibold tracking-wide">
              OPSCONSOLE
            </span>
            <nav className="flex gap-6 text-sm text-muted">
              <Link href="/admin/team" className="hover:text-fg">
                Team
              </Link>
              <Link href="/admin/config" className="hover:text-fg">
                Config
              </Link>
              <Link href="/admin/audit" className="hover:text-fg">
                Audit Log
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs uppercase tracking-wide text-muted">
              {user.role}
            </span>
            <UserButton afterSignOutUrl="/sign-in" />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-10">{children}</main>
    </div>
  );
}
