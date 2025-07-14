import { useState, useEffect, useCallback } from "react";
import { supabase } from "@utils/supabaseClient";
import { User } from "@/types";
import { getUserInitials } from "@utils/stringUtils";

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const processAndSetUser = useCallback(async (sessionUser: unknown | null) => {
    if (!sessionUser) {
      setCurrentUser(null);
      return;
    }

    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("role, name, email, photo_url")
        .eq("id", sessionUser.id)
        .single();

      let appUser: User;
      if (profileError && profileError.code !== "PGRST116") {
        // PGRST116: row not found
        console.warn(
          "Error fetching user profile:",
          profileError.message,
          "- falling back to session metadata.",
        );
        const nameFromMeta =
          sessionUser.user_metadata?.name || sessionUser.email || "User";
        appUser = {
          id: sessionUser.id,
          email: sessionUser.email,
          name: nameFromMeta,
          role: sessionUser.user_metadata?.role || "user",
          photoUrl: sessionUser.user_metadata?.photoUrl,
          initials: getUserInitials(nameFromMeta),
        };
      } else {
        const profileName =
          profileData?.name || sessionUser.user_metadata?.name;
        const profileEmail = profileData?.email || sessionUser.email;
        appUser = {
          id: sessionUser.id,
          email: profileEmail,
          name: profileName || sessionUser.email || "User",
          role: profileData?.role || sessionUser.user_metadata?.role || "user",
          photoUrl:
            profileData?.photo_url || sessionUser.user_metadata?.photoUrl,
          initials: getUserInitials(profileName || profileEmail || "User"),
        };
      }
      setCurrentUser(appUser);
    } catch (e) {
      console.error("Critical error processing user session and profile:", e);
      // Fallback to basic info from sessionUser if profile fetch critically fails
      const nameFromMeta =
        sessionUser.user_metadata?.name || sessionUser.email || "User";
      setCurrentUser({
        id: sessionUser.id,
        email: sessionUser.email,
        name: nameFromMeta,
        role: sessionUser.user_metadata?.role || "user",
        photoUrl: sessionUser.user_metadata?.photoUrl,
        initials: getUserInitials(nameFromMeta),
      });
    }
  }, []);

  useEffect(() => {
    // This effect runs once on mount to check initial session and set up listener.
    setIsLoadingAuth(true);

    const checkInitialSession = async () => {
      try {
        const {
          data: { session: initialSession },
          error: initialSessionError,
        } = await supabase.auth.getSession();
        if (initialSessionError) {
          console.error(
            "Error fetching initial session:",
            initialSessionError.message,
          );
        }
        await processAndSetUser(initialSession?.user || null);
      } catch (e) {
        console.error("Error during initial session check:", e);
        setCurrentUser(null); // Ensure currentUser is null if check fails critically
      } finally {
        // This ensures loading is set to false after the initial check attempts to complete.
        // This is a safeguard if onAuthStateChange's INITIAL_SESSION event is missed or delayed.
        setIsLoadingAuth(false);
      }
    };

    checkInitialSession();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        await processAndSetUser(session?.user || null);
        // Ensure isLoadingAuth is false on definitive auth events.
        // It might already be false due to checkInitialSession's finally block,
        // but this handles subsequent events and ensures correctness.
        if (
          event === "INITIAL_SESSION" ||
          event === "SIGNED_IN" ||
          event === "SIGNED_OUT" ||
          event === "USER_DELETED" ||
          event === "PASSWORD_RECOVERY"
        ) {
          setIsLoadingAuth(false);
        }
      },
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [processAndSetUser]); // processAndSetUser is stable due to useCallback

  const logout = useCallback(async () => {
    // isLoadingAuth will be handled by the 'SIGNED_OUT' event in onAuthStateChange
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error);
    }
  }, []);

  return { currentUser, isLoadingAuth, logout };
};
