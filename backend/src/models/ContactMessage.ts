import { Schema, model, type Document, type Types } from 'mongoose';

export type ContactCategory = 'contribute' | 'functionality' | 'donation';

export interface IContactMessage extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  mobile?: string;
  category: ContactCategory;
  message: string;
  status: 'new' | 'replied';
  replyText?: string;
  repliedAt?: Date;
  ipHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

const contactMessageSchema = new Schema<IContactMessage>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 200 },
    mobile: { type: String, trim: true, maxlength: 40 },
    category: { type: String, enum: ['contribute', 'functionality', 'donation'], default: 'contribute', index: true },
    message: { type: String, required: true, trim: true, maxlength: 5000 },
    status: { type: String, enum: ['new', 'replied'], default: 'new', index: true },
    replyText: { type: String },
    repliedAt: { type: Date },
    ipHash: { type: String },
  },
  { timestamps: true },
);

contactMessageSchema.index({ createdAt: -1 });

export const ContactMessage = model<IContactMessage>('ContactMessage', contactMessageSchema, 'contactMessages');
