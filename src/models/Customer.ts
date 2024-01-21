import mongoose from "mongoose";

let customerSchema = new mongoose.Schema({
  name: { type: String, lowercase: true, required: true },
  address: { type: String, lowercase: true },
  phone: [{ type: String, maxLength: 10, minlength: 10, unique: true }],

  // Location information (optional)
  location: {
    type: {
      type: String,
      enum: ['Point']
    },
    coordinates: {
      type: [Number]
    }
  },
  /* 
  While creating a new customer.
  location: {
    type: 'Point',
    coordinates: [longitude, latitude]
  }
  */

  // Customer tabs
  tab: {
    type: {
      purchase: { type: Number, default: 0 },
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
},
  // Add timestamps for createdAt and updatedAt
  { timestamps: true })

//- ENTRY INTO TABS AFTER PURCHASE
customerSchema.pre("save", function (next) {
  this.tab.due = this.tab.purchase - this.tab.paid;

  next();
});

//- Ensuring that provided phone number is unique
customerSchema.pre("save", async function (next) {
  if (!this.isNew) next();
  for (let item of this.phone) {
    let matched = await Customer.find({ phone: item });
    if (matched.length != 0)
      throw new Error(
        `This phone number is already registered in another customer's account.`
      );
    next();
  }
});

//- Attaching timestamp to path 'updatedAt'
customerSchema.pre("save", async function (next) {


})




let Customer = mongoose.model("Customer", customerSchema);

export default Customer;
