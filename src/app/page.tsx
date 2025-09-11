'use client';

import dynamic from 'next/dynamic';
import { ApolloProvider } from '@apollo/client/react';
import { createApolloClient } from '../lib/apollo-client';

const App = dynamic(() => import('../components/App'), { ssr: false });

const client = createApolloClient();

export default function HomePage() {
  return (
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  );
}