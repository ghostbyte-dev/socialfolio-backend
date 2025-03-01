import User, { Status } from "../model/User.ts";
import Widget from "../model/Widget.ts";
import { IStats, IStatsWidget } from "../types/stats.types.ts";
import { WidgetType } from "../types/widget.types.ts";

export class StatsService {
    static async getStats(): Promise<IStats> {
        const userCount = await User.countDocuments({
            $or: [{ status: Status.Visible }, { status: Status.Hidden }]
        });

        const widgetCount = await Widget.countDocuments({
            user: { $in: await User.find({ $or: [{ status: Status.Visible }, { status: Status.Hidden }] }).distinct("_id") },
        });


        const topWidgetTypesWithTopVariant = await Widget.aggregate([
            {
                $group: {
                    _id: "$type",
                    totalCount: { $sum: 1 } // Count total widgets per type
                }
            },
            { $sort: { totalCount: -1 } }, // Sort by total count descending
            { $limit: 3 }, // Get top 3 most used types
            {
                $lookup: {
                    from: "widgets",
                    localField: "_id",
                    foreignField: "type",
                    as: "widgets"
                }
            },
            { $unwind: "$widgets" },
            {
                $group: {
                    _id: { type: "$_id", variant: "$widgets.variant" },
                    variantCount: { $sum: 1 } // Count occurrences of each variant per type
                }
            },
            {
                $sort: { "variantCount": -1 } // Sort variants by usage within each type
            },
            {
                $group: {
                    _id: "$_id.type",
                    topVariant: { $first: "$_id.variant" }, // Get the most used variant
                    totalCount: { $first: "$variantCount" } // Keep the correct count for top variant
                }
            },
            {
                $lookup: {
                    from: "widgets",
                    localField: "_id",
                    foreignField: "type",
                    as: "allWidgets"
                }
            },
            {
                $addFields: {
                    totalCount: { $size: "$allWidgets" } // Retrieve total count again
                }
            },
            {
                $project: {
                    allWidgets: 0 // Remove unnecessary field
                }
            },
            {
                $sort: { totalCount: -1 } // Final sorting by totalCount descending
            }
        ]);

        const formattedStats: IStatsWidget[] = topWidgetTypesWithTopVariant.map(item => ({
            type: item._id as WidgetType,
            mostUsedVariant: item.topVariant,
            count: item.totalCount
        }));

        const stats: IStats = {
            userCount,
            widgetCount,
            mostUsedWidgets: formattedStats
        }

        return stats
    }
}