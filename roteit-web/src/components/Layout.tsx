import React from 'react';
import { TWrapper } from '../types';
import { Navbar } from './Navbar';
import Wrapper from './Wrapper';

interface Props extends TWrapper {}

const Layout: React.FC<Props> = ({ type, children }) => {
  return (
    <>
      <Navbar />
      <Wrapper type={type}>
        {children}
      </Wrapper>
    </>
  )
};

export default Layout;
