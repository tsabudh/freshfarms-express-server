import mongoose from 'mongoose';
declare module 'mongoose' {
  interface DocumentQuery<T, DocType extends mongoose.Document, QueryHelpers = object> {
    mongooseCollection: {
      name: any;
    };
    cache(): DocumentQuery<T[], DocType> & QueryHelpers;
    useCache: boolean;
    hashKey: string;
  }
}
