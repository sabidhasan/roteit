import React from 'react';
import { Box } from '@chakra-ui/react';
import { TWrapper } from '../types';

interface Props extends TWrapper {}

const Wrapper: React.FC<Props> = ({ type, children }) => {
  return (
    <Box
      mx="auto"
      maxWidth={type === 'small' ? '400px' : '800px'}
      marginTop={10}
      width="100%"
    >
      {children}
    </Box>
  )
};

export default Wrapper;
