import React from 'react';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../../utils/createUrqlClient';
import Layout from '../../components/Layout';
import { Flex, Heading } from '@chakra-ui/react';
import { useGetPostFromURL } from '../../utils/hooks/useGetPostFromURL';
import EditDeletePostButtons from '../../components/EditDeletePostButtons';

const Post = () => {
  const { postOptions } = useGetPostFromURL();
  const postQuery = postOptions[0];

  if (postQuery.fetching || !postQuery.data || !postQuery.data.post) {
    return <Layout>Loading posts...</Layout>
  }

  return (
    <Layout>
      <Flex>
        <Heading>{postQuery.data.post.title}</Heading>
        <EditDeletePostButtons id={postQuery.data.post.id} />
      </Flex>
      {postQuery.data?.post?.text || 'none'}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Post);
