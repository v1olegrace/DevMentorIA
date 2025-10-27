import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { toast } from "sonner";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: name
          }
        }
      });

      if (error) throw error;

      toast.success("Conta criada com sucesso!");
      return { data, error: null };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error("Erro ao criar conta");
      console.error("Erro no signup:", err);
      toast.error(err.message || "Erro ao criar conta");
      return { data: null, error: err };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success("Login realizado com sucesso!");
      return { data, error: null };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error("Erro ao fazer login");
      console.error("Erro no signin:", err);
      toast.error(err.message || "Erro ao fazer login");
      return { data: null, error: err };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast.success("Logout realizado com sucesso!");
      return { error: null };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error("Erro ao fazer logout");
      console.error("Erro no signout:", err);
      toast.error(err.message || "Erro ao fazer logout");
      return { error: err };
    }
  };

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  };
};

