'use client';

import { useSearchParams } from 'next/navigation';
import { KanbanBoard } from '@/components/pipeline/kanban-board';

export default function PipelinePage() {
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit') || undefined;
  return <KanbanBoard editId={editId} />;
}
