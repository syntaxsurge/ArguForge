"use client";

import { createContext, useContext, useEffect, useState } from "react";

import { createBrowserClient } from "@/lib/supabase";

type UserProfile = {
  id: string;
  name: string | null;
  email: string;
  avatar_url: string | null;
};

type UserContextType = {
  userProfile: UserProfile | null;
  loading: boolean;
};

const UserContext = createContext<UserContextType>({
  userProfile: null,
  loading: true,
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const supabase = createBrowserClient();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          setUserProfile({
            id: user.id,
            name: user.user_metadata.name || null,
            email: user.email!,
            avatar_url: user.user_metadata.avatar_url || null,
          });
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setUserProfile({
          id: session.user.id,
          name: session.user.user_metadata.name || null,
          email: session.user.email!,
          avatar_url: session.user.user_metadata.avatar_url || null,
        });
      } else if (event === "SIGNED_OUT") {
        setUserProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <UserContext.Provider value={{ userProfile, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
