import React from 'react';
import NextLink from 'next/link';
import { EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { Flex, IconButton, Link } from '@chakra-ui/react';
import { useDeletePostMutation } from '../generated/graphql';

const EditDeletePostButtons: React.FC<{ id: number }> = ({ id }) => {
  const [, deletePost] = useDeletePostMutation();

  return (
    <Flex marginLeft="auto" flexDirection="column">
      <NextLink href="/post/edit/[id]" as={`/post/edit/${id}`}>
        <IconButton
          as={Link}
          marginBottom={3}
          icon={<EditIcon />}
          aria-label="edit this post"
          style={{ backgroundColor: 'lightgray' }}
          onClick={() => { }}
        />
      </NextLink>
      <IconButton
        icon={<DeleteIcon />}
        aria-label="delete this post"
        style={{ backgroundColor: 'lightgray' }}
        onClick={() => deletePost({ id })}
      />
    </Flex>
  );
};

export default EditDeletePostButtons;
