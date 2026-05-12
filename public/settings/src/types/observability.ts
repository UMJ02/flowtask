export interface ErrorLogInput {
  level?: "info" | "warning" | "error" | "critical";
  source?: "frontend" | "backend" | "api" | "job";
  route?: string | null;
  message: string;
  organizationId?: string | null;
  details?: Record<string, unknown>;
}

export interface UsageEventInput {
  eventName: string;
  route?: string | null;
  organizationId?: string | null;
  metadata?: Record<string, unknown>;
}

export interface SupportTicketInput {
  organizationId?: string | null;
  subject: string;
  message: string;
  priority?: "low" | "normal" | "high" | "critical";
  source?: "in_app" | "email" | "whatsapp" | "phone";
  route?: string | null;
}
