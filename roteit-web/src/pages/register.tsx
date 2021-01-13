import React from 'react';
import { Formik, Form } from 'formik';
import { Button } from '@chakra-ui/react';
import Wrapper from '../components/Wrapper';
import InputField from '../components/InputField';
import { useMutation } from 'urql';

interface Props {}

const REGISTER_MUTATION = `
  mutation Register($username: String!, $password: String!) {
    register(input:{ username:$username, password: $password }) {
      user{
        id,
        username,
      },
      errors {
        message,
        field,
      }
    }
  }
`;

const Register: React.FC<Props> = () => {
  const [{ fetching, data, error }, register] = useMutation(REGISTER_MUTATION);
  console.log(fetching, data, error);

  return (
    <Wrapper>
      <Formik
        initialValues={{ username: '', password: '' }}
        onSubmit={(values) => register(values)}
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
              colorScheme="teal"
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

export default Register;
