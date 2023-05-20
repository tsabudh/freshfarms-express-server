const mongoose = require("mongoose");

let customerSchema = new mongoose.Schema({
  name: String,
  address: String,
  phone: [{ type: String, maxLength: 10, minlength: 10 , unique:true}],
});

let Customer = mongoose.model("Customer", customerSchema);

module.exports = Customer;
