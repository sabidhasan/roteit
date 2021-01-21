import { Button } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React from 'react';
import InputField from '../components/InputField';
import Layout from '../components/Layout';
import { useCreatePostMutation } from '../generated/graphql';
import { homePath } from '../paths';
import { createUrqlClient } from '../utils/createUrqlClient';
import { useIsAuthenticated } from '../utils/hooks/useIsAuthenticated';

const CreatePost: React.FC = () => {
  const [, createPost] = useCreatePostMutation();
  const router = useRouter();
  useIsAuthenticated();

  return (
    <Layout>
      <Formik
        initialValues={{ title: '', text: ''}}
        onSubmit={async (input) => {
          const postResponse = await createPost({ input });
          if (!postResponse.error) {
            router.push(homePath);
          }
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
              Submit Post
            </Button>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient)(CreatePost);
