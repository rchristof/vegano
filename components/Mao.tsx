import React from 'react';
import { DndContext, useSensor, useSensors, PointerSensor, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Carta from './Carta';

interface CartaType {
  name: string;
  image: string;
}

interface MaoProps {
  cartas: CartaType[];
  onReorder?: (novoArray: CartaType[]) => void;
}

function SortableCarta({ carta, id }: { carta: CartaType; id: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
      {...attributes}
      {...listeners}
      className="mx-1"
    >
      <Carta carta={carta} />
    </div>
  );
}

const Mao: React.FC<MaoProps> = ({ cartas, onReorder }) => {
  const sensors = useSensors(useSensor(PointerSensor));
  const ids = cartas.map((c, i) => `${c.name}-${i}`);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = ids.indexOf(active.id);
      const newIndex = ids.indexOf(over.id);
      const novoArray = arrayMove(cartas, oldIndex, newIndex);
      onReorder && onReorder(novoArray);
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={ids} strategy={horizontalListSortingStrategy}>
        <div className="flex gap-2">
          {cartas.map((carta, idx) => (
            <SortableCarta key={ids[idx]} carta={carta} id={ids[idx]} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default Mao;
