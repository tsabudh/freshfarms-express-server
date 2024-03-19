import mongoose from 'mongoose';

import Product from './Product';
import Customer from './Customer';
import AppError from '../utils/appError';



interface IContract {
    customerId: mongoose.Schema.Types.ObjectId;
    items: Array<{
        quantity: Number;
        price: Number;

    }>;
    interval: Number;
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
    }

});

const Contract = mongoose.model('Contract', contractSchema);

export default Contract;