import React from 'react';
import { Formik, Form } from 'formik';
import { Button } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import Wrapper from '../components/Wrapper';
import InputField from '../components/InputField';
import { useLoginMutation } from '../generated/graphql';
import { parseGQLErrors } from '../utils/parseGQLErrors';
import { homePath } from '../paths';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';

interface Props { }

const Login: React.FC<Props> = () => {
  const [{ fetching, data, error }, login] = useLoginMutation();
  const router = useRouter();

  return (
    <Wrapper>
      <Formik
        initialValues={{ emailOrUsername: '', password: '' }}
        onSubmit={async (values, helpers) => {
          const response = await login({ input: values });
          const registerResponse = response.data?.login;
          if (registerResponse.errors) {
            helpers.setErrors(parseGQLErrors(registerResponse.errors));
          } else if (registerResponse.user) {
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
              style={{ marginBottom: '20  px' }}
            />
            <InputField
              name="password"
              placeholder="Password"
              label="Password"
              type="password"
            />
            <Button
              marginTop={5}
              type="submit"
              colorScheme="sandybrown"
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
