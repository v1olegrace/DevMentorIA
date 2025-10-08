import { useState } from "react";
import { useProjects, Project } from "@/hooks/useProjects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Folder, Trash2, Edit } from "lucide-react";

interface ProjectsListProps {
  userId: string;
  onSelectProject: (project: Project) => void;
}

const ProjectsList = ({ userId, onSelectProject }: ProjectsListProps) => {
  const { projects, loading, createProject, deleteProject } = useProjects(userId);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await createProject(projectName, projectDescription);
    if (!error) {
      setIsCreateOpen(false);
      setProjectName("");
      setProjectDescription("");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Meus Projetos</h3>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Novo Projeto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Projeto</DialogTitle>
              <DialogDescription>
                Organize seu código em projetos para melhor gerenciamento
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="project-name">Nome do Projeto</Label>
                <Input
                  id="project-name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Meu Projeto"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project-description">Descrição (opcional)</Label>
                <Textarea
                  id="project-description"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="Breve descrição do projeto..."
                  rows={3}
                />
              </div>
              <Button type="submit" className="w-full">
                Criar Projeto
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <Folder className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">
              Nenhum projeto criado ainda. Crie seu primeiro projeto para organizar seu código!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => onSelectProject(project)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Folder className="w-5 h-5 text-primary" />
                    <CardTitle className="text-base">{project.name}</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteProject(project.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                {project.description && (
                  <CardDescription className="text-xs">
                    {project.description}
                  </CardDescription>
                )}
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectsList;
