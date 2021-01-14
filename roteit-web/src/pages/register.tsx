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
  const [{ fetching, data, error }, register] = useRegisterMutation();
  const router = useRouter();

  return (
    <Wrapper>
      <Formik
        initialValues={{ username: '', password: '' }}
        onSubmit={async (values, helpers) => {
          const response = await register(values);
          const registerResponse = response.data?.register;
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
              name="username"
              placeholder="Username"
              label="username"
              style={{ marginBottom: '20  px' }}
            />
            <InputField
              name="password"
              placeholder="Password"
              label="password"
              type="password"
            />
            <Button
              marginTop={5}
              type="submit"
              colorScheme="sandybrown"
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
