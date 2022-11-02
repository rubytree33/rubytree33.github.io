import Head from 'next/head'
import { ReactElement } from 'react'

const domain = 'rubytree33.github.io'

interface MetaProps {
  title: string
  description: string
  path: string
  imageURL?: string
}

const Meta: (props: MetaProps) => ReactElement = ({ title, description, path, imageURL }) => {
  const fullTitle = `${title} | rubytree`
  const url = `https://${domain}${path}`
  imageURL ||= `https://${domain}/wordmark.png`
  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name='description' content={description} />

      <meta property='og:url' content={url} />
      <meta property='og:type' content='website' />
      <meta property='og:title' content={fullTitle} />
      <meta property='og:description' content={description} />
      <meta property='og:image' content={imageURL} />

      <meta name='twitter:card' content='summary_large_image' />
      <meta property='twitter:domain' content={domain} />
      <meta property='twitter:url' content={url} />
      <meta name='twitter:title' content={fullTitle} />
      <meta name='twitter:description' content={description} />
      <meta name='twitter:image' content={imageURL} />
    </Head>
  )
}

export default Meta