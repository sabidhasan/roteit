import React from 'react';
import { Box, Flex, Link } from '@chakra-ui/react';
import NextLink from 'next/link';
import { loginPath, registerPath } from '../paths';

interface Props {}

export const Navbar: React.FC<Props> = () => {
  return (
    <Flex bg="sandybrown" padding={4}>
      <Box marginLeft="auto">
        <NextLink href={loginPath}>
          <Link marginRight={10}>Login</Link>
        </NextLink>
        <NextLink href={registerPath}>
          <Link marginRight={10}>Register</Link>
        </NextLink>
      </Box>
    </Flex>
  );
};