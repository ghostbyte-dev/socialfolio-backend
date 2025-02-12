import { model, ObjectId, Schema } from "npm:mongoose";
import { IWidget, widgetSchema } from "./Widget.ts";

export interface IUser {
  _id: string;
  username: string;
  email: string;
  password: string;
  displayName?: string;
  description?: string;
  widgets: ObjectId[];
}

const userSchema = new Schema<IUser>({
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  displayName: { type: String },
  description: { type: String },
});

// Validations

// Export model.
export default model<IUser>("User", userSchema);
