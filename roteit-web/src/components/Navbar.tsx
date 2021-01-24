import React from 'react';
import { Box, Button, Flex, Heading, Link, Divider } from '@chakra-ui/react';
import NextLink from 'next/link';
import { createPostPath, homePath, loginPath, registerPath } from '../paths';
import { isClientSide } from '../utils/isClientSide';
import { useMeQuery, useLogoutMutation } from '../generated/graphql'

export const Navbar: React.FC<{}> = () => {
  const [{ fetching, data }] = useMeQuery({
    requestPolicy: 'network-only',
    pause: !isClientSide(),
  });
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();

  let body: React.ReactNode;

  if (data?.me) {
    // User logged in
    body = (
      <Flex alignItems="center">
        <NextLink href={createPostPath}>
          <Button as={Link} marginRight={3}>Create Post</Button>
        </NextLink>
        <Divider orientation="vertical" marginRight={3} />
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
    <Flex bg="sandybrown" padding={4} position="sticky" top={0} zIndex={9999}>
      <NextLink href={homePath}>
        <Link>
          <Heading>RoteIt</Heading>
        </Link>
      </NextLink>  
      <Box marginLeft="auto"></Box>
      {body}
    </Flex>
  );
};