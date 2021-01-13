import React from 'react';
import { Formik, Form } from 'formik';
import { Button } from '@chakra-ui/react';
import Wrapper from '../components/Wrapper';
import InputField from '../components/InputField';
import { useRegisterMutation } from '../generated/graphql';
import { parseGQLErrors } from '../utils/parseGQLErrors';

interface Props {}

const Register: React.FC<Props> = () => {
  const [{ fetching, data, error }, register] = useRegisterMutation();
  console.log(fetching, data, error);

  return (
    <Wrapper>
      <Formik
        initialValues={{ username: '', password: '' }}
        onSubmit={async (values, helpers) => {
          const response = await register(values);
          if (response.data?.register.errors) {
            console.log(response.data?.register.errors);
            helpers.setErrors(parseGQLErrors(response.data.register.errors));
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
