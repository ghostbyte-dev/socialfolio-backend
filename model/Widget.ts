import { ObjectId } from "mongoose";
import { model, Schema } from "mongoose";

export interface IPixlfed {
  baseUrl: string;
  username: string;
}

export interface IMastodon {
  baseUrl: string;
  username: string;
}

export enum WidgetType {
  Pixelfed = "Pixelfed",
  Mastodon = "Mastodon",
}

export interface ISize {
  cols: number;
  rows: number;
}

export interface IWidget {
  _id: string;
  user: ObjectId;
  type: WidgetType;
  variant: number;
  size: ISize;
  data: IPixlfed | IMastodon;
}

export const widgetSchema = new Schema<IWidget>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, required: true },
  variant: { type: Number, required: true },
  size: { type: Object, required: true },
  data: { type: Object, required: true },
});

export default model<IWidget>("Widget", widgetSchema);
