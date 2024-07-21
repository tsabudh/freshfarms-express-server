import mongoose from 'mongoose';
import bcrypt from 'bcrypt';


const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  //   userName:{type:String, }
  phone: [{ type: String, required: true, unique: true }],
  password: { type: String, required: true, select: false },
  profilePicture: { type: String, default: 'default-admin-profile-picture.webp', required: false },
  createdAt: { type: Date, default: Date.now() },
  username: { type: String, unique: true, required: true, lowercase: true },
  role: {
    type: String,
    required: true,
    default: 'admin',
    immutable: true // This makes the 'type' field immutable
  },
});


//- Checking format of provided username
adminSchema.pre("save", function (next) {
  let matches = /^[a-z][a-z0-9._]*$/.test(this.username);
  if (!matches) {

    let err = new Error('Username defined out of the rules.');
    next(err);
    throw err;

  }
  next();
});


//- Ensuring that provided username is unique
adminSchema.pre("save", async function (next) {
  if (!this.isNew) next();
  this.username = this.username.toLocaleLowerCase();

  let matched = await Admin.find({ username: this.username });
  if (matched.length != 0) {
    throw new Error(
      `This username is taken. Try another one.`
    );

  } else {
    next();
  }
})


adminSchema.pre("save", function (next) {
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(this.password, salt);
  this.password = hashedPassword;
  next();
});

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;
