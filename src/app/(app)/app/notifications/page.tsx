import { NotificationsLivePanel } from '@/components/notifications/notifications-live-panel';
import { NotificationDeliveryHealth } from '@/components/notifications/notification-delivery-health';
import { TestNotificationButton } from '@/components/notifications/test-notification-button';
import { getNotificationsPageData } from '@/lib/queries/notifications';
import { safeServerCall } from '@/lib/runtime/safe-server';

export default async function NotificationsPage() {
  const data = await safeServerCall('getNotificationsPageData', () => getNotificationsPageData(), {
    userId: '', notifications: [], assignedTasks: [], triggeredReminders: [], unreadCount: 0, digestPreview: null, deliverySummary: { total: 0, sent: 0, failed: 0, pending: 0 },
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <TestNotificationButton />
      </div>
      <NotificationsLivePanel
        userId={data.userId}
        initialNotifications={data.notifications}
        assignedTasks={data.assignedTasks}
        triggeredReminders={data.triggeredReminders}
        digestPreview={data.digestPreview}
        deliverySummary={data.deliverySummary}
      />
      <NotificationDeliveryHealth deliverySummary={data.deliverySummary} digestPreview={data.digestPreview} />
    </div>
  );
}
