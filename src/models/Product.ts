import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, lowercase: true, required: true, unique: true },
  unit: { type: String, enum: ['kg', 'scoop', 'litre'], required: true },
  code: { type: String, lowercase: true, required: true, maxLength: 3 },
  price: { type: Number, required: true },

  stock: { type: Number, required: true, default: 0 },

  productType: { type: String, enum: ["cow", "buffalo", "mixed"] },

  sales: { type: Number },
});

const Product = mongoose.model("Product", productSchema);
export default Product;
