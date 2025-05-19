"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";

import { Check, ChevronDown, ChevronUp, Search } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type User = {
  id: string;
  email: string | null;
  username: string | null;
  credits: number;
};

interface Props {
  users: User[];
  total: number;
  currentPage: number;
  pageSize: number;
  query: string;
  sortField: string;
  sortDirection: "asc" | "desc";
  updateCredits: (formData: FormData) => Promise<void>;
}

export default function UserTable({
  users,
  total,
  currentPage,
  pageSize,
  query,
  sortField,
  sortDirection,
  updateCredits,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();

  // Compute total pages
  const totalPages = Math.ceil(total / pageSize);

  // Memoise query builder
  const buildQuery = useMemo(
    () =>
      (overrides: Record<string, string | number | undefined> = {}) => {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          pageSize: pageSize.toString(),
          q: query,
          sort: sortField,
          dir: sortDirection,
        });
        Object.entries(overrides).forEach(([k, v]) => {
          if (v === undefined || v === "") {
            params.delete(k);
          } else {
            params.set(k, String(v));
          }
        });
        return `${pathname}?${params.toString()}`;
      },
    [currentPage, pageSize, query, sortField, sortDirection, pathname],
  );

  // Handle client-side search submit to preserve SSR path
  const handleSearch = (formData: FormData) => {
    const q = formData.get("q") as string;
    router.push(buildQuery({ q, page: 1 }));
  };

  // Helper to flip sort direction
  const nextDir = (field: string) =>
    sortField === field && sortDirection === "asc" ? "desc" : "asc";

  return (
    <Card className="border-secondary/40 bg-card/70 shadow-sm backdrop-blur-sm">
      <CardHeader className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-lg font-semibold">Users ({total})</CardTitle>

        {/* Search */}
        <form action={handleSearch} className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="q"
            placeholder="Search email or username…"
            defaultValue={query}
            className="pl-9"
          />
        </form>
      </CardHeader>

      <CardContent>
        <ScrollArea className="max-h-[70vh]">
          <Table className="min-w-full text-sm">
            <TableHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur">
              <TableRow>
                {[
                  { key: "username", label: "User" },
                  { key: "email", label: "Email" },
                  { key: "credits", label: "Credits" },
                ].map(({ key, label }) => (
                  <TableHead key={key} className="px-4 py-3">
                    <Link
                      href={buildQuery({
                        sort: key,
                        dir: nextDir(key),
                        page: 1,
                      })}
                      className="inline-flex items-center gap-1 hover:underline"
                    >
                      {label}
                      {sortField === key &&
                        (sortDirection === "asc" ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        ))}
                    </Link>
                  </TableHead>
                ))}
                <TableHead className="px-4 py-3">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {users.map((user) => (
                <TableRow
                  key={user.id}
                  className="hover:bg-muted/40 transition-colors"
                >
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback>
                          {user.username?.[0]?.toUpperCase() ??
                            user.email?.[0]?.toUpperCase() ??
                            "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate capitalize max-w-[12rem]">
                        {user.username ?? "—"}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="px-4 py-3 break-all">
                    {user.email}
                  </TableCell>

                  <TableCell className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground shadow">
                      {user.credits}
                    </span>
                  </TableCell>

                  <TableCell className="px-4 py-3">
                    <form
                      action={updateCredits}
                      className="flex items-center gap-2"
                    >
                      <input type="hidden" name="userId" value={user.id} />
                      <Input
                        type="number"
                        name="credits"
                        min="0"
                        defaultValue={user.credits}
                        className="h-8 w-24"
                      />
                      <Button
                        type="submit"
                        size="icon"
                        variant="outline"
                        className="h-8 w-8"
                      >
                        <Check className="h-4 w-4" />
                        <span className="sr-only">Save</span>
                      </Button>
                    </form>
                  </TableCell>
                </TableRow>
              ))}

              {users.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-6 text-center text-muted-foreground"
                  >
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination className="mt-6">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href={
                    currentPage > 1
                      ? buildQuery({ page: currentPage - 1 })
                      : undefined
                  }
                  aria-disabled={currentPage === 1}
                />
              </PaginationItem>

              <PaginationItem>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
              </PaginationItem>

              <PaginationItem>
                <PaginationNext
                  href={
                    currentPage < totalPages
                      ? buildQuery({ page: currentPage + 1 })
                      : undefined
                  }
                  aria-disabled={currentPage === totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </CardContent>
    </Card>
  );
}
