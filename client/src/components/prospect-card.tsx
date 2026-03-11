import { useState } from "react";
import type { Prospect } from "@shared/schema";
import { PREP_ITEMS } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { ExternalLink, Trash2, Pencil, Flame, ThumbsUp, Minus, DollarSign, Check } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EditProspectForm } from "./edit-prospect-form";

function InterestIndicator({ level }: { level: string }) {
  switch (level) {
    case "High":
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-red-500 dark:text-red-400" data-testid="interest-high">
          <Flame className="w-3 h-3" />
          High
        </span>
      );
    case "Medium":
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-500 dark:text-amber-400" data-testid="interest-medium">
          <ThumbsUp className="w-3 h-3" />
          Medium
        </span>
      );
    case "Low":
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground" data-testid="interest-low">
          <Minus className="w-3 h-3" />
          Low
        </span>
      );
    default:
      return null;
  }
}

function SalaryDisplay({ salary }: { salary: number | null | undefined }) {
  if (!salary) return null;
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(salary);
  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400"
      data-testid="salary-display"
    >
      <DollarSign className="w-3 h-3" />
      {formatted.replace("$", "")}
    </span>
  );
}

function PrepChecklist({
  prospectId,
  checklist,
}: {
  prospectId: number;
  checklist: boolean[];
}) {
  const { toast } = useToast();

  const checklistMutation = useMutation({
    mutationFn: async (newChecklist: boolean[]) => {
      await apiRequest("PATCH", `/api/prospects/${prospectId}`, {
        prepChecklist: newChecklist,
      });
    },
    onMutate: async (newChecklist) => {
      await queryClient.cancelQueries({ queryKey: ["/api/prospects"] });
      const previous = queryClient.getQueryData<Prospect[]>(["/api/prospects"]);
      queryClient.setQueryData<Prospect[]>(["/api/prospects"], (old) =>
        old?.map((p) =>
          p.id === prospectId ? { ...p, prepChecklist: newChecklist } : p,
        ) ?? [],
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(["/api/prospects"], ctx.previous);
      }
      toast({ title: "Failed to save checklist", variant: "destructive" });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prospects"] });
    },
  });

  const toggle = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = checklist.map((v, i) => (i === index ? !v : v));
    checklistMutation.mutate(updated);
  };

  const doneCount = checklist.filter(Boolean).length;

  return (
    <div
      className="pt-2 mt-1 border-t border-border/40"
      onClick={(e) => e.stopPropagation()}
      data-testid={`prep-checklist-${prospectId}`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-[11px] font-semibold text-muted-foreground tracking-wide">
          Prep Checklist
        </p>
        <span className="text-[10px] text-muted-foreground">
          {doneCount}/{PREP_ITEMS.length}
        </span>
      </div>
      <ul className="space-y-1">
        {PREP_ITEMS.map((item, i) => (
          <li key={item} className="flex items-center gap-2">
            <button
              type="button"
              role="checkbox"
              aria-checked={checklist[i]}
              onClick={(e) => toggle(i, e)}
              className={`flex-shrink-0 w-3.5 h-3.5 rounded-sm border flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${
                checklist[i]
                  ? "bg-primary border-primary"
                  : "bg-transparent border-border/70 hover:border-primary"
              }`}
              data-testid={`checklist-item-${prospectId}-${i}`}
            >
              {checklist[i] && (
                <Check className="w-2.5 h-2.5 text-primary-foreground" strokeWidth={3} />
              )}
            </button>
            <span
              className={`text-[11px] leading-tight transition-colors ${
                checklist[i] ? "text-muted-foreground line-through" : "text-foreground"
              }`}
            >
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ProspectCard({ prospect }: { prospect: Prospect }) {
  const { toast } = useToast();
  const [editOpen, setEditOpen] = useState(false);

  const checklist: boolean[] =
    Array.isArray(prospect.prepChecklist) && prospect.prepChecklist.length === PREP_ITEMS.length
      ? (prospect.prepChecklist as boolean[])
      : Array(PREP_ITEMS.length).fill(false);

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/prospects/${prospect.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prospects"] });
      toast({ title: "Prospect deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete prospect", variant: "destructive" });
    },
  });

  return (
    <>
      <div
        className="group bg-card border border-card-border rounded-md p-3 space-y-2 hover-elevate cursor-pointer transition-all duration-150"
        onClick={() => setEditOpen(true)}
        data-testid={`card-prospect-${prospect.id}`}
      >
        <div className="flex items-start justify-between gap-1">
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-sm leading-tight truncate" data-testid={`text-company-${prospect.id}`}>
              {prospect.companyName}
            </h4>
            <p className="text-xs text-muted-foreground truncate mt-0.5" data-testid={`text-role-${prospect.id}`}>
              {prospect.roleTitle}
            </p>
          </div>
          <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                setEditOpen(true);
              }}
              data-testid={`button-edit-${prospect.id}`}
            >
              <Pencil className="w-3 h-3 text-muted-foreground" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                deleteMutation.mutate();
              }}
              disabled={deleteMutation.isPending}
              data-testid={`button-delete-${prospect.id}`}
            >
              <Trash2 className="w-3 h-3 text-muted-foreground" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <InterestIndicator level={prospect.interestLevel} />
          <SalaryDisplay salary={prospect.targetSalary} />
        </div>

        {prospect.jobUrl && (
          <a
            href={prospect.jobUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            onClick={(e) => e.stopPropagation()}
            data-testid={`link-job-url-${prospect.id}`}
          >
            <ExternalLink className="w-3 h-3" />
            Posting
          </a>
        )}

        {prospect.notes && (
          <p className="text-xs text-muted-foreground line-clamp-2" data-testid={`text-notes-${prospect.id}`}>
            {prospect.notes}
          </p>
        )}

        <PrepChecklist prospectId={prospect.id} checklist={checklist} />
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Prospect</DialogTitle>
          </DialogHeader>
          <EditProspectForm prospect={prospect} onSuccess={() => setEditOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
