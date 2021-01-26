import React, { useState } from 'react';
import NextLink from 'next/link';
import { Box, Button, Link } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import { useRouter } from 'next/router';
import { withUrqlClient } from 'next-urql';
import InputField from '../../components/InputField';
import Wrapper from '../../components/Wrapper';
import { homePath, resetPasswordPath } from '../../paths';
import { parseGQLErrors } from '../../utils/parseGQLErrors';
import { useUpdatePasswordMutation } from '../../generated/graphql';
import { createUrqlClient } from '../../utils/createUrqlClient';

const ResetPassword: React.FC = () => {
  const [, updatePassword] = useUpdatePasswordMutation();
  const router = useRouter();
  const [tokenError, setTokenError] = useState('');

  return (
    <Wrapper type="small">
      <Formik
        initialValues={{ password: '' }}
        onSubmit={async (values, helpers) => {
          const resetToken = typeof router.query.resetToken === 'string' ? router.query.resetToken : '';
          const response = await updatePassword({ token: resetToken, newPassword: values.password });

          if (response.data?.updatePassword.errors) {
            const errors = parseGQLErrors(response.data.updatePassword.errors);
            if ('token' in errors) {
              setTokenError(errors.token);
            }

            helpers.setErrors(errors);
          } else {
            router.push(homePath);
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="password"
              placeholder="New Password"
              label="New Password"
              type="password"
            />
            {tokenError ?
              (
                <>
                  <Box style={{ color: 'saddlebrown' }}>
                    Error:
                    {' '}
                    {tokenError}
                  </Box>
                  <Box>
                    <NextLink href={resetPasswordPath}>
                      <Link>Initiate forget password again</Link>
                    </NextLink>
                  </Box>
                </>
              ) :
              null
            }
            <Button
              marginTop={5}
              type="submit"
              colorScheme="red"
              isLoading={isSubmitting}
            >
              Reset Password
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
}

export default withUrqlClient(createUrqlClient)(ResetPassword);
