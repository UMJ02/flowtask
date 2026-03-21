import { getNotificationsPageData } from "@/lib/queries/notifications";
import { NotificationsLivePanel } from "@/components/notifications/notifications-live-panel";

export default async function NotificationsPage() {
  const data = await getNotificationsPageData();

  return (
    <NotificationsLivePanel
      userId={data.userId}
      initialNotifications={data.notifications}
      assignedTasks={data.assignedTasks as any}
      triggeredReminders={data.triggeredReminders as any}
    />
  );
}
