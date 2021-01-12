import React from 'react';
import { Formik, Form } from 'formik';
import { Button } from '@chakra-ui/react';
import Wrapper from '../components/Wrapper';
import InputField from '../components/InputField';

interface Props {

}

const Register: React.FC<Props> = () => {
  return (
    <Wrapper>
      <Formik
        initialValues={{ username: '', password: '' }}
        onSubmit={console.log}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="email"
              placeholder="Email"
              label="email"
            />
            <InputField
              style={{ marginTop: '51px' }}
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
