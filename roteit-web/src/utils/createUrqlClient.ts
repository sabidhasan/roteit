import { cacheExchange, Resolver } from '@urql/exchange-graphcache';
import { dedupExchange, fetchExchange, Exchange, stringifyVariables } from 'urql';
import { pipe, tap } from 'wonka';
import Router from 'next/router';
import gql from 'graphql-tag';
import { LogoutMutation, MeDocument, MeQuery, VoteMutationVariables } from '../generated/graphql';
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


// Adapted from https://github.com/FormidableLabs/urql/blob/main/exchanges/graphcache/src/extras/simplePagination.ts
const cursorBasedPaginationExchange = (): Resolver => {
  return (_parent, fieldArgs, cache, info) => {
    const { parentKey, fieldName } = info;
    
    // get all fields from the current cache, and remove all but the desired field name
    const allFields = cache.inspectFields(parentKey);
    const fieldInfos = allFields.filter(info => info.fieldName === fieldName);
    const size = fieldInfos.length;

    if (size === 0) {
      return undefined;
    }
    
    // If data is in cache, return it from the cache
    const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;
    const isInCache = cache.resolve(cache.resolve(parentKey, fieldKey) as string, 'posts');
    info.partial = !isInCache;

    let done = false;
    const post: string[] = [];
    fieldInfos.forEach((fieldInfo) => {
      const key = cache.resolve(parentKey, fieldInfo.fieldKey) as string;
      const posts = cache.resolve(key, 'posts') as string[];
      post.push(...posts);

      // Update done variable
      const currentKeyIsDone = cache.resolve(key, 'done') as boolean;
      if (currentKeyIsDone) {
        done = true;
      }

    });

    return {
      __typename: 'PostsPaginated',
      done,
      post: post,
    };
  };
};

// Creates URQL client using withUrqlClient
export const createUrqlClient = (ssrExchange: any, ctx: any) => ({
  url: 'http://localhost:4000/graphql',
  fetchOptions: {
    credentials: 'include' as const,
    // Pass on the cookie for SSR onto GQL server
    headers: { cookie: ctx?.req?.headers?.cookie },
  },
  exchanges: [
    dedupExchange,
    cacheExchange({
      keys: {
        PostsPaginated: () => null,
      },
      resolvers: {
        Query: {
          posts: cursorBasedPaginationExchange(),
        }
      },
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
          },
          createPost: (_result, args, cache, info) => {
            // Invalidate post cache
            const allFields = cache.inspectFields('Query');
            const fieldInfos = allFields.filter((f) => f.fieldName === 'posts');
            fieldInfos.forEach((fieldInfo) => {
              cache.invalidate('Query', 'posts', fieldInfo.arguments || {});
            });
          },
          vote: (_result, args, cache, info) => {
            // 
            const { postId, value } = args as VoteMutationVariables;
            const data: any = cache.readFragment(gql`
              fragment _ on Post {
                id,
                points,
                voteStatus,
              }
            `, { id: postId });

            if (data) {
              if (data.voteStatus === args.value) return;
              const updatedPoints = (data.points as number) + ((!data.voteStatus ? 1 : 2) * value);
              cache.writeFragment(gql`
                fragment __ on Post {
                  points
                  voteStatus
                }
              `, { points: updatedPoints, id: postId, voteStatus: value });
            }
          }
        },
      },
    }),
    errorExchange,
    ssrExchange,
    fetchExchange
  ],
});
