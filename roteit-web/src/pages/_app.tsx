import { ChakraProvider, ColorModeProvider } from '@chakra-ui/react';
import { createClient, dedupExchange, fetchExchange, Provider } from 'urql';
import { cacheExchange } from '@urql/exchange-graphcache';
import theme from '../theme';
import { updateQuery } from '../utils/updateQuery';
import { LogoutMutation, MeDocument, MeQuery } from '../generated/graphql';

const client = createClient({
  url: 'http://localhost:4000/graphql',
  fetchOptions: {
    credentials: 'include',
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
  }), fetchExchange],
});

function App({ Component, pageProps }) {
  return (
    <Provider value={client}>
      <ChakraProvider resetCSS theme={theme}>
        <ColorModeProvider
          options={{
            useSystemColorMode: true,
          }}
        >
          <Component {...pageProps} />
        </ColorModeProvider>
      </ChakraProvider>
    </Provider>
  )
}

export default App;
