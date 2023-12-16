import mongoose from 'mongoose';
import bcrypt from 'bcrypt';



const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  //   userName:{type:String, }
  phone: [{ type: String, required: true, unique: true }],
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now() },
  username: { type: String },
});

adminSchema.pre("save", function (next) {
  this.username = this.name.toLocaleLowerCase().replace(" ", ".");
  next();
});

adminSchema.pre("save", function (next) {
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(this.password, salt);
  this.password = hashedPassword;
  next();
});

const Admin = mongoose.model("Admin", adminSchema);

export default  Admin;
