import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  title: string;
  description: string;
  onConfirm: () => void;
  children: React.ReactNode;
  confirmLabel?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export function ConfirmDialog({
  title,
  description,
  onConfirm,
  children,
  confirmLabel = "Confirm",
  variant = "destructive"
}: ConfirmDialogProps) {
  const [open, setOpen] = useState(false);

  const handleConfirm = (e: React.MouseEvent) => {
    e.stopPropagation();
    onConfirm();
    setOpen(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild onClick={(e) => e.stopPropagation()}>
        {children}
      </DialogTrigger>
      <DialogContent onClick={(e) => e.stopPropagation()} className="sm:max-w-md rounded-[2.5rem] border-primary/20 border-[3px] bg-[#fdfcfb] shadow-2xl p-8">
        <DialogHeader>
          <DialogTitle className="font-serif text-3xl text-primary">{title}</DialogTitle>
          <DialogDescription className="text-lg text-muted-foreground/80 mt-3 leading-relaxed">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-10 gap-3 flex-col sm:flex-row justify-end">
          <Button variant="ghost" className="rounded-full h-12 px-6 text-base hover:bg-black/5" onClick={(e) => { e.stopPropagation(); setOpen(false); }}>
            Keep it
          </Button>
          <Button variant={variant} className="rounded-full h-12 px-6 text-base hover:bg-black/5" onClick={handleConfirm}>
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
