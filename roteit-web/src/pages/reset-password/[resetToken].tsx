import React, { useState } from 'react';
import { NextPage, GetStaticProps } from 'next';
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

interface Props {
  resetToken: string;
}

const ResetPassword: NextPage<Props> = ({ resetToken }) => {
  const [, updatePassword] = useUpdatePasswordMutation();
  const router = useRouter();
  const [tokenError, setTokenError] = useState('');

  return (
    <Wrapper type="small">
      <Formik
        initialValues={{ password: '' }}
        onSubmit={async (values, helpers) => {
          console.log(resetToken, values.password);
          const response = await updatePassword({ token: resetToken, newPassword: values.password });
          console.log(response);

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

// Allows SSR for the dynamic route
export const getServerSideProps: GetStaticProps<any> = async ({ params }) => ({
  props: { resetToken: params?.resetToken as string, }
});

export default withUrqlClient(createUrqlClient)(ResetPassword);
