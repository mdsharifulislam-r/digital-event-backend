import mongoose from "mongoose";
import { IPackage, PackageModel } from "./package.interface";


const packageSchema = new mongoose.Schema<IPackage,PackageModel>({

    priceId: {
        type: String,
    },
    product: {
        type: String,
    },
    payment_link: {
        type: String,
    },
    features: {
        type: [String],
        required: true,
    },

    status: {
        type: String,
        enum: ['active', 'delete'],
        default: 'active',
    },
    audience: {
        type: String,
        required: true,
    },
    modules: {
        type: [Number],
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    can_charge: {
        type: Boolean,
        required: true,
    },
    label: {
        type: String,
        required: true,
    },
    short: {
        type: String,
        required: true,
    },
    color: {
        type: String,
        required: true,
    },
    priceMonthly: {
        type: Number,
        required: true,
    },
    recommended: {
        type: Boolean,
        default: false,
    },

},{
    timestamps: true
})

export const Package = mongoose.model<IPackage, PackageModel>("Package", packageSchema);