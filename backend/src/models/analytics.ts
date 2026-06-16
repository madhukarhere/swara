import { Schema, model, type Document, type Types } from 'mongoose';

/* ----------------------------- SongPlay ------------------------------ */
export interface ISongPlay extends Document {
  _id: Types.ObjectId;
  song: Types.ObjectId;
  /** YYYY-MM-DD bucket for fast daily/monthly aggregation */
  dateBucket: string;
  ipHash?: string;
  createdAt: Date;
}

const songPlaySchema = new Schema<ISongPlay>(
  {
    song: { type: Schema.Types.ObjectId, ref: 'Song', required: true, index: true },
    dateBucket: { type: String, required: true, index: true },
    ipHash: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);
songPlaySchema.index({ createdAt: -1 });

export const SongPlay = model<ISongPlay>('SongPlay', songPlaySchema, 'songPlays');

/* --------------------------- SongDownload ---------------------------- */
export interface ISongDownload extends Document {
  _id: Types.ObjectId;
  song: Types.ObjectId;
  type: 'audio' | 'lyrics_pdf';
  dateBucket: string;
  createdAt: Date;
}

const songDownloadSchema = new Schema<ISongDownload>(
  {
    song: { type: Schema.Types.ObjectId, ref: 'Song', required: true, index: true },
    type: { type: String, enum: ['audio', 'lyrics_pdf'], default: 'lyrics_pdf' },
    dateBucket: { type: String, required: true, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const SongDownload = model<ISongDownload>('SongDownload', songDownloadSchema, 'songDownloads');

/* ----------------------------- AuditLog ------------------------------ */
export interface IAuditLog extends Document {
  _id: Types.ObjectId;
  admin?: Types.ObjectId;
  adminUsername?: string;
  action: string;
  entity: string;
  entityId?: string;
  ip?: string;
  meta?: Record<string, unknown>;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    admin: { type: Schema.Types.ObjectId, ref: 'Admin' },
    adminUsername: { type: String },
    action: { type: String, required: true },
    entity: { type: String, required: true, index: true },
    entityId: { type: String },
    ip: { type: String },
    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);
auditLogSchema.index({ createdAt: -1 });

export const AuditLog = model<IAuditLog>('AuditLog', auditLogSchema, 'auditLogs');
