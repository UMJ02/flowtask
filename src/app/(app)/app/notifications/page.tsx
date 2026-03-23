import { getNotificationsPageData } from "@/lib/queries/notifications";
import { NotificationsLivePanel } from "@/components/notifications/notifications-live-panel";
import { NotificationDeliveryHealth } from "@/components/notifications/notification-delivery-health";

export default async function NotificationsPage() {
  const data = await getNotificationsPageData();

  return (
    <div className="space-y-4">
      <NotificationDeliveryHealth
        deliverySummary={data.deliverySummary}
        digestPreview={data.digestPreview}
      />
      <NotificationsLivePanel
        userId={data.userId}
        initialNotifications={data.notifications as any}
        assignedTasks={data.assignedTasks as any}
        triggeredReminders={data.triggeredReminders as any}
        digestPreview={data.digestPreview as any}
        deliverySummary={data.deliverySummary as any}
      />
    </div>
  );
}
