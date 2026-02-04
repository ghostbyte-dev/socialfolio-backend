import { WidgetType } from "./widget.types.ts";

export interface IStats {
  userCount: number;
  widgetCount: number;
  viewsCount: number;
  mostUsedWidgets: IStatsWidget[];
}

export interface IStatsWidget {
  type: WidgetType;
  mostUsedVariant: number;
  count: number;
}

export interface IStatsWidgetWithoutVariant {
  type: WidgetType;
  count: number;
}
