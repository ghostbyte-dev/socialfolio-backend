import { model, Schema } from "npm:mongoose";

export interface IExploreProfile {
  id: string;
  username: string;
  displayName?: string;
  description?: string;
  avatarUrl?: string;
}

const exploreUserSchema = new Schema<IExploreProfile>({
  username: { type: String, unique: true, required: true },
  displayName: { type: String },
  description: { type: String },
  avatarUrl: { type: String },
});

export default model<IExploreProfile>("ExploreUser", exploreUserSchema);
