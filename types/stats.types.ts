import { WidgetType } from "./widget.types.ts";

export interface IStats {
  userCount: number;
  widgetCount: number;
  mostUsedWidgets: IStatsWidget[];
}

export interface IStatsWidget {
  type: WidgetType;
  mostUsedVariant: number;
  count: number;
}
