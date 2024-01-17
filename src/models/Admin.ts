import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

// dotenv.config({ path: '.env' })

// console.log(process.env.AWS_ACCESS_KEY)


const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  //   userName:{type:String, }
  phone: [{ type: String, required: true, unique: true }],
  password: { type: String, required: true, select: false },
  profilePicture:{type:String, required:false},
  createdAt: { type: Date, default: Date.now() },
  username: { type: String, unique: true, required: true },
});


//- CHECK USERNAME VALIDITY
adminSchema.pre("save", function (next) {
  let matches = /^[a-z][a-z0-9._]*$/.test(this.username);
  if (!matches) {

    let err = new Error('Username defined out of the rules.');
    next(err);
    throw err;

  }
  next();
});

adminSchema.pre("save", function (next) {
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(this.password, salt);
  this.password = hashedPassword;
  next();
});

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;
