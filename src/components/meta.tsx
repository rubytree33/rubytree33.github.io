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
      <title key='title'>{fullTitle}</title>
      <meta key='description' name='description' content={description} />

      <meta key='og:url' property='og:url' content={url} />
      <meta key='og:type' property='og:type' content='website' />
      <meta key='og:title' property='og:title' content={fullTitle} />
      <meta key='og:description' property='og:description' content={description} />
      <meta key='og:image' property='og:image' content={imageURL} />

      <meta key='twitter:card' name='twitter:card' content='summary_large_image' />
      <meta key='twitter:domain' property='twitter:domain' content={domain} />
      <meta key='twitter:url' property='twitter:url' content={url} />
      <meta key='twitter:title' name='twitter:title' content={fullTitle} />
      <meta key='twitter:description' name='twitter:description' content={description} />
      <meta key='twitter:image' name='twitter:image' content={imageURL} />
    </Head>
  )
}

export default Meta