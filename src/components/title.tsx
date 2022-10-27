import Head from 'next/head'

const Title = ({ children }: { children?: string }) =>
  <Head>
    <title>
      {children && children.length > 0 ? `${children} | rubytree` : 'rubytree'}
    </title>
  </Head>

export default Title