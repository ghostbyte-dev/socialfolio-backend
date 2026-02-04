import { model, Schema, Types } from "mongoose";

interface IView {
    timestamp: Date;
    profileId: Types.ObjectId;
}

const viewSchema = new Schema<IView>({
    timestamp: { type: Date, required: true },
    profileId: { type: Schema.Types.ObjectId, ref: "User", required: true },
}, {
    timeseries: {
        timeField: 'timestamp',
        metaField: 'profileId',
        granularity: 'minutes',
    },
    expireAfterSeconds: 31536000 
});

export default model("Views", viewSchema);
