import { Model } from "mongoose";

export type IDisclaimer = {
    content:string;
    type:"terms"|"privacy"|"about"|"terms-user"|"terms-organization"|"privacy-user"|"privacy-organization";
}

export type DisclaimerModel = Model<IDisclaimer>