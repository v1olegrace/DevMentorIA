import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export const useProjects = (userId: string | undefined) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      setProjects(data || []);
    } catch (error: unknown) {
      const message = 'Erro ao carregar projetos';
      console.error(message, error);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const createProject = async (name: string, description?: string, isPublic: boolean = false) => {
    if (!userId) return { data: null, error: new Error('Usuario nao autenticado') };

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          user_id: userId,
          name,
          description,
          is_public: isPublic
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Projeto criado com sucesso!');
      await fetchProjects();
      return { data, error: null };
    } catch (error: unknown) {
      const message = 'Erro ao criar projeto';
      console.error(message, error);
      toast.error(message);
      return { data: null, error: error instanceof Error ? error : new Error(message) };
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast.success('Projeto atualizado!');
      await fetchProjects();
      return { data, error: null };
    } catch (error: unknown) {
      const message = 'Erro ao atualizar projeto';
      console.error(message, error);
      toast.error(message);
      return { data: null, error: error instanceof Error ? error : new Error(message) };
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Projeto removido!');
      await fetchProjects();
      return { error: null };
    } catch (error: unknown) {
      const message = 'Erro ao remover projeto';
      console.error(message, error);
      toast.error(message);
      return { error: error instanceof Error ? error : new Error(message) };
    }
  };

  return {
    projects,
    loading,
    createProject,
    updateProject,
    deleteProject,
    refetch: fetchProjects
  };
};

