import React from 'react';
import { Formik, Form } from 'formik';
import { Button } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import Wrapper from '../components/Wrapper';
import InputField from '../components/InputField';
import { useRegisterMutation } from '../generated/graphql';
import { parseGQLErrors } from '../utils/parseGQLErrors';
import { homePath } from '../paths';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';

interface Props {}

const Register: React.FC<Props> = () => {
  const [, register] = useRegisterMutation();
  const router = useRouter();

  return (
    <Wrapper type="small">
      <Formik
        initialValues={{ username: '', email: '', password: '' }}
        onSubmit={async (values, helpers) => {
          const response = await register({ input: values });
          const registerResponse = response.data?.register;
          if (registerResponse?.errors) {
            helpers.setErrors(parseGQLErrors(registerResponse?.errors));
          } else if (registerResponse?.user) {
            // Send user to home, as login was successful
            router.push(homePath);
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="username"
              placeholder="Username"
              label="username"
              style={{ marginBottom: '20px' }}
            />
            <InputField
              name="password"
              placeholder="Password"
              label="password"
              type="password"
            />
            <InputField
              name="email"
              placeholder="Email"
              label="email"
              type="email"
            />
            <Button
              marginTop={5}
              type="submit"
              colorScheme="red"
              isLoading={isSubmitting}
            >
              Register
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient)(Register);
