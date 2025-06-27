type CacheOptions = { key?: string; time?: number };

declare module 'mongoose' {
  interface Query<
    ResultType,
    DocType,
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    THelpers = {},
    RawDocType = unknown,
    QueryOp = 'find',
    TDocOverrides = Record<string, never>,
  > {
    cache(
      options?: CacheOptions,
    ): Query<ResultType, DocType, THelpers, RawDocType, QueryOp, TDocOverrides>;
    useCache: boolean;
    hashKey: string;
  }
}
