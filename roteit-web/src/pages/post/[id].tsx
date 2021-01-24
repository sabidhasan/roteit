import React from 'react';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import { createUrqlClient } from '../../utils/createUrqlClient';
import { usePostQuery } from '../../generated/graphql';
import Layout from '../../components/Layout';
import { Heading } from '@chakra-ui/react';

const Post = () => {
  const router = useRouter();
  const invalidURLParam = typeof router.query.id !== 'string';
  const [postQuery] = usePostQuery({
    pause: invalidURLParam,
    variables: { id: Number(router.query.id) },
  });

  if (postQuery.fetching) {
    return <Layout>Loading posts...</Layout>
  }

  return (
    <Layout>
      <Heading>{postQuery.data?.post?.title}</Heading>
      {postQuery.data?.post?.text || 'none'}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Post);
