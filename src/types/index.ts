// Customer type (from CRM)
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  service_type: 'Cable' | 'Plex' | 'Cable/Plex';
  username_1: string | null;
  password_1: string | null;
  username_2: string | null;
  password_2: string | null;
  username_3: string | null;
  password_3: string | null;
  username_4: string | null;
  password_4: string | null;
  status: 'Active' | 'Inactive' | 'Expired';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Support Ticket
export interface SupportTicket {
  id: string;
  customer_id: string;
  ticket_number: string;
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  device_type: string | null;
  description: string;
  created_at: string;
  updated_at: string;
}

// Support Ticket with joined Customer data (for admin views)
export interface SupportTicketWithCustomer extends SupportTicket {
  customer?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  } | null;
}

export type TicketCategory =
  | 'connection_issue'
  | 'buffering'
  | 'channel_missing'
  | 'login_problem'
  | 'billing'
  | 'channel_request'
  | 'app_help'
  | 'other';

export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent';

export type TicketStatus = 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';

// Ticket Message
export interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_type: 'customer' | 'admin' | 'system';
  sender_name: string;
  message: string;
  is_internal: boolean;
  created_at: string;
}

// Magic Link
export interface MagicLink {
  id: string;
  customer_id: string;
  token_hash: string;
  delivery_method: 'email' | 'sms';
  delivered_to: string;
  used_at: string | null;
  expires_at: string;
  created_at: string;
}

// Customer Session
export interface CustomerSessionRecord {
  id: string;
  customer_id: string;
  token_hash: string;
  expires_at: string;
  created_at: string;
}

// Service Announcement
export interface ServiceAnnouncement {
  id: string;
  title: string;
  content: string;
  type: 'maintenance' | 'outage' | 'update' | 'promo';
  is_active: boolean;
  starts_at: string;
  ends_at: string | null;
  created_at: string;
}

// Category labels for display
export const TICKET_CATEGORIES: Record<TicketCategory, string> = {
  connection_issue: 'Connection Issue',
  buffering: 'Buffering / Freezing',
  channel_missing: 'Missing Channel',
  login_problem: 'Login Problem',
  billing: 'Billing Question',
  channel_request: 'Channel Request',
  app_help: 'App Setup Help',
  other: 'Other',
};

export const TICKET_PRIORITIES: Record<TicketPriority, string> = {
  low: 'Low',
  normal: 'Normal',
  high: 'High',
  urgent: 'Urgent',
};

export const TICKET_STATUSES: Record<TicketStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  waiting_customer: 'Waiting for Response',
  resolved: 'Resolved',
  closed: 'Closed',
};
