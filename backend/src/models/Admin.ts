import { Schema, model, type Document, type Types } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IAdmin extends Document {
  _id: Types.ObjectId;
  username: string;
  email: string;
  passwordHash: string;
  role: 'ADMIN';
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  setPassword(plain: string): Promise<void>;
  verifyPassword(plain: string): Promise<boolean>;
}

const adminSchema = new Schema<IAdmin>(
  {
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['ADMIN'], default: 'ADMIN' },
    lastLoginAt: { type: Date },
  },
  { timestamps: true },
);

adminSchema.methods.setPassword = async function setPassword(plain: string): Promise<void> {
  this.passwordHash = await bcrypt.hash(plain, 12);
};

adminSchema.methods.verifyPassword = async function verifyPassword(plain: string): Promise<boolean> {
  return bcrypt.compare(plain, this.passwordHash);
};

export const Admin = model<IAdmin>('Admin', adminSchema, 'admins');
