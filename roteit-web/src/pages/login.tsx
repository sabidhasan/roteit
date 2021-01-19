import React from 'react';
import { Formik, Form } from 'formik';
import { Button, Flex, Link } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import NextLink from 'next/link';
import Wrapper from '../components/Wrapper';
import InputField from '../components/InputField';
import { useLoginMutation } from '../generated/graphql';
import { parseGQLErrors } from '../utils/parseGQLErrors';
import { homePath, resetPasswordPath } from '../paths';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';

interface Props { }

const Login: React.FC<Props> = () => {
  const [, login] = useLoginMutation();
  const router = useRouter();

  return (
    <Wrapper type="small">
      <Formik
        initialValues={{ emailOrUsername: '', password: '' }}
        onSubmit={async (values, helpers) => {
          const response = await login({ input: values });
          const registerResponse = response.data?.login;
          if (registerResponse?.errors) {
            helpers.setErrors(parseGQLErrors(registerResponse.errors));
          } else if (registerResponse?.user) {
            // Send user to home, as login was successful
            router.push(homePath);
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="emailOrUsername"
              placeholder="Email or Username"
              label="Email or Username"
              style={{ marginBottom: '20px' }}
            />
            <InputField
              name="password"
              placeholder="Password"
              label="Password"
              type="password"
            />
            <Flex marginTop={4}>
              <NextLink href={resetPasswordPath}>
                <Link marginLeft="auto">Forgot Password?</Link>
              </NextLink>
            </Flex>
            <Button
              marginTop={5}
              type="submit"
              colorScheme="red"
              isLoading={isSubmitting}
            >
              Login
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient)(Login);
