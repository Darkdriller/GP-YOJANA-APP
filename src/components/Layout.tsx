import React, { ReactNode } from 'react';
import Head from 'next/head';
import { Container } from '@mui/material';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
      <Head>
        <title>Panchayat Yojana Dashboard</title>
        <meta name="description" content="Panchayat Yojana Dashboard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Container maxWidth={false} disableGutters>
        <main>{children}</main>
      </Container>
    </>
  );
};

export default Layout;