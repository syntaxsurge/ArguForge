import { redirect } from "next/navigation";

import type { Metadata } from "next";

import UserTable from "@/components/admin/user-table";
import { listUsersPaginated, updateUserCredits } from "@/lib/actions/admin";
import { createServerClient } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "User Management • ArguForge",
};

interface PageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

/* ------------------------------------------------------------------ *
 *  Server action: update a user's credit balance                     *
 * ------------------------------------------------------------------ */
async function updateCreditsAction(formData: FormData) {
  "use server";

  const userId = formData.get("userId") as string;
  const creditsRaw = formData.get("credits") as string;
  const credits = Number.parseInt(creditsRaw, 10);

  if (Number.isNaN(credits) || credits < 0) {
    throw new Error("Credits must be a non-negative number");
  }

  await updateUserCredits(userId, credits);
}

/* ------------------------------------------------------------------ *
 *  Page component                                                     *
 * ------------------------------------------------------------------ */
export default async function AdminUsersPage({ searchParams }: PageProps) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Extract & sanitise query params
  const page = Number(searchParams.page ?? 1);
  const pageSize = Number(searchParams.pageSize ?? 20);
  const search = typeof searchParams.q === "string" ? searchParams.q : "";
  const sortField =
    typeof searchParams.sort === "string"
      ? (searchParams.sort as "username" | "email" | "credits" | "updatedAt")
      : "updatedAt";
  const sortDirection =
    searchParams.dir === "asc" ? "asc" : ("desc" as "asc" | "desc");

  // Fetch paginated data
  const { profiles, total } = await listUsersPaginated({
    page,
    pageSize,
    search,
    sortField,
    sortDirection,
  });

  return (
    <main className="container max-w-6xl space-y-8 py-8">
      <h1 className="text-3xl font-bold">User Management</h1>
      <UserTable
        users={profiles}
        total={total}
        currentPage={page}
        pageSize={pageSize}
        query={search}
        sortField={sortField}
        sortDirection={sortDirection}
        updateCredits={updateCreditsAction}
      />
    </main>
  );
}
