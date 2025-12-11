import mongoose, { Schema, Document } from 'mongoose';

export interface IPlatformSettings extends Document {
  category: 'general' | 'financial' | 'features' | 'security' | 'notifications';
  key: string;
  value: any;
  dataType: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  isPublic: boolean; // Whether this setting can be viewed by non-admins
  lastModifiedBy: mongoose.Types.ObjectId;
  lastModifiedAt: Date;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

const PlatformSettingsSchema = new Schema<IPlatformSettings>(
  {
    category: {
      type: String,
      enum: ['general', 'financial', 'features', 'security', 'notifications'],
      required: true
    },
    key: { type: String, required: true, unique: true },
    value: { type: Schema.Types.Mixed, required: true },
    dataType: {
      type: String,
      enum: ['string', 'number', 'boolean', 'object', 'array'],
      required: true
    },
    description: { type: String, required: true },
    isPublic: { type: Boolean, default: false },
    lastModifiedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    lastModifiedAt: { type: Date, default: Date.now },
    version: { type: Number, default: 1 }
  },
  {
    timestamps: true,
  }
);

// Indexes
PlatformSettingsSchema.index({ category: 1, key: 1 });
PlatformSettingsSchema.index({ isPublic: 1 });

export interface IAdminUser extends Document {
  userId: mongoose.Types.ObjectId;
  email: string;
  walletAddress?: string;
  role: 'super_admin' | 'admin' | 'moderator' | 'support';
  permissions: string[];
  isActive: boolean;
  addedBy: mongoose.Types.ObjectId;
  lastLoginAt?: Date;
  loginCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const AdminUserSchema = new Schema<IAdminUser>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    email: { type: String, required: true, unique: true },
    walletAddress: { type: String, unique: true, sparse: true },
    role: {
      type: String,
      enum: ['super_admin', 'admin', 'moderator', 'support'],
      required: true
    },
    permissions: [{ type: String }],
    isActive: { type: Boolean, default: true },
    addedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    lastLoginAt: { type: Date },
    loginCount: { type: Number, default: 0 }
  },
  {
    timestamps: true,
  }
);

// Indexes
AdminUserSchema.index({ email: 1 });
AdminUserSchema.index({ role: 1, isActive: 1 });

export interface IAuditLog extends Document {
  action: string;
  category: 'user' | 'event' | 'transaction' | 'artist' | 'admin' | 'system' | 'settings';
  entityType: string;
  entityId?: string;
  userId: mongoose.Types.ObjectId;
  userEmail: string;
  userRole: string;
  details: {
    before?: any;
    after?: any;
    metadata?: any;
    ipAddress?: string;
    userAgent?: string;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    action: { type: String, required: true },
    category: {
      type: String,
      enum: ['user', 'event', 'transaction', 'artist', 'admin', 'system', 'settings'],
      required: true
    },
    entityType: { type: String, required: true },
    entityId: { type: String },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userEmail: { type: String, required: true },
    userRole: { type: String, required: true },
    details: {
      before: { type: Schema.Types.Mixed },
      after: { type: Schema.Types.Mixed },
      metadata: { type: Schema.Types.Mixed },
      ipAddress: { type: String },
      userAgent: { type: String }
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low'
    },
    timestamp: { type: Date, default: Date.now }
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
AuditLogSchema.index({ category: 1, timestamp: -1 });
AuditLogSchema.index({ userId: 1, timestamp: -1 });
AuditLogSchema.index({ action: 1, timestamp: -1 });
AuditLogSchema.index({ entityType: 1, entityId: 1, timestamp: -1 });
AuditLogSchema.index({ severity: 1, timestamp: -1 });

export interface IDataExport extends Document {
  type: 'users' | 'events' | 'transactions' | 'artists' | 'audit_logs' | 'all';
  format: 'csv' | 'json' | 'xlsx';
  filters: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  fileUrl?: string;
  fileName: string;
  fileSize?: number;
  recordCount?: number;
  requestedBy: mongoose.Types.ObjectId;
  requestedAt: Date;
  completedAt?: Date;
  errorMessage?: string;
  expiresAt: Date; // Auto-delete after 7 days
  createdAt: Date;
  updatedAt: Date;
}

const DataExportSchema = new Schema<IDataExport>(
  {
    type: {
      type: String,
      enum: ['users', 'events', 'transactions', 'artists', 'audit_logs', 'all'],
      required: true
    },
    format: {
      type: String,
      enum: ['csv', 'json', 'xlsx'],
      default: 'csv'
    },
    filters: { type: Schema.Types.Mixed },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending'
    },
    fileUrl: { type: String },
    fileName: { type: String, required: true },
    fileSize: { type: Number },
    recordCount: { type: Number },
    requestedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    requestedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
    errorMessage: { type: String },
    expiresAt: { type: Date, required: true }
  },
  {
    timestamps: true,
  }
);

// Indexes
DataExportSchema.index({ requestedBy: 1, createdAt: -1 });
DataExportSchema.index({ status: 1, createdAt: -1 });
DataExportSchema.index({ expiresAt: 1 }); // For cleanup

export const PlatformSettings = mongoose.models.PlatformSettings || 
  mongoose.model<IPlatformSettings>('PlatformSettings', PlatformSettingsSchema);

export const AdminUser = mongoose.models.AdminUser || 
  mongoose.model<IAdminUser>('AdminUser', AdminUserSchema);

export const AuditLog = mongoose.models.AuditLog || 
  mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);

export const DataExport = mongoose.models.DataExport || 
  mongoose.model<IDataExport>('DataExport', DataExportSchema);

// Helper function to log audit events
export async function logAuditEvent(
  action: string,
  category: IAuditLog['category'],
  entityType: string,
  userId: string,
  userEmail: string,
  userRole: string,
  details: IAuditLog['details'] = {},
  entityId?: string,
  severity: IAuditLog['severity'] = 'low'
) {
  try {
    await AuditLog.create({
      action,
      category,
      entityType,
      entityId,
      userId,
      userEmail,
      userRole,
      details,
      severity,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Failed to log audit event:', error);
  }
}