import { Cache, QueryInput } from '@urql/exchange-graphcache';

// Helper that wraps `cache.updateQuery` and provides improved typing.
// Used for URQL cache invalidation (updating the URQL GQL cache query from an unrelated mutation)
// Takes generic type Mutation and Query and an updater function
export function updateQuery<Mutation, Query>(cache: Cache, queryInput: QueryInput, result: any, updateFn: (updateResult: Mutation, query: Query) => Query) {
  cache.updateQuery(queryInput, (data) => updateFn(result, data as any) as any);
}
