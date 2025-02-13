import { ObjectId } from "mongoose";
import { model, Schema } from "mongoose";
import { urlParser } from "../utils/UrlParser.ts";

export interface IPixelfed {
  baseUrl: string;
  username: string;
}

export interface IMastodon {
  baseUrl: string;
  username: string;
}

export enum WidgetType {
  Pixelfed = "pixelfed",
  Mastodon = "mastodon",
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
  data: IPixelfed | IMastodon;
}

export const widgetSchema = new Schema<IWidget>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, required: true },
  variant: { type: Number, required: true },
  size: { type: Object, required: true },
  data: { type: Schema.Types.Mixed, required: true },
});

widgetSchema.pre("save", function (next) {
  console.log(this.type);
  switch (this.type) {
    case WidgetType.Pixelfed:
    case WidgetType.Mastodon:
      (this.data as IPixelfed | IMastodon).baseUrl = urlParser(
        this.data.baseUrl,
      );
      break;
  }
  next();
});

export default model<IWidget>("Widget", widgetSchema);
