export interface DataVersion {
  version: number;
  timestamp: Date;
  source: string;
  changes: DataChange[];
  metadata?: Record<string, any>;
}

export interface DataChange {
  entityType: 'post' | 'follower' | 'audience' | 'hashtag' | 'benchmark';
  entityId: string | number;
  changeType: 'create' | 'update' | 'delete';
  fields?: string[];
  previousValues?: Record<string, any>;
  newValues?: Record<string, any>;
}

export interface SyncMetadata {
  lastSyncVersion: number;
  lastSyncTimestamp: Date;
  totalSyncs: number;
  successfulSyncs: number;
  failedSyncs: number;
  averageSyncDuration: number;
  errors: SyncError[];
}

export interface SyncError {
  timestamp: Date;
  entityType: string;
  error: string;
  context?: Record<string, any>;
} 