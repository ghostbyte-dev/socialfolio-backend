import { model, Schema } from "npm:mongoose";

export enum Status {
  Visible = "visible",
  Hidden = "hidden",
  Disabled = "disabled",
  Unverified = "unverified"
}

export interface IUser {
  _id: string;
  username: string;
  email: string;
  password: string;
  displayName?: string;
  description?: string;
  avatarUrl?: string;
  verificationCode?: string;
  status: Status;
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
  status: { type: String },
  passwordResetToken: { type: String },
  passwordResetExpiresTimestamp: { type: Date },
},
  { timestamps: true }
);

// Validations

// Export model.
export default model<IUser>("User", userSchema);
