import { model, Schema } from "mongoose";
import { DisclaimerModel, IDisclaimer } from "./disclaimer.interface";

const disclaimerSchema = new Schema<IDisclaimer,DisclaimerModel>({
    content: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['terms', 'privacy', 'about','terms-user', 'terms-organization','privacy-user', 'privacy-organization'],
        required: true
    }
},{
    timestamps: true
})


export const Disclaimer = model<IDisclaimer, DisclaimerModel>("Disclaimer", disclaimerSchema);