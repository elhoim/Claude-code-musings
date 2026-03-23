/**
 * Offline Sync Engine (Phase 3)
 *
 * Handles offline-first data synchronization:
 * - Queue operations while offline
 * - Sync when connectivity restored
 * - Conflict resolution (last-write-wins with merge for SRS)
 * - Local storage adapter for AsyncStorage/SQLite
 *
 * Key sync entities:
 * - SRS card reviews (queue reviews, sync when online)
 * - Lesson progress (sync completion status)
 * - Story state (sync reading position and choices)
 * - User preferences (bidirectional sync)
 */

export interface SyncOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: string;
  entityId: string;
  data: Record<string, unknown>;
  timestamp: Date;
  synced: boolean;
}

export interface SyncManager {
  enqueue(operation: SyncOperation): Promise<void>;
  sync(): Promise<SyncResult>;
  getPendingCount(): Promise<number>;
  clearSynced(): Promise<void>;
}

export interface SyncResult {
  synced: number;
  failed: number;
  conflicts: number;
}

// Placeholder implementation — Phase 3
export function createSyncManager(): SyncManager {
  return {
    enqueue: async () => {},
    sync: async () => ({ synced: 0, failed: 0, conflicts: 0 }),
    getPendingCount: async () => 0,
    clearSynced: async () => {},
  };
}
