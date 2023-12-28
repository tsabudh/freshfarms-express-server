import mongoose from 'mongoose';
declare module 'mongoose' {
    interface DocumentQuery<T,  DocType extends mongoose.Document, QueryHelpers = {}>{
      mongooseCollection: {
        name: any;
      };
      cache():DocumentQuery<T[], Document> & QueryHelpers;
      useCache: boolean;
      hashKey: string;
  
    }
  }