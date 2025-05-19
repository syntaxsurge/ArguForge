import { redirect } from "next/navigation";

import { MainHeader } from "@/components/navigation/main-header";
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
      <MainHeader user={user} />
      <div className="px-4 container mx-auto">{children}</div>
    </div>
  );
}
