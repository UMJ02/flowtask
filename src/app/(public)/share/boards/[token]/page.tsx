export const dynamic = 'force-dynamic';

import { BoardShareView } from '@/components/boards/board-share-view';

export default async function SharedVisualBoardPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <BoardShareView token={token} />;
}
