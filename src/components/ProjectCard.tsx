import React from "react";
import { Project } from "@/src/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Layers, FileText, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { ConfirmDialog } from "./ConfirmDialog";

interface ProjectCardProps {
  project: Project;
  onClick: (project: Project) => void;
  onDelete?: (projectId: string) => void;
}

export function ProjectCard({ project, onClick, onDelete }: ProjectCardProps) {
  // Calculate overall progress from sections that have a totalRows goal
  const sectionsWithGoal = project.sections?.filter(s => s.totalRows && s.totalRows > 0) || [];
  const sectionProgress = sectionsWithGoal.length > 0
    ? sectionsWithGoal.reduce((sum, s) => sum + Math.min((s.currentRow / s.totalRows!) * 100, 100), 0) / sectionsWithGoal.length
    : null;

  // Fallback to project-level progress if no section goals defined
  const progress = sectionProgress ?? (project.totalRows ? (project.currentRow / project.totalRows) * 100 : null);

  const doneSections = project.sections?.filter(s => s.totalRows && s.currentRow >= s.totalRows).length || 0;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onClick={() => onClick(project)}
      className="cursor-pointer"
    >
      <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow bg-white">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-2xl font-serif text-primary">{project.name}</CardTitle>
            <Badge variant={project.status === 'active' ? 'default' : 'secondary'} className="rounded-full">
              {project.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Layers className="w-4 h-4" />
              <span>{project.sections?.length || 0} sections</span>
            </div>
            {doneSections > 0 && (
              <div className="flex items-center gap-1 text-green-600">
                <span className="text-xs font-medium">{doneSections} done</span>
              </div>
            )}
          </div>

          {progress !== null ? (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-muted-foreground">Progress</span>
                <span className={progress >= 100 ? 'text-green-600' : 'text-primary'}>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">Add row goals to sections to track progress</p>
          )}
          
          {project.patternUrl && (
            <div className="flex items-center gap-2 text-xs text-primary/60">
              <FileText className="w-3 h-3" />
              <span className="truncate">Pattern attached</span>
            </div>
          )}
        </CardContent>
        <CardFooter className="bg-accent/10 py-3 flex justify-between items-center pr-2">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Updated {new Date(project.updatedAt).toLocaleDateString()}
          </span>
          <div className="flex items-center">
            {onDelete && (
              <ConfirmDialog
                title="Delete Project"
                description={`Are you sure you want to delete "${project.name}"? This action cannot be undone.`}
                confirmLabel="Delete"
                onConfirm={() => onDelete(project.id)}
              >
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive mr-1 rounded-full">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </ConfirmDialog>
            )}
            <ChevronRight className="w-4 h-4 text-primary mr-2" />
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
