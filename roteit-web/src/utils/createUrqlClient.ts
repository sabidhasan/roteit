import { cacheExchange } from '@urql/exchange-graphcache';
import { dedupExchange, fetchExchange, Exchange } from 'urql';
import { pipe, tap } from 'wonka';
import Router from 'next/router';
import { LogoutMutation, MeDocument, MeQuery } from '../generated/graphql';
import { updateQuery } from './updateQuery';
import { loginPath } from '../paths';

// This custom exchange from https://github.com/FormidableLabs/urql/issues/225 catches all errors
// and redirects non-authenticated to 
const errorExchange: Exchange = ({ forward }) => ops$ => {
  return pipe(
    forward(ops$),
    tap(({ error }) => {
      if (error?.message.includes('Auth token missing')) {
        // redirect to login since user is not authenticated
        Router.replace(loginPath);
      }
    })
  );
};

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
  }), errorExchange, ssrExchange, fetchExchange],
});
