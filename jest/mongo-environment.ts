// jest/mongo-environment.ts
import NodeEnvironment from 'jest-environment-node';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') }); // adjust path if needed

class MongoEnvironment extends NodeEnvironment {
  constructor(config: any, context: any) {
    super(config, context);
  }

 override async setup() {
    await super.setup();

    if (mongoose.connection.readyState === 0) {
      const mongoURI = (process.env['DATABASE_STRING'] as string).replace(
        '<password>',
        process.env['DATABASE_PASSWORD'] as string
      );
      await mongoose.connect(mongoURI, {
        // Optional mongoose connection options
        // useNewUrlParser: true,
        // useUnifiedTopology: true,
      });
      console.log('Jest environment setup: Connected to MongoDB');
    }

    // Expose the mongoose connection or mongoose itself to tests via global
    this.global['mongoose'] = mongoose;
  }

  override async teardown() {
    await mongoose.disconnect();
    console.log('Jest environment teardown: Disconnected from MongoDB');
    await super.teardown();
  }

//   runScript(script: any) {
//     return super.runScript(script);
//   }
}

export default MongoEnvironment;
