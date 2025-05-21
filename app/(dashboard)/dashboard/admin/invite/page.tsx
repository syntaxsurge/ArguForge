import { redirect } from "next/navigation";
import { Suspense } from "react";

import type { Metadata } from "next";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { redeemInviteAction } from "@/lib/actions/admin-sensay";
import { createServerClient } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Redeem Sensay Invite • ArguForge",
};

interface FormProps {
  searchParams: Record<string, string | string[] | undefined>;
}

/**
 * Ensure only authenticated admins may access the page.
 * The assert logic is shared with existing admin handlers.
 */
async function assertAdminServerSide() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const adminEmails =
    process.env.ADMIN_EMAILS?.split(",").map((e) => e.trim().toLowerCase()) ??
    [];

  if (!user || !adminEmails.includes(user.email?.toLowerCase() ?? "")) {
    redirect("/app"); // fallback to dashboard root
  }

  return user;
}

export default async function RedeemInvitePage({ searchParams }: FormProps) {
  await assertAdminServerSide();

  const status = typeof searchParams.status === "string" ? searchParams.status : "";

  return (
    <main className="container mx-auto max-w-xl py-8">
      <Card className="border-secondary/40 bg-card/70 shadow-lg backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Redeem Sensay Invitation
          </CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="py-6">
          {status === "success" && (
            <div className="mb-6 rounded-lg border border-emerald-400 bg-emerald-50 p-4 text-emerald-700">
              Invitation redeemed and credentials stored successfully.
            </div>
          )}
          {status === "error" && (
            <div className="mb-6 rounded-lg border border-red-400 bg-red-50 p-4 text-red-700">
              Could not redeem invite – please verify the code and try again.
            </div>
          )}

          <Suspense>
            <form action={redeemInviteAction} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="inviteCode" className="font-medium">
                  Invite Code
                </label>
                <Input
                  id="inviteCode"
                  name="inviteCode"
                  required
                  placeholder="ABCDEF123456"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="organizationName" className="font-medium">
                  Organisation Name
                </label>
                <Input
                  id="organizationName"
                  name="organizationName"
                  required
                  placeholder="Your Organisation Ltd."
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="contactName" className="font-medium">
                  Contact Name
                </label>
                <Input
                  id="contactName"
                  name="contactName"
                  required
                  placeholder="Jane Doe"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="contactEmail" className="font-medium">
                  Contact Email
                </label>
                <Input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  required
                  placeholder="jane@example.com"
                />
              </div>

              <Button type="submit" className="w-full">
                Redeem Invite
              </Button>
            </form>
          </Suspense>
        </CardContent>
      </Card>
    </main>
  );
}