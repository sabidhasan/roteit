import React, { useState } from 'react';
import { withUrqlClient } from 'next-urql';
import { Button, Flex, Stack, Text } from '@chakra-ui/react';
import { createUrqlClient } from '../utils/createUrqlClient';
import { usePaginatedPostsQuery } from '../generated/graphql';
import Layout from '../components/Layout';
import PostVotes from '../components/PostVotes';

const Index = () => {
  const [cursor, setCursor] = useState<undefined | string>(undefined);
  const [{ data, fetching }] = usePaginatedPostsQuery({ variables: { limit: 10, cursor } });

  let postContent: React.ReactNode;

  if (!fetching && !data) {
    postContent = <Text>Could not load posts. Try refreshing :(</Text>;
  }

  postContent = (fetching && !data) ?
    (<div>Loading</div>) :
    (
      <Stack spacing={10}>
        {!data?.posts.posts.length ? null : data.posts.posts.map((post) => (post ? <PostVotes post={post} key={post.id} /> : null))}
      </Stack>
    );

  return (
    <Layout>
      {postContent}
      {
        data && !data.posts.done ? 
          (
            <Flex margin={5} justifyContent="center">
              <Button
                isLoading={fetching}
                border="1px"
                onClick={() => setCursor(data?.posts.posts[data?.posts.posts.length - 1].createdAt)}
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
