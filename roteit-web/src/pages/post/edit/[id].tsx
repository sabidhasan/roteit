import { Button } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React from 'react';
import InputField from '../../../components/InputField';
import Layout from '../../../components/Layout';
import { useUpdatePostMutation } from '../../../generated/graphql';
import { createUrqlClient } from '../../../utils/createUrqlClient';
import { useGetPostFromURL } from '../../../utils/hooks/useGetPostFromURL';

const EditPost: React.FC = () => {
  const router = useRouter();
  const { postId, postOptions } = useGetPostFromURL();
  const postQuery = postOptions[0];
  const [, updatePost] = useUpdatePostMutation();

  if (postQuery.fetching || !postQuery.data || !postQuery.data.post) {
    return <Layout>Loading posts...</Layout>
  }

  return (
    <Layout>
      <Formik
        initialValues={{ title: postQuery.data.post.title, text: postQuery.data.post.text }}
        onSubmit={async (input) => {
          await updatePost({ id: postId, ...input });
          router.back();
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="title"
              placeholder="title"
              label="Title"
              required
            />
            <InputField
              name="text"
              placeholder="Post text"
              label="Post"
              type="textarea"
            />
            <Button
              marginTop={5}
              type="submit"
              colorScheme="red"
              isLoading={isSubmitting}
            >
              Update the Post
            </Button>
          </Form>
        )}
      </Formik>
    </Layout>
  )
};

export default withUrqlClient(createUrqlClient)(EditPost);
