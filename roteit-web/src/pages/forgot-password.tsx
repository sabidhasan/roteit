import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import { Box, Button } from '@chakra-ui/react';
// import { useRouter } from 'next/router';
// import NextLink from 'next/link';
import { withUrqlClient } from 'next-urql';
import Wrapper from '../components/Wrapper';
import InputField from '../components/InputField';
// import { useLoginMutation } from '../generated/graphql';
// import { parseGQLErrors } from '../utils/parseGQLErrors';
// import { homePath, resetPasswordPath } from '../paths';
import { createUrqlClient } from '../utils/createUrqlClient';
import { useForgotPasswordMutation } from '../generated/graphql';

const ForgotPassword: React.FC = () => {
  const [hasReset, setHasReset] = useState(false);
  const [, forgotPassword] = useForgotPasswordMutation();

  return (
    <Wrapper type="small">
      <Formik
        initialValues={{ email: '' }}
        onSubmit={async (values) => {
          await forgotPassword(values);
          setHasReset(true);
        }}
      >
        {({ isSubmitting }) => hasReset ? (<Box>If that email exists in our system, reset instructions will be sent</Box>) : (
          <Form>
            <InputField
              name="email"
              placeholder="Email"
              label="Email"
              style={{ marginBottom: '20px' }}
            />
            <Button
              marginTop={5}
              type="submit"
              colorScheme="red"
              isLoading={isSubmitting}
            >
              Forgot Password
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient)(ForgotPassword);
