import { redirect } from "next/navigation";

import SiteHeader from "@/components/site-header";
import { createServerClient } from "@/lib/supabase";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div>
      <SiteHeader />
      <div className="px-4 container mx-auto">{children}</div>
    </div>
  );
}