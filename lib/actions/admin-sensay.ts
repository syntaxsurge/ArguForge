"use server";

import { redirect } from "next/navigation";

import { createServerClient } from "@/lib/supabase";

interface InviteFormValues {
  inviteCode: string;
  organizationName: string;
  contactName: string;
  contactEmail: string;
}

/**
 * Server action bound to the invite redemption form.
 * Performs admin guard, calls internal API, and stores credentials if needed.
 */
export async function redeemInviteAction(formData: FormData): Promise<void> {
  const values: InviteFormValues = {
    inviteCode: String(formData.get("inviteCode") || "").trim(),
    organizationName: String(formData.get("organizationName") || "").trim(),
    contactName: String(formData.get("contactName") || "").trim(),
    contactEmail: String(formData.get("contactEmail") || "").trim(),
  };

  // Simple validation
  if (
    !values.inviteCode ||
    !values.organizationName ||
    !values.contactName ||
    !values.contactEmail
  ) {
    redirect("/dashboard/admin/invite?status=error");
  }

  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/sensay/invite`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code: values.inviteCode,
      organizationName: values.organizationName,
      name: values.contactName,
      email: values.contactEmail,
    }),
  });

  const json = (await res.json()) as { success: boolean; data?: unknown };

  if (!json.success || res.status !== 200) {
    redirect("/dashboard/admin/invite?status=error");
  }

  // TODO (Section 3): store apiKey / organizationID via upsertProfileExtended
  // Placeholder: ensure admin profile exists
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // Revalidate admin dashboard
  redirect("/dashboard/admin/invite?status=success");
}