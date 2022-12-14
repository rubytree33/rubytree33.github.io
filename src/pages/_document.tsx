import Document, { Html, Head, Main, NextScript } from 'next/document'

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en" className="
        text-ruby-900     bg-ruby-50
        dark:text-ruby-50 dark:bg-ruby-950
        h-full
        ">
          <Head>
            <link rel="shortuct icon" href="/favicon.ico" />
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            {/* <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin /> */}
            {/* <link href="https://fonts.googleapis.com/css2?family=Titillium+Web:ital,wght@0,200;0,300;0,400;0,600;0,700;0,900;1,200;1,300;1,400;1,600;1,700&display=swap" rel="stylesheet" /> */}
            <link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;500;600;700;800&family=Titillium+Web:ital,wght@0,200;0,300;0,400;0,600;0,700;0,900;1,200;1,300;1,400;1,600;1,700&display=swap" rel="stylesheet" />
          </Head>
          <body className="h-full">
            <Main />
            <NextScript />
          </body>
      </Html>
    )
  }
}

export default MyDocument