import Link from "next/link";
import { redirect } from "next/navigation";

import { cn } from "@/lib/utils";
import { createServerClient } from "@/lib/supabase";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const adminEmails =
    process.env.ADMIN_EMAILS?.split(",").map((e) => e.trim().toLowerCase()) ??
    [];

  if (!user || !adminEmails.includes(user.email?.toLowerCase() ?? "")) {
    redirect("/app");
  }

  const links = [
    { href: "/dashboard/admin/users", label: "Users" },
    { href: "/dashboard/admin/invite", label: "Redeem Sensay Invite" },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="mb-8 flex flex-wrap gap-4 rounded-xl bg-muted/40 p-4 shadow-sm backdrop-blur-sm">
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-accent/30",
              href === `/dashboard/admin${decodeURIComponent(
                (await import("next/navigation")).usePathname?.() ?? "",
              )}` && "bg-accent/50",
            )}
          >
            {label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}