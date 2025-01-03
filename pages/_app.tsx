import Head from "next/head";
import "./globals.css";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <title>{"roam roam roamer"}</title>
        <meta name="description" content={"yet another way to watch"} />
        <link rel="shortcut icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
