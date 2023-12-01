const mongoose = require("mongoose");

let customerSchema = new mongoose.Schema({
  name: { type: String, lowercase: true, required: true },
  address: { type: String, lowercase: true },
  phone: [{ type: String, maxLength: 10, minlength: 10, unique: true }],
});

let Customer = mongoose.model("Customer", customerSchema);

module.exports = Customer;
