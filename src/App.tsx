/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { supabase, signIn, logOut } from "./supabase";
import { User } from "@supabase/supabase-js";
import { Project, Section } from "./types";
import { projectService } from "./services/projectService";
import { ProjectCard } from "./components/ProjectCard";
import { RowCounter } from "./components/RowCounter";
import { CreateProjectDialog } from "./components/CreateProjectDialog";
import { SectionManager } from "./components/SectionManager";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LogOut, ChevronLeft, Scissors, Heart, Hash, ExternalLink, FileText, RotateCcw, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { EditProjectDialog } from "./components/EditProjectDialog";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeSection, setActiveSection] = useState<Section | null>(null);
  
  const [quickCounterOpen, setQuickCounterOpen] = useState(false);
  const [quickCounterValue, setQuickCounterValue] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem("quickCounterValue");
    if (saved) setQuickCounterValue(parseInt(saved, 10));
  }, []);

  const updateQuickCounter = (val: number) => {
    setQuickCounterValue(val);
    localStorage.setItem("quickCounterValue", val.toString());
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const unsubscribe = projectService.subscribeToProjects(user.id, (data) => {
        setProjects(data);
        if (selectedProject) {
          const updated = data.find(p => p.id === selectedProject.id);
          if (updated) {
            setSelectedProject(updated);
            if (activeSection) {
              const updatedSection = updated.sections.find(s => s.id === activeSection.id);
              if (updatedSection) setActiveSection(updatedSection);
            }
          }
        }
      });
      return () => unsubscribe();
    } else {
      setProjects([]);
    }
  }, [user, selectedProject?.id, activeSection?.id]);

  const handleCreateProject = async (projectData: any, patternFile?: File | null) => {
    if (user) {
      let finalUrl = projectData.patternUrl;
      if (patternFile) {
        finalUrl = await projectService.uploadPattern(patternFile, user.id);
      }
      await projectService.createProject(user.id, { ...projectData, patternUrl: finalUrl });
    }
  };

  const handleUpdateSections = async (sections: Section[]) => {
    if (selectedProject) {
      await projectService.updateProject(selectedProject.id, { sections });
    }
  };

  const handleUpdateSectionRow = async (newRow: number) => {
    if (selectedProject && activeSection) {
      const updatedSections = selectedProject.sections.map(s => 
        s.id === activeSection.id ? { ...s, currentRow: newRow } : s
      );
      
      // Optimistic updates — both must fire before the await so the UI
      // never waits on the network round-trip to Supabase.
      setActiveSection(prev => prev ? { ...prev, currentRow: newRow } : null);
      setSelectedProject(prev => prev ? { ...prev, sections: updatedSections } : null);
      
      await projectService.updateProject(selectedProject.id, { sections: updatedSections });
    }
  };

  const handleFinishProject = async () => {
    if (selectedProject) {
      await projectService.updateProject(selectedProject.id, { status: 'finished' });
      setSelectedProject(null);
      setActiveSection(null);
    }
  };

  const handleRestartProject = async () => {
    if (selectedProject) {
      const resetSections = selectedProject.sections.map(s => ({ ...s, currentRow: 0 }));
      
      // Optimistic state update
      setSelectedProject(prev => prev ? { ...prev, sections: resetSections, status: 'active' } : null);
      
      await projectService.updateProject(selectedProject.id, { 
        sections: resetSections,
        status: 'active' 
      });
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    await projectService.deleteProject(projectId);
    if (selectedProject?.id === projectId) {
      setSelectedProject(null);
      setActiveSection(null);
    }
  };

  const handleBack = () => {
    if (quickCounterOpen) {
      setQuickCounterOpen(false);
    } else if (activeSection) {
      setActiveSection(null);
    } else if (selectedProject) {
      setSelectedProject(null);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-primary/20 rounded-full" />
          <p className="font-serif text-lg text-primary/60">Warming up the needles...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center space-y-8"
        >
          <div className="space-y-2">
            <h1 className="text-6xl font-serif font-bold text-primary">KnitTrack</h1>
            <p className="text-muted-foreground text-lg">Your cozy companion for every stitch and row.</p>
          </div>
          
          <div className="relative aspect-square w-64 mx-auto bg-primary/5 rounded-full flex items-center justify-center">
            <Scissors className="w-32 h-32 text-primary/20 rotate-45" />
            <Heart className="absolute bottom-12 right-12 w-8 h-8 text-primary/40" />
          </div>

          <Button onClick={signIn} size="lg" className="w-full h-14 rounded-2xl text-lg font-serif">
            Sign in with Google
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-background flex flex-col overflow-hidden">
      <header className="p-4 md:p-6 flex justify-between items-center bg-white/50 backdrop-blur-sm border-b border-accent/20 z-10 sticky top-0">
        <div className="flex items-center gap-2">
          {(selectedProject || quickCounterOpen) && (
            <Button variant="ghost" size="icon" onClick={handleBack} className="rounded-full mr-1 md:mr-2">
              <ChevronLeft className="w-6 h-6" />
            </Button>
          )}
          <h1 className="text-xl md:text-3xl font-serif font-bold text-primary flex items-center gap-2 truncate max-w-[130px] sm:max-w-xs md:max-w-none">
            {quickCounterOpen 
              ? "Quick Counter" 
              : activeSection 
                ? activeSection.name 
                : selectedProject 
                  ? selectedProject.name 
                  : "My Projects"}
          </h1>
          {selectedProject && !activeSection && !quickCounterOpen && (
            <div className="flex items-center gap-0.5 md:gap-1">
              {selectedProject.patternUrl && (
                <Button variant="ghost" size="sm" onClick={() => window.open(selectedProject.patternUrl, '_blank')} className="text-muted-foreground hover:bg-black/5 rounded-full px-2 md:px-3 h-9 flex">
                  <FileText className="w-4 h-4 md:mr-1" />
                  <span className="hidden md:inline">Pattern</span>
                </Button>
              )}

              <EditProjectDialog
                project={selectedProject}
                onSave={async (updates, file) => {
                  let finalUpdates = { ...updates };
                  if (file) {
                    const fileUrl = await projectService.uploadPattern(file, user!.id);
                    finalUpdates.patternUrl = fileUrl;
                  }
                  await projectService.updateProject(selectedProject.id, finalUpdates);
                  setSelectedProject(prev => prev ? { ...prev, ...finalUpdates } : null);
                }}
              />
              
              <Button onClick={handleFinishProject} variant="ghost" size="sm" className={`rounded-full px-2 md:px-3 h-9 transition-all ${selectedProject.status === 'finished' ? 'text-green-600 bg-green-50 hover:bg-green-100' : 'text-muted-foreground hover:bg-black/5'}`}>
                 {selectedProject.status === 'finished' 
                   ? <CheckCircle2 className="w-4 h-4 md:mr-1" /> 
                   : <CheckCircle2 className="w-4 h-4 md:mr-1 opacity-50" />}
                 <span className="hidden md:inline">{selectedProject.status === 'finished' ? 'Finished!' : 'Finish'}</span>
              </Button>

              <ConfirmDialog
                title="Restart Project"
                description="This will reset all your row counts for every section in this project back to zero. This action cannot be undone."
                confirmLabel="Restart"
                onConfirm={handleRestartProject}
              >
                <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground hover:bg-orange-50 hover:text-orange-600 px-2 md:px-3 h-9">
                  <RotateCcw className="w-4 h-4 md:mr-1" />
                  <span className="hidden md:inline">Restart</span>
                </Button>
              </ConfirmDialog>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          {!selectedProject && !quickCounterOpen && (
             <>
               <Button onClick={() => setQuickCounterOpen(true)} variant="secondary" className="rounded-full hidden md:flex">
                 <Hash className="w-4 h-4 mr-2" /> Quick Counter
               </Button>
               <Button onClick={() => setQuickCounterOpen(true)} variant="secondary" size="icon" className="rounded-full md:hidden">
                 <Hash className="w-4 h-4" />
               </Button>
               <CreateProjectDialog onCreate={handleCreateProject} />
             </>
          )}
          <Button variant="ghost" size="icon" onClick={logOut} className="rounded-full text-muted-foreground">
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto relative bg-accent/5">
        <AnimatePresence mode="wait">
          {quickCounterOpen ? (
             <motion.div
              key="quick"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="h-full flex items-center justify-center pt-8"
            >
              <RowCounter 
                title="Counter"
                subtitle="Just counting, no strings attached! 🧶"
                currentRow={quickCounterValue}
                onUpdateRow={updateQuickCounter}
              />
            </motion.div>
          ) : !selectedProject ? (
            <motion.div
              key="list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full p-4 md:p-8"
            >
              {projects.length === 0 ? (
                <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                  <Scissors className="w-16 h-16" />
                  <p className="font-serif text-xl">No projects yet. Start your first one!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                  {projects.map((project) => (
                    <div key={project.id}>
                      <ProjectCard 
                        project={project} 
                        onClick={setSelectedProject} 
                        onDelete={handleDeleteProject}
                      />
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : activeSection ? (
            <motion.div
              key="counter"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full flex flex-col p-4"
            >
               <ScrollArea className="flex-1">
                 <RowCounter 
                    title={activeSection.name}
                    subtitle={selectedProject.name}
                    currentRow={activeSection.currentRow}
                    totalRows={activeSection.totalRows}
                    section={activeSection}
                    onUpdateRow={handleUpdateSectionRow}
                 />
               </ScrollArea>
            </motion.div>
          ) : (
            <motion.div
              key="sections"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full"
            >
              <SectionManager 
                project={selectedProject} 
                onUpdateSections={handleUpdateSections} 
                onSelectSection={setActiveSection}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      <footer className="p-4 bg-background text-center text-[10px] uppercase tracking-[0.2em] text-muted-foreground/40 pointer-events-none">
        Crafted with care &bull; KnitTrack &copy; 2026
      </footer>
    </div>
  );
}
