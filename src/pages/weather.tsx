import axios, { AxiosResponse } from 'axios'
import { NextPage } from 'next'

interface Props {
  response: AxiosResponse
}

const Page: NextPage<Props> = ({ response }) => {
  return (
    <pre>
      <code>
        {JSON.stringify(response, null, 2)}
      </code>
    </pre>
  )
}

Page.getInitialProps = async ({ req }) => {
  return {
    response: (await axios.get('https://wttr.in/?format=j1')).data
  }
}

export default Page