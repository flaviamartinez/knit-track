import { Section } from "@/src/types";
import { Button } from "@/components/ui/button";
import { Minus, Plus, RotateCcw, CheckCircle2, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { useEffect } from "react";
import { ConfirmDialog } from "./ConfirmDialog";

interface RowCounterProps {
  title: string;
  subtitle?: string;
  currentRow: number;
  totalRows?: number;
  section?: Section; // To compute stitches and shaping if present
  onUpdateRow: (newRow: number) => void;
  onFinish?: () => void;
  finishLabel?: string;
}

export function RowCounter({ 
  title, 
  subtitle, 
  currentRow, 
  totalRows, 
  section, 
  onUpdateRow, 
  onFinish,
  finishLabel = "Mark as Finished"
}: RowCounterProps) {
  
  const isGoalReached = totalRows ? currentRow >= totalRows : false;

  useEffect(() => {
    if (totalRows && currentRow === totalRows && currentRow > 0) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [currentRow, totalRows]);

  const handleIncrement = () => onUpdateRow(currentRow + 1);
  const handleDecrement = () => onUpdateRow(Math.max(0, currentRow - 1));

  // Shaping logic
  const isShapingRow = section && 
    section.shaping.type !== 'none' && 
    currentRow > 0 &&
    currentRow % section.shaping.frequency === 0;

  // Calculate current stitches
  let currentStitches = section?.startingStitches || 0;
  if (section && section.shaping.type !== 'none') {
    const shapingOccurrences = Math.floor(currentRow / section.shaping.frequency);
    const change = shapingOccurrences * section.shaping.amount;
    currentStitches = section.shaping.type === 'increase' 
      ? section.startingStitches + change 
      : section.startingStitches - change;
  }

  return (
    <div className="flex flex-col items-center space-y-8 py-8 w-full max-w-2xl mx-auto px-4">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-serif font-bold text-primary flex items-center justify-center gap-2">
           {title}
          {isGoalReached && <Trophy className="w-6 h-6 text-yellow-500 fill-yellow-500" />}
        </h2>
        {subtitle && (
          <p className="text-sm text-muted-foreground uppercase tracking-widest">{subtitle}</p>
        )}
        {section?.description && (
          <p className="text-sm text-muted-foreground/80 italic font-serif max-w-sm mx-auto leading-relaxed bg-accent/20 px-4 py-2 rounded-2xl">
            {section.description}
          </p>
        )}
      </div>

      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentRow}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className={`text-9xl font-serif font-bold tabular-nums transition-colors duration-500 ${isGoalReached ? "text-green-600" : "text-primary"}`}
          >
            {currentRow}
          </motion.div>
        </AnimatePresence>
        
        {isShapingRow && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-4 -right-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg z-10"
          >
            {section?.shaping.type.toUpperCase()}!
          </motion.div>
        )}
      </div>

      {isGoalReached && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-green-100 text-green-800 px-4 py-2 rounded-xl text-sm font-semibold">
           You've reached your target of {totalRows} rows!
        </motion.div>
      )}

      <div className="flex items-center gap-6">
        <Button
          variant="outline"
          size="icon"
          className="w-16 h-16 rounded-full border-2 hover:bg-black/5"
          onClick={handleDecrement}
          disabled={currentRow === 0}
        >
          <Minus className="w-8 h-8" />
        </Button>
        
        <Button
          variant="default"
          size="icon"
          className={`w-24 h-24 rounded-full shadow-xl transition-all ${isGoalReached ? "bg-green-600 hover:bg-green-700" : ""}`}
          onClick={handleIncrement}
        >
          <Plus className="w-12 h-12" />
        </Button>
        
        <ConfirmDialog
          title="Reset Counter"
          description={`Are you sure you want to reset the row count back to 0?`}
          confirmLabel="Reset"
          onConfirm={() => onUpdateRow(0)}
        >
          <Button
            variant="outline"
            size="icon"
            className="w-16 h-16 rounded-full border-2 hover:bg-black/5"
          >
            <RotateCcw className="w-8 h-8" />
          </Button>
        </ConfirmDialog>
      </div>

      {section && (
        <div className="w-full max-w-md space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-accent/50 text-center">
              <span className="text-xs text-muted-foreground uppercase tracking-widest block mb-1">Stitches</span>
              <p className="text-3xl font-serif font-semibold text-primary">{currentStitches}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-accent/50 text-center">
              <span className="text-xs text-muted-foreground uppercase tracking-widest block mb-1">Next Shaping</span>
              <p className="text-3xl font-serif font-semibold text-primary">
                {section.shaping.type !== 'none' 
                  ? `${(Math.floor(currentRow / section.shaping.frequency) + 1) * section.shaping.frequency}`
                  : '-'}
              </p>
            </div>
          </div>
        </div>
      )}

      {onFinish && (
        <Button 
          className="w-full max-w-md h-14 rounded-2xl text-lg font-serif mt-4" 
          variant="secondary"
          onClick={onFinish}
        >
          <CheckCircle2 className="mr-2 w-5 h-5" />
          {finishLabel}
        </Button>
      )}
    </div>
  );
}
