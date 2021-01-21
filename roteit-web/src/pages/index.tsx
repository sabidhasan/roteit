import React from 'react';
import { withUrqlClient } from 'next-urql';
import { Box, Link } from '@chakra-ui/react';
import NextLink from 'next/link';
import { createUrqlClient } from '../utils/createUrqlClient';
import { usePostsQuery } from '../generated/graphql';
import Layout from '../components/Layout';
import { createPostPath } from '../paths';

const Index = () => {
  const [{ data }] = usePostsQuery();
  console.log(data);

  return (
    <Layout>
      <Box marginBottom={15}>
        <NextLink href={createPostPath}>
          <Link>Create Post</Link>
        </NextLink>
      </Box>
      {
        !data ? null : data.posts.map((d) => <p key={d.id}>{d.title}</p>)
      }
    </Layout>
  )
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
