import mongoose from 'mongoose';
import Product from './Product';

interface IContract extends mongoose.Document {
    customerId: mongoose.Types.ObjectId;
    items: Array<{
        quantity: number;
        price: number;
        productId: mongoose.Types.ObjectId;

    }>;
    interval: number;
    commencedDate: Date[]
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