export interface AuditLog {
  id: number;
  userId: number | null;
  action: string;

  entityType: string | null;
  entityId: number | null;

  meta: Record<string, any> | null;
  createdAt: string;
}
