import { getNotificationsPageData } from "@/lib/queries/notifications";
import { NotificationsLivePanel } from "@/components/notifications/notifications-live-panel";

export default async function NotificationsPage() {
  const data = await getNotificationsPageData();

  return (
    <NotificationsLivePanel
      userId={data.userId}
      initialNotifications={data.notifications as any}
      assignedTasks={data.assignedTasks as any}
      triggeredReminders={data.triggeredReminders as any}
      digestPreview={data.digestPreview as any}
    />
  );
}
