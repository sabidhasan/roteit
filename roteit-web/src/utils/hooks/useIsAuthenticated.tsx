import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useMeQuery } from '../../generated/graphql';
import { loginPath } from '../../paths';

export const useIsAuthenticated = () => {
  const [queryResponse] = useMeQuery();
  const router  = useRouter();

  useEffect(() => {
    // Redirect to login if not logged in
    if (!queryResponse?.data?.me && !queryResponse?.fetching) {
      router.replace(`${loginPath}?redirect=${router.pathname}`);
    }
  }, [queryResponse.data, router, queryResponse.fetching]);
};
