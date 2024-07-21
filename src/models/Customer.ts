import mongoose from "mongoose";
import bcrypt from "bcrypt";

let customerSchema = new mongoose.Schema({
  name: { type: String, lowercase: true, required: true },
  username: { type: String, unique: true, required: true, lowercase: true },
  password: { type: String, required: true, select: false },
  address: { type: String, lowercase: true },
  phone: [{ type: String, maxLength: 10, minlength: 10, unique: true }],
  profilePicture: { type: String, default: 'default-admin-profile-picture.webp', required: false },
  role: {
    type: String,
    required: true,
    default: 'customer',
    immutable: true // This makes the 'type' field immutable
  },
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



customerSchema.pre("save", function (next) {

  if (!this.isModified("password")) return next();

  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(this.password, salt);
  this.password = hashedPassword;
  next();
});


let Customer = mongoose.model("Customer", customerSchema);

export default Customer;
