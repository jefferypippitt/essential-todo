"use client";

import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { TodoItem } from "./todo-item";
import { ScrollArea } from "./ui/scroll-area";
import { reorderTodos } from "@/app/action";
import { useState } from "react";
import { Button } from "./ui/button";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TodosDisplayProps } from "@/types/todo";

export function TodosDisplay({ allTodos }: TodosDisplayProps) {
  const [open, setOpen] = useState(false);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    await reorderTodos(Number(active.id), Number(over.id));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Saved
        <span className="inline-flex h-5 items-center rounded border px-1.5 text-xs font-medium text-muted-foreground">
          {allTodos.length}
        </span>
        <ChevronDown
          className={cn(
            "transition-transform duration-200 ml-2",
            open && "rotate-180"
          )}
        />
      </Button>
      <DialogContent className="max-w-3xl">
        <DialogHeader className="flex justify-center items-center">
          <DialogTitle>Saved Todos</DialogTitle>
        </DialogHeader>
        {allTodos.length === 0 ? (
          <div className="flex items-center justify-center h-[400px] text-muted-foreground text-sm">
            Please add a todo!
          </div>
        ) : (
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={allTodos.map((todo) => todo.id)}
              strategy={verticalListSortingStrategy}
            >
              <ScrollArea className="h-[400px] w-full">
                <div className="p-4">
                  <ul className="grid gap-2">
                    {allTodos.map((todo) => (
                      <TodoItem
                        key={todo.id}
                        id={todo.id}
                        title={todo.title}
                        completed={todo.completed}
                        description={todo.description}
                        createdAt={todo.createdAt}
                      />
                    ))}
                  </ul>
                </div>
              </ScrollArea>
            </SortableContext>
          </DndContext>
        )}
      </DialogContent>
    </Dialog>
  );
}
