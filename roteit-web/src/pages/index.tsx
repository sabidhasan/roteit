import React, { useState } from 'react';
import { withUrqlClient } from 'next-urql';
import { Box, Button, Flex, Heading, Link, Stack, Text } from '@chakra-ui/react';
import NextLink from 'next/link';
import { createUrqlClient } from '../utils/createUrqlClient';
import { usePaginatedPostsQuery } from '../generated/graphql';
import Layout from '../components/Layout';
import { createPostPath } from '../paths';

const Index = () => {
  const [cursor, setCursor] = useState<undefined | string>(undefined);
  const [{ data, fetching }] = usePaginatedPostsQuery({ variables: { limit: 10, cursor } });

  let postContent: React.ReactNode;

  if (!fetching && !data) {
    postContent = <Text>Could not load posts. Try refreshing :(</Text>;
  }

  postContent = (fetching && !data ) ?
    (<div>Loading</div>) :
    (
      <Stack spacing={10}>
        {!data?.posts.posts.length ? null : data.posts.posts.map((d) => (
          <Box key={d.id} borderWidth={2} shadow="sm" padding={3}>
            <Heading size="l">{d.title}</Heading>
            <Text size="m">{d.textSnippet}...</Text>
          </Box>
        ))}
      </Stack>
    );

  return (
    <Layout>
      <Flex align="center" marginBottom={15} marginTop={5}>
        <Heading>RoteIt</Heading>
        <Box marginLeft="auto">
          <NextLink href={createPostPath}>
            <Link>Create Post</Link>
          </NextLink>
        </Box>
      </Flex>
      {postContent}
      {
        data && !data.posts.done ? 
          (
            <Flex margin={5} justifyContent="center">
              <Button
                isLoading={fetching}
                border="1px"
                onClick={() => setCursor(data?.posts.posts.[data?.posts.posts.length - 1].createdAt)}
              >
                Load More
              </Button>
            </Flex>
          ) :
          null
      }
    </Layout>
  )
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
