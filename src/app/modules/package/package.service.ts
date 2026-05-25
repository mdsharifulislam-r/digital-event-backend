import { Types } from "mongoose";
import { IPackage } from "./package.interface";
import { Package } from "./package.model";
import stripe from "../../../config/stripe";
import ApiError from "../../../errors/ApiError";
import { StatusCodes } from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { sendActivity } from "../../../handlers/activityHelper";
import { ACTIVITY_TYPE } from "../../../enums/activity";

const createPackageIntoDB = async (data:IPackage,user:JwtPayload)=>{
    const product = await stripe.products.create({
        name: data.label,
        description: data.description,
    })

    const price = await stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(data.priceMonthly * 100),
        currency: 'usd',
        recurring:{
            interval:"month"
        }
    
    })

    const payment_link = await stripe.paymentLinks.create({
        line_items: [
            {
                price: price.id,
                quantity: 1,
            },
        ],
    })

    const result = await Package.create({...data,priceId:price.id,payment_link:payment_link.url,product:product.id})
    sendActivity({title:"New Package Added",description:`${result?.label} package added`,user:user.id,type:ACTIVITY_TYPE.PACKAGE})
    return result
}

const getAllPackagesFromDB = async ()=>{
    const result = await Package.find({status:"active"})
    return result

    return result
}

const updatePackageToDB = async (id:Types.ObjectId,payload:Partial<IPackage>,user:JwtPayload)=>{
    const plan = await Package.findById(id)
    if(!plan){
        throw new ApiError(StatusCodes.BAD_REQUEST, "Package doesn't exist!");
    }

    if(payload?.priceMonthly!>=0 &&payload.priceMonthly!==plan.priceMonthly){
        const newPrice = await stripe.prices.create({
            product: plan.product,
            unit_amount: Math.round(payload?.priceMonthly||0 * 100),
            currency: 'usd',
            recurring:{
                interval:"month"
            }
        })

        await stripe.prices.update(plan.priceId!,{
            active:false
        })

        const payment_link = await stripe.paymentLinks.create({
            line_items: [
                {
                    price: newPrice.id,
                    quantity: 1,
                },
            ],
        })

        payload.priceId = newPrice.id
        payload.payment_link = payment_link.url
    }

    if(payload?.label || payload.description){
        await stripe.products.update(plan.product!,{
            name:payload.label || plan.label,
            description:payload.description || plan.description,
        })
    }
    const result = await Package.findOneAndUpdate({_id:id},payload,{new:true})
    sendActivity({title:"Package Updated",description:`${result?.label} package updated`,user:user.id,type:ACTIVITY_TYPE.PACKAGE})
    return result
}

const deletePackageFromDB = async (id:Types.ObjectId,user:JwtPayload)=>{
    const result = await Package.findOneAndUpdate({_id:id},{status:'delete'})
    sendActivity({title:"Package Deleted",description:`${result?.label} package deleted`,user:user.id,type:ACTIVITY_TYPE.PACKAGE})
    return result
}

export const PackageService = {
    createPackageIntoDB,
    getAllPackagesFromDB,
    updatePackageToDB,
    deletePackageFromDB
}