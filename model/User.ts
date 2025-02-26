import { model, Schema } from "npm:mongoose";

export interface IUser {
  _id: string;
  username: string;
  email: string;
  password: string;
  displayName?: string;
  description?: string;
  avatarUrl?: string;
  verificationCode?: string;
  verified: boolean;
  passwordResetToken?: string;
  passwordResetExpiresTimestamp?: Date;
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  displayName: { type: String },
  description: { type: String },
  avatarUrl: { type: String },
  verificationCode: { type: String },
  verified: { type: Boolean },
  passwordResetToken: { type: String },
  passwordResetExpiresTimestamp: { type: Date },
},
  { timestamps: true }
);

// Validations

// Export model.
export default model<IUser>("User", userSchema);
