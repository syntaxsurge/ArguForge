import * as supabase from "@supabase/ssr";

/**
 * Create a Supabase client for the browser.
 * Safe to import in client components and hooks.
 */
export function createBrowserClient() {
  return supabase.createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

/**
 * Create a Supabase client for the server.
 * `next/headers` is imported dynamically so this file remains
 * compatible with client bundles while still using cookies on the server.
 */
export async function createServerClient() {
  const { cookies } = await import("next/headers");
  // `cookies()` is async as of Next 15, so we await and cast for mutating helpers.
  const cookieStore = (await cookies()) as any;

  return supabase.createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            try {
              cookieStore.set?.(name, value, options);
            } catch {
              /* no-op when cookies are read-only (e.g., in RSC) */
            }
          });
        },
      },
    },
  );
}
