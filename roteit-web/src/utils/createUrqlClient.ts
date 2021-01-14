import { cacheExchange } from '@urql/exchange-graphcache';
import { LogoutMutation, MeDocument, MeQuery } from '../generated/graphql';
import { dedupExchange, fetchExchange } from 'urql';
import { updateQuery } from './updateQuery';

// Creates URQL client using withUrqlClient
export const createUrqlClient = (ssrExchange: any) => ({
  url: 'http://localhost:4000/graphql',
  fetchOptions: {
    credentials: 'include' as const,
  },
  exchanges: [dedupExchange, cacheExchange({
    updates: {
      Mutation: {
        logout: (_result, args, cache, info) => {
          updateQuery<LogoutMutation, MeQuery>(
            cache,
            { query: MeDocument },
            _result,
            // Clear out the user cache, as the user has logged out
            () => ({ me: null })
          );
        }
      },
    },
  }), ssrExchange, fetchExchange],
});
