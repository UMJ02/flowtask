export const dynamic = 'force-dynamic';

import { BoardPage } from '@/components/boards/board-page';

export default async function VisualBoardPage({ params }: { params: Promise<{ boardId: string }> }) {
  const { boardId } = await params;
  return <BoardPage boardId={boardId} />;
}
