import mongoose from "mongoose";

let customerSchema = new mongoose.Schema({
  name: { type: String, lowercase: true, required: true },
  address: { type: String, lowercase: true },
  phone: [{ type: String, maxLength: 10, minlength: 10, unique: true }],
  trade: {
    type: {
      due: { type: Number, default: 0 },
      paid: { type: Number, default: 0 },
      total: { type: Number },
    },
    required: true,
    default: {
      due: 0,
      paid: 0,
      total: undefined,
    },
  },
});

customerSchema.pre("save", function (next) {
  this.trade.total = this.trade.due - this.trade.paid;

  next();
});

let Customer = mongoose.model("Customer", customerSchema);

export default Customer;
