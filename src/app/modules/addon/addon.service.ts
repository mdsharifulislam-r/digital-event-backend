import { JwtPayload } from 'jsonwebtoken';
import { AddonModel, IAddon } from './addon.interface';
import { Addon } from './addon.model';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import { Subscription } from '../subscription/subscription.model';
import stripe from '../../../config/stripe';
import { sendActivity } from '../../../handlers/activityHelper';
import { ACTIVITY_TYPE } from '../../../enums/activity';


const createAddonToDB = async (addonData: IAddon,user:JwtPayload): Promise<IAddon> => {
    const addon = await Addon.create(addonData);
    sendActivity({title:"New Addon Added",description:"You have a new addon added to your subscription",user:user.id,type:ACTIVITY_TYPE.OTHER})
    return addon;
};

const getAllAddons = async (): Promise<IAddon[]> => {
    const addons = await Addon.find({});
    return addons;
};

const updateAddonToDB = async (id: string, payload: IAddon,user:JwtPayload): Promise<IAddon | null> => {
    const result = await Addon.findOneAndUpdate({_id:   id }, payload, {
        new: true,
    });
    sendActivity({title:"Addon Updated",description:"You have a addon updated to your subscription",user:user.id,type:ACTIVITY_TYPE.OTHER})
    return result;
};

const deleteAddonFromDB = async (id: string,user:JwtPayload): Promise<IAddon | null> => {
    const result = await Addon.findOneAndDelete({ _id: id });
    sendActivity({title:"Addon Deleted",description:"You have a addon deleted to your subscription",user:user.id,type:ACTIVITY_TYPE.OTHER})
    return result;
};

const purchaseAddonToDB = async (id: string,user:JwtPayload) => {
    const  addon = await Addon.findOne({ _id: id }).lean();
    if (!addon) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Addon doesn't exist!");
    }
    const currentSubscription = await Subscription.findOne({ user: user.id,status:"active" }).lean()
    if (!currentSubscription) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "You have no active subscription! Please subscribe first.");
    }

    const existModule = currentSubscription.modules?.some(item=>item == addon.linkedModule)
    if(existModule){
      throw new ApiError(StatusCodes.BAD_REQUEST, "You already have this module!");
    }
    
    const session = await stripe.checkout.sessions.create({
        line_items:[{
            price_data: {
                currency: "usd",
                product_data: {
                    name: addon.label,
                    description: addon.description,
                },
                unit_amount: Math.round(addon.priceMonthly * 100),
            },
            quantity: 1
        }],
        mode: "payment",
        success_url: `${config.frontend}/subscription/success`,
        cancel_url: `${config.frontend}/subscription/cancel`,
        customer_email: user.email,
        metadata: {
            addonId: addon._id.toString(),
            userId: user.id
        }
    })

    return session?.url
};


export const AddonServices = { 
    createAddonToDB,
    getAllAddons,
    updateAddonToDB,
    deleteAddonFromDB,
    purchaseAddonToDB
};
