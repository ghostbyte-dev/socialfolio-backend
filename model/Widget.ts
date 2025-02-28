import { ObjectId } from "mongoose";
import { model, Schema } from "mongoose";
import { urlParser } from "../utils/UrlParser.ts";

export interface IPixelfed {
  instance: string;
  username: string;
}

export interface ILemmy {
  instance: string;
  username: string;
}

export interface IMastodon {
  instance: string;
  username: string;
}

export interface INote {
  note: string;
}

export interface IGithub {
  username: string;
}

export interface ILiberaPay {
  username: string;
}

export interface ILocalTime {
  timezone: string;
}

export enum WidgetType {
  Pixelfed = "pixelfed",
  Mastodon = "mastodon",
  Note = "note",
  Github = "github",
  LocalTime = "localTime",
  Lemmy = "lemmy",
  Liberapay = "liberapay"
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
  priority: number;
  data: IPixelfed | IMastodon | INote | IGithub | ILocalTime | ILemmy | ILiberaPay;
}

export const widgetSchema = new Schema<IWidget>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, required: true },
  variant: { type: Number, required: true },
  size: { type: Object, required: true },
  priority: { type: Number, required: true, default: 1 },
  data: { type: Schema.Types.Mixed, required: true },
});

widgetSchema.pre("save", function (next) {
  console.log("Save");
  switch (this.type) {
    case WidgetType.Pixelfed:
    case WidgetType.Lemmy:
    case WidgetType.Mastodon:
      (this.data as IPixelfed | IMastodon | ILemmy).instance = urlParser(
        (this.data as IPixelfed | IMastodon | ILemmy).instance,
      );
      break;
  }
  next();
});

export default model<IWidget>("Widget", widgetSchema);
