import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { Box, Flex, Heading, IconButton, Text } from '@chakra-ui/react';
import React, { useState } from 'react';
import { Spinner } from "@chakra-ui/react"
import { PostFragmentFragment, useVoteMutation } from '../generated/graphql';

interface Props {
  post: PostFragmentFragment;
}

type TLoading = 'up-loading' | 'down-loading' | 'no-loading';

const PostVotes: React.FC<Props> = ({ post }) => {
  const [, vote] = useVoteMutation();
  const [loading, setLoading] = useState<TLoading>('no-loading');

  const handleVote = async (type: 'up' | 'down') => {
    const value = type === 'up' ? 1 : -1;
    if (post.voteStatus !== value) {
      // If voteStatus is equal to points, user has already voted
      setLoading(type === 'up' ? 'up-loading' : 'down-loading');
      await vote({
        value,
        postId: post.id
      });
      setLoading('no-loading');
    }
  };

  return (
    <Flex key={post.id} borderWidth={2} shadow="sm" padding={3}>
      <Flex flexDirection="column" alignItems="center" marginRight={2} cursor="default">
        <IconButton
          isLoading={loading === 'up-loading'}
          colorScheme={post.voteStatus === 1 ? 'green' : undefined}
          aria-label="upvote"
          icon={<ChevronUpIcon cursor="pointer" w={8} h={8} />}
          onClick={() => handleVote('up')}
        />
        {post.points}
        <IconButton
          isLoading={loading === 'down-loading'}
          colorScheme={post.voteStatus === -1 ? 'red' : undefined}
          aria-label="down vote"
          icon={<ChevronDownIcon cursor="pointer" w={8} h={8} />}
          onClick={() => handleVote('down')}
        />
      </Flex>
      <Box>
        <Heading size="l">{post.title}</Heading>
          by
          {` ${post.postAuthor.username}`}
        <Text size="m">{post.textSnippet}...</Text>
      </Box>
    </Flex>
  );
};

export default PostVotes;
