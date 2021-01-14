import React from 'react';
import { Box, Button, Flex, Link } from '@chakra-ui/react';
import NextLink from 'next/link';
import { loginPath, registerPath } from '../paths';
import { useMeQuery, useLogoutMutation } from '../generated/graphql'

interface Props {}

export const Navbar: React.FC<Props> = () => {
  const [{ fetching, data, error }] = useMeQuery({ requestPolicy: 'network-only' });
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();


  let body: React.ReactNode;

  if (data?.me) {
    // User logged in
    body = (
      <Flex>
        <Box marginRight={5}>{data.me.username}</Box>
        <Button
          variant="link"
          onClick={() => logout()}
          isLoading={logoutFetching}
        >
          Log Out
        </Button>
      </Flex>
    )
  } else if (fetching) {
    // Loading
    body = <Box>Loading...</Box>;
  } else {
    // User not logged in
    body = (
      <>
        <NextLink href={loginPath}>
          <Link marginRight={10}>Login</Link>
        </NextLink>
        <NextLink href={registerPath}>
          <Link marginRight={10}>Register</Link>
        </NextLink>
      </>
    );
  }

  return (
    <Flex bg="sandybrown" padding={4}>
      {body}
      <Box marginLeft="auto">
      </Box>
    </Flex>
  );
};