import Head from 'next/head';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link rel="icon" href="/logos/logo.png" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;