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
        required:true

    },
    items: [
        {
            productId: {
                type: mongoose.Schema.ObjectId,
                ref: "Product",
            },
            quantity: Number,
            price: Number,
        }
    ],
    interval: {
        type: Number
    }

});

const Contract = mongoose.model('Contract', contractSchema);

export default Contract;