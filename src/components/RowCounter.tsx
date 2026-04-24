import { Section } from "@/src/types";
import { Button } from "@/components/ui/button";
import { Minus, Plus, RotateCcw, CheckCircle2, Trophy, Layers, ArrowUp, ArrowDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { useEffect } from "react";
import { ConfirmDialog } from "./ConfirmDialog";

interface RowCounterProps {
  title: string;
  subtitle?: string;
  currentRow: number;
  totalRows?: number;
  section?: Section;
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
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    }
  }, [currentRow, totalRows]);

  const handleIncrement = () => {
    if (!isGoalReached) onUpdateRow(currentRow + 1);
  };
  const handleDecrement = () => onUpdateRow(Math.max(0, currentRow - 1));

  // --- Shaping calculations ---
  const freq = section?.shaping.frequency ?? 0;
  const hasShaping = section && section.shaping.type !== 'none' && freq > 0;

  // Completed shaping events so far (based on completed rows)
  const shapingOccurrences = hasShaping ? Math.floor(currentRow / freq) : 0;
  const stitchChange = shapingOccurrences * (section?.shaping.amount ?? 0);
  const currentStitches = section
    ? section.shaping.type === 'increase'
      ? section.startingStitches + stitchChange
      : section.shaping.type === 'decrease'
        ? section.startingStitches - stitchChange
        : section.startingStitches
    : 0;

  // Show a "next row: shaping!" warning on the row BEFORE shaping.
  // currentRow is the last COMPLETED row. The next row to knit is currentRow + 1.
  const nextRowIsShaping =
    hasShaping &&
    currentRow > 0 &&
    (currentRow + 1) % freq === 0 &&
    (!totalRows || currentRow + 1 <= totalRows);

  // Row on which the next shaping happens (for "Next shaping at row X")
  const nextShapingRow = hasShaping
    ? (Math.floor(currentRow / freq) + 1) * freq
    : null;

  // --- Subsection calculations ---
  const sub = section?.subsections;
  const completedSubsections = sub ? Math.floor(currentRow / sub.rowsEach) : null;
  const rowWithinSubsection = sub ? currentRow % sub.rowsEach : null;

  return (
    <div className="flex flex-col items-center space-y-6 py-8 w-full max-w-2xl mx-auto px-4">
      {/* Title */}
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

      {/* Subsection progress bar */}
      {sub && completedSubsections !== null && (
        <div className="w-full max-w-md space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground uppercase tracking-widest font-bold">
            <span className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5" /> Subsection</span>
            <span className="text-primary text-sm font-semibold tabular-nums">
              {completedSubsections} <span className="text-muted-foreground font-normal">/ {sub.count}</span>
            </span>
          </div>
          <div className="h-2.5 bg-accent/30 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={false}
              animate={{ width: `${(completedSubsections / sub.count) * 100}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
            />
          </div>
          {rowWithinSubsection !== null && (
            <p className="text-[11px] text-muted-foreground text-center">
              Row <strong className="text-foreground">{rowWithinSubsection}</strong> of {sub.rowsEach} in current subsection
            </p>
          )}
        </div>
      )}

      {/* Big row number */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-24 w-48 flex items-center justify-center">
          <AnimatePresence mode="sync">
            <motion.div
              key={currentRow}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={`absolute text-8xl font-serif font-bold tabular-nums leading-none transition-colors duration-300 ${isGoalReached ? "text-green-600" : "text-primary"}`}
            >
              {currentRow}
            </motion.div>
          </AnimatePresence>
        </div>
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60 font-bold">
          {totalRows ? `rows completed / ${totalRows}` : "rows completed"}
        </p>
      </div>

      {/* ⚠️ Next-row shaping warning */}
      <AnimatePresence>
        {nextRowIsShaping && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 6 }}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold text-sm shadow-md border"
            style={{ backgroundColor: '#FFF5F7', borderColor: '#FFD6E0', color: '#C75B7A' }}
          >
            {section?.shaping.type === 'increase'
              ? <ArrowUp className="w-4 h-4 shrink-0" />
              : <ArrowDown className="w-4 h-4 shrink-0" />}
            <span>
              Next row: <strong>{section?.shaping.type === 'increase' ? 'increase' : 'decrease'} 1 stitch</strong>
              {sub ? ` — starting subsection ${completedSubsections! + 1 + 1}` : ''}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Goal reached banner */}
      {isGoalReached && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-green-100 text-green-800 px-4 py-2 rounded-xl text-sm font-semibold">
          You've completed all {totalRows} rows! 🎉
        </motion.div>
      )}

      {/* Buttons */}
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
          className={`w-24 h-24 rounded-full shadow-xl transition-all ${isGoalReached ? "bg-green-600 hover:bg-green-700 opacity-60 cursor-not-allowed" : ""}`}
          onClick={handleIncrement}
          disabled={isGoalReached}
        >
          <Plus className="w-12 h-12" />
        </Button>

        <ConfirmDialog
          title="Reset Counter"
          description="Are you sure you want to reset the row count back to 0?"
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

      {/* Stats grid */}
      {section && (
        <div className="w-full max-w-md space-y-3 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-accent/50 text-center">
              <span className="text-xs text-muted-foreground uppercase tracking-widest block mb-1">Stitches now</span>
              <p className="text-3xl font-serif font-semibold text-primary">{currentStitches}</p>
            </div>
            {sub ? (
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-accent/50 text-center">
                <span className="text-xs text-muted-foreground uppercase tracking-widest block mb-1">Subsections done</span>
                <p className="text-3xl font-serif font-semibold text-primary">
                  {completedSubsections}<span className="text-lg text-muted-foreground font-normal"> / {sub.count}</span>
                </p>
              </div>
            ) : hasShaping && nextShapingRow !== null ? (
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-accent/50 text-center">
                <span className="text-xs text-muted-foreground uppercase tracking-widest block mb-1">Next shaping</span>
                <p className="text-3xl font-serif font-semibold text-primary">
                  {nextShapingRow <= (totalRows ?? Infinity) ? `row ${nextShapingRow}` : '—'}
                </p>
              </div>
            ) : totalRows ? (
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-accent/50 text-center">
                <span className="text-xs text-muted-foreground uppercase tracking-widest block mb-1">Rows left</span>
                <p className="text-3xl font-serif font-semibold text-primary">
                  {Math.max(0, totalRows - currentRow)}
                </p>
              </div>
            ) : null}
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
