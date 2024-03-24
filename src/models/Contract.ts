import mongoose from 'mongoose';

import Product from './Product';
import Customer from './Customer';
import AppError from '../utils/appError';



interface IContract {
    customerId: mongoose.Schema.Types.ObjectId;
    items: Array<{
        quantity: Number;
        price: Number;
        productId: mongoose.Schema.Types.ObjectId;

    }>;
    interval: Number;
    commencedDate: Array<{}>
}

const contractSchema = new mongoose.Schema<IContract>({
    customerId: {
        type: mongoose.Schema.ObjectId, ref: "Customer",
        required: true

    },
    items: {
        type: [{
            productId: {
                type: mongoose.Schema.ObjectId,
                ref: "Product",
                required: true
            },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true },
        }],
        required: true,
        validate: (v: any) => v.length > 0,

    },
    interval: {
        type: Number
    },
    commencedDate: {
        type: [
            {
                type: Date,

            }
        ]
    }



});




contractSchema.pre('save', async function (next) {

    let products = await Product.find().select("name _id price");

    this.items.forEach((item) => {
        if (item.productId) {
            let productById = products.find((product) => {
                return product._id.toString() === item.productId.toString();
            });
            if (!productById)
                throw new Error(`Product with id ${item.productId} not found.`);

            // let productById = await Product.findById(item.productId);
            //   item.productName = productById.name;
            //   item.priceThen = productById.price;
        }
    })
    next();
}
)


const Contract = mongoose.model('Contract', contractSchema);

export default Contract;