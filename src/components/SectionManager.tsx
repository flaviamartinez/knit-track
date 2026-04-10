import React, { useState } from "react";
import { Section, Project } from "@/src/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Edit2, Check, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ConfirmDialog } from "./ConfirmDialog";

interface SectionManagerProps {
  project: Project;
  onUpdateSections: (sections: Section[]) => void;
  onSelectSection: (section: Section) => void;
}

export function SectionManager({ project, onUpdateSections, onSelectSection }: SectionManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [totalRows, setTotalRows] = useState("");
  const [stitches, setStitches] = useState("20");
  const [shapingType, setShapingType] = useState<'increase' | 'decrease' | 'none'>('none');
  const [shapingFreq, setShapingFreq] = useState("4");

  const resetForm = () => {
    setName("");
    setDescription("");
    setTotalRows("");
    setStitches("20");
    setShapingType('none');
    setShapingFreq("4");
    setIsAdding(false);
    setEditingId(null);
  };

  const handleAddOrUpdate = () => {
    const newSection: Section = {
      id: editingId || Math.random().toString(36).substr(2, 9),
      name,
      description: description || undefined,
      totalRows: totalRows ? parseInt(totalRows) : undefined,
      currentRow: editingId ? project.sections.find(s => s.id === editingId)?.currentRow || 0 : 0,
      startingStitches: parseInt(stitches),
      shaping: {
        type: shapingType,
        frequency: parseInt(shapingFreq),
        amount: 1,
      }
    };

    let updatedSections;
    if (editingId) {
      updatedSections = project.sections.map(s => s.id === editingId ? newSection : s);
    } else {
      updatedSections = [...project.sections, newSection];
    }
    
    onUpdateSections(updatedSections);
    resetForm();
  };

  const handleEdit = (e: React.MouseEvent, section: Section) => {
    e.stopPropagation();
    setEditingId(section.id);
    setName(section.name);
    setDescription(section.description || "");
    setTotalRows(section.totalRows?.toString() || "");
    setStitches(section.startingStitches.toString());
    setShapingType(section.shaping.type);
    setShapingFreq(section.shaping.frequency.toString());
    setIsAdding(true);
  };

  const deleteSection = (id: string) => {
    onUpdateSections(project.sections.filter(s => s.id !== id));
  };

  return (
    <div className="space-y-6 w-full h-full flex flex-col p-4 md:p-8 overflow-y-auto">
      {project.description && (
        <div className="max-w-2xl mx-auto w-full">
          <div className="bg-white/70 border border-accent/40 rounded-2xl px-5 py-4 shadow-sm">
            <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60 mb-1">About this project</p>
            <p className="text-sm text-foreground/80 leading-relaxed font-serif italic">{project.description}</p>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center max-w-2xl mx-auto w-full">
        <h3 className="text-xl font-serif font-semibold text-primary">Project Sections</h3>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} variant="outline" size="sm" className="rounded-full border-primary/20 bg-white/50">
            <Plus className="w-4 h-4 mr-1" /> Add Section
          </Button>
        )}
      </div>

      <div className="max-w-2xl mx-auto w-full pb-16">
        <AnimatePresence>
          {isAdding && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="overflow-hidden mb-8"
            >
              <Card className="border-2 border-accent shadow-xl rounded-[2rem] bg-white overflow-hidden">
                <CardHeader className="bg-white/10 py-4 px-8 border-b border-accent/30">
                  <CardTitle className="text-base font-semibold text-primary/70 uppercase tracking-widest">{editingId ? 'Edit Section' : 'New Section'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-6 pt-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2 md:col-span-2">
                       <Label className="text-sm font-semibold ml-1 text-primary/80">Section Name</Label>
                       <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Ribbing, Body, Sleeve" className="rounded-2xl border-2 border-accent/60 focus:border-primary/50 bg-accent/5 h-12 shadow-sm transition-all" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                       <Label className="text-sm font-semibold ml-1 text-primary/80">Pattern Notes <span className="text-muted-foreground font-normal normal-case tracking-normal">(Optional)</span></Label>
                       <textarea
                         value={description}
                         onChange={e => setDescription(e.target.value)}
                         placeholder="e.g. K3, P3, repeat. Cable cross every 6th row..."
                         rows={2}
                         className="w-full rounded-2xl border-2 border-accent/60 focus:border-primary/50 bg-accent/5 shadow-sm transition-all px-4 py-3 text-sm resize-none outline-none focus:ring-0 font-sans"
                       />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold ml-1 text-primary/80">Total Rows (Goal)</Label>
                      <Input type="number" value={totalRows} onChange={e => setTotalRows(e.target.value)} placeholder="Optional" className="rounded-2xl border-2 border-accent/60 focus:border-primary/50 bg-accent/5 h-12 shadow-sm transition-all" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold ml-1 text-primary/80">Starting Stitches</Label>
                      <Input type="number" value={stitches} onChange={e => setStitches(e.target.value)} className="rounded-2xl border-2 border-accent/60 focus:border-primary/50 bg-accent/5 h-12 shadow-sm transition-all" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-sm font-semibold ml-1 text-primary/80">Shaping Pattern</Label>
                      <Select value={shapingType} onValueChange={(v: any) => setShapingType(v)}>
                        <SelectTrigger className="rounded-2xl border-2 border-accent/60 focus:border-primary/50 bg-accent/5 h-12 shadow-sm transition-all text-sm font-normal text-foreground">
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent position="popper" className="rounded-xl border-2 border-accent bg-white shadow-xl min-w-[var(--radix-select-trigger-width)] w-auto">
                          <SelectItem value="none" className="text-sm font-normal">No shaping needed</SelectItem>
                          <SelectItem value="increase" className="text-sm font-normal">Increase every few rows</SelectItem>
                          <SelectItem value="decrease" className="text-sm font-normal">Decrease every few rows</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {shapingType !== 'none' && (
                      <div className="space-y-2 md:col-span-2 animate-in fade-in slide-in-from-top-2 duration-300">
                        <Label className="text-sm font-semibold ml-1 text-primary/80">Shaping Frequency (Every X rows)</Label>
                        <Input type="number" value={shapingFreq} onChange={e => setShapingFreq(e.target.value)} className="rounded-2xl border-2 border-accent/60 focus:border-primary/50 bg-accent/5 h-12 shadow-sm transition-all text-sm font-medium text-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button onClick={handleAddOrUpdate} className="flex-1 rounded-2xl h-14 text-lg font-serif shadow-lg shadow-primary/10 transition-all hover:scale-[1.02] active:scale-[0.98]">
                      <Check className="w-5 h-5 mr-2" /> {editingId ? 'Save Changes' : 'Add Section'}
                    </Button>
                    <Button onClick={resetForm} variant="ghost" className="rounded-2xl h-14 px-8 text-muted-foreground hover:bg-black/5">Cancel</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-3">
          {project.sections.length === 0 ? (
            <div className="bg-white/50 p-8 rounded-2xl border border-dashed border-accent flex flex-col items-center justify-center text-center space-y-3">
              <p className="text-muted-foreground italic font-serif">You haven't defined any sections yet.</p>
              <Button onClick={() => setIsAdding(true)} variant="outline" size="sm" className="rounded-full">
                 Create Your First Section
              </Button>
            </div>
          ) : (
            project.sections.map((section) => (
              <motion.div
                key={section.id}
                layout
                onClick={() => onSelectSection(section)}
                whileHover={{ scale: 1.01 }}
                className="bg-white py-3 px-4 rounded-2xl shadow-sm border border-primary/10 flex justify-between items-center cursor-pointer hover:border-primary/50 transition-all hover:shadow-md group"
              >
                <div>
                  <h4 className="font-serif font-bold text-primary flex items-center gap-2 text-lg">
                    {section.name} 
                    {section.totalRows && section.currentRow >= section.totalRows && (
                      <span className="text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                        <Check className="w-3 h-3" /> Done
                      </span>
                    )}
                  </h4>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                    <div className="flex items-center gap-1.5 bg-accent/30 px-2 py-0.5 rounded-md">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/70">Rows</span>
                      <span className="text-sm font-medium">
                        <strong className="text-primary">{section.currentRow}</strong>
                        {section.totalRows ? <span className="text-muted-foreground ml-1">/ {section.totalRows}</span> : ''}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1.5 bg-accent/30 px-2 py-0.5 rounded-md">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/70">Stitches</span>
                      <span className="text-sm font-medium text-primary">
                        {(() => {
                          if (section.shaping.type === 'none') return section.startingStitches;
                          const shapingOccurrences = Math.floor(section.currentRow / section.shaping.frequency);
                          const change = shapingOccurrences * section.shaping.amount;
                          return section.shaping.type === 'increase'
                            ? section.startingStitches + change
                            : section.startingStitches - change;
                        })()}
                      </span>
                    </div>

                    {section.shaping.type !== 'none' && (
                      <div className="flex items-center gap-1.5 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-100">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-orange-600/80">Shaping</span>
                        <span className="text-sm font-medium text-orange-700 capitalize">
                          {section.shaping.type} every {section.shaping.frequency} rows
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 items-center">
                  <Button onClick={(e) => handleEdit(e, section)} variant="ghost" size="icon" className="rounded-full h-8 w-8 text-muted-foreground hover:bg-black/5 hover:text-black">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <ConfirmDialog
                    title="Delete Section"
                    description={`Are you sure you want to delete "${section.name}"? All progress for this section will be lost.`}
                    confirmLabel="Delete"
                    onConfirm={() => deleteSection(section.id)}
                  >
                    <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </ConfirmDialog>
                  <ChevronRight className="w-6 h-6 text-primary ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
