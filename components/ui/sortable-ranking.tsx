"use client";

import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, ChevronUp, GripVertical, X } from "lucide-react";

type ItemProps = { id: string; index: number; total: number; onMove: (from: number, to: number) => void; onRemove?: () => void };

function SortableItem({ id, index, total, onMove, onRemove }: ItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <li ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={`ranking-item ${isDragging ? "dragging" : ""}`}>
      <span className="rank-number" aria-label={`Position ${index + 1}`}>{index + 1}</span>
      <button type="button" className="drag-handle" aria-label={`Déplacer ${id}`} {...attributes} {...listeners}><GripVertical size={20} /></button>
      <span className="rank-label">{id}</span>
      <span className="rank-actions">
        <button type="button" aria-label={`Monter ${id}`} onClick={() => onMove(index, index - 1)} disabled={index === 0}><ChevronUp size={18} /></button>
        <button type="button" aria-label={`Descendre ${id}`} onClick={() => onMove(index, index + 1)} disabled={index === total - 1}><ChevronDown size={18} /></button>
        {onRemove && <button type="button" aria-label={`Retirer ${id}`} onClick={onRemove}><X size={17} /></button>}
      </span>
    </li>
  );
}

export function SortableRanking({ items, onChange, removable = false }: { items: string[]; onChange: (items: string[]) => void; removable?: boolean }) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 7 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const move = (from: number, to: number) => { if (to >= 0 && to < items.length) onChange(arrayMove(items, from, to)); };
  const dragEnd = ({ active, over }: DragEndEvent) => {
    if (over && active.id !== over.id) onChange(arrayMove(items, items.indexOf(String(active.id)), items.indexOf(String(over.id))));
  };
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={dragEnd}>
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <ol className="ranking-list">{items.map((item, index) => <SortableItem key={item} id={item} index={index} total={items.length} onMove={move} onRemove={removable ? () => onChange(items.filter((value) => value !== item)) : undefined} />)}</ol>
      </SortableContext>
    </DndContext>
  );
}
