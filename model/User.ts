import { model, Schema } from "npm:mongoose";

export interface IUser {
  _id: string;
  username: string;
  email: string;
  password: string;
}

// Define schema.
const userSchema = new Schema<IUser>({
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
});

// Validations

// Export model.
export default model<IUser>("User", userSchema);
