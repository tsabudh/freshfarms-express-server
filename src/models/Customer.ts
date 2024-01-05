import mongoose from "mongoose";

let customerSchema = new mongoose.Schema({
  name: { type: String, lowercase: true, required: true },
  address: { type: String, lowercase: true },
  phone: [{ type: String, maxLength: 10, minlength: 10, unique: true }],
  tab: {
    type: {
      purchase: { type: Number, default:0},
      paid: { type: Number, default: 0 },
      due: { type: Number, default: 0 },
    },
    required: true,
    default: {
      due: 0,
      paid: 0,
      purchase: 0,
    },
  },
});

//- ENTRY INTO TABS AFTER PURCHASE
customerSchema.pre("save", function (next) {
 this.tab.due  = this.tab.purchase  - this.tab.paid;

  next();
});
customerSchema.pre("save", async function (next) {
  if (!this.isNew) next();
  for (let item of this.phone) {
    let matched = await Customer.find({ phone: item });
    console.log(matched);
    if (matched.length != 0)
      throw new Error(
        `This phone number is already registered in another customer's account.`
      );
    next();
  }
});

let Customer = mongoose.model("Customer", customerSchema);

export default Customer;
