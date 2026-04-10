import React, { useState } from "react";
import { Dialog as ShadDialog, DialogContent as ShadDialogContent, DialogHeader as ShadDialogHeader, DialogTitle as ShadDialogTitle, DialogDescription as ShadDialogDescription, DialogFooter as ShadDialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2 } from "lucide-react";
import { Project } from "@/src/types";

interface CreateProjectDialogProps {
  onCreate: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'status'>, file?: File | null) => Promise<void>;
}

export function CreateProjectDialog({ onCreate }: CreateProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [totalRows, setTotalRows] = useState("");
  const [patternUrl, setPatternUrl] = useState("");
  const [patternFile, setPatternFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    
    try {
      await onCreate({
        name,
        description,
        currentRow: 0,
        totalRows: totalRows ? parseInt(totalRows) : undefined,
        sections: [],
        patternUrl: patternUrl || undefined,
      }, patternFile);
      
      setOpen(false);
      // Reset form
      setName("");
      setDescription("");
      setTotalRows("");
      setPatternUrl("");
      setPatternFile(null);
    } catch (error) {
       console.error("Error creating project", error);
       alert("Failed to create project. Check console.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <ShadDialog open={open} onOpenChange={(val) => !uploading && setOpen(val)}>
      <Button onClick={() => setOpen(true)} className="rounded-full px-8 shadow-md hover:shadow-lg transition-all duration-300">
        <Plus className="mr-2 h-5 w-5" /> New Project
      </Button>
      <ShadDialogContent className="sm:max-w-[480px] rounded-[2rem] border-2 border-accent p-8 shadow-2xl bg-white text-foreground">
        <ShadDialogHeader className="mb-4 text-left">
          <ShadDialogTitle className="text-3xl font-serif text-primary">Start New Project</ShadDialogTitle>
          <ShadDialogDescription className="text-base text-muted-foreground">
            Configure the details of your next crafty masterpiece.
          </ShadDialogDescription>
        </ShadDialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold ml-1 text-primary/80">Project Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Winter Scarf" disabled={uploading} required className="rounded-2xl border-2 border-accent/60 focus:border-primary/50 bg-slate-50 h-12 shadow-sm transition-all text-base text-foreground" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold ml-1 text-primary/80">Description (Optional)</Label>
            <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Using merino wool" disabled={uploading} className="rounded-2xl border-2 border-accent/60 focus:border-primary/50 bg-slate-50 h-12 shadow-sm transition-all text-base text-foreground" />
          </div>
          
          <div className="space-y-4 pt-2">
             <div className="space-y-2">
                <Label htmlFor="patternUrl" className="text-sm font-semibold ml-1 text-primary/80">Pattern Link (URL)</Label>
                <Input id="patternUrl" value={patternUrl} onChange={(e) => setPatternUrl(e.target.value)} placeholder="https://..." disabled={!!patternFile || uploading} className="rounded-2xl border-2 border-accent/60 focus:border-primary/50 bg-slate-50 h-12 shadow-sm transition-all text-base text-foreground" />
             </div>
             
             <div className="flex items-center gap-4">
               <div className="h-px bg-accent/30 flex-1"></div>
               <span className="text-[10px] text-muted-foreground/60 uppercase font-black tracking-[0.2em]">OR</span>
               <div className="h-px bg-accent/30 flex-1"></div>
             </div>
             
             <div className="space-y-2">
                <Label htmlFor="patternFile" className="text-sm font-semibold ml-1 text-primary/80">Upload PDF Pattern</Label>
                <div className={`relative rounded-3xl border-2 border-dashed h-20 flex items-center px-5 transition-all duration-300 ${patternFile ? 'border-primary/50 bg-primary/5 shadow-inner' : 'border-accent/80 hover:border-primary/30 bg-slate-50'}`}>
                   <input 
                      id="patternFile" 
                      type="file" 
                      accept=".pdf" 
                      onChange={(e) => setPatternFile(e.target.files?.[0] || null)} 
                      disabled={!!patternUrl || uploading} 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10" 
                    />
                   <div className="flex items-center gap-3 w-full pointer-events-none">
                     <div className="bg-white p-2.5 rounded-xl shadow-sm border border-accent">
                        <Plus className={`w-5 h-5 ${patternFile ? 'text-primary' : 'text-muted-foreground'}`} />
                     </div>
                     <span className={`text-sm truncate pr-2 ${patternFile ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                        {patternFile ? patternFile.name : 'Choose a PDF file...'}
                     </span>
                   </div>
                </div>
             </div>
          </div>

          <ShadDialogFooter className="pt-2">
            <Button type="submit" disabled={uploading} className="w-full rounded-2xl h-14 text-lg font-serif shadow-lg shadow-primary/20 hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]">
              {uploading ? (
                 <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Finalizing Layout...</>
              ) : (
                 "Create Project"
              )}
            </Button>
          </ShadDialogFooter>
        </form>
      </ShadDialogContent>
    </ShadDialog>
  );
}
