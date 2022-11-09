import { Sandpack, SandpackFiles, SandpackPredefinedTemplate } from '@codesandbox/sandpack-react'

type SandboxProps = Parameters<typeof Sandpack>[0] & {
  template?: SandpackPredefinedTemplate
  files?: SandpackFiles
}

const Sandbox = (props: SandboxProps) => {
  return (
    <Sandpack
      template='react'
      {...props}
      files={Object.fromEntries(Object.entries(props.files ?? {}).map(([filename, file]) => {
        // automatically detect and delete indentation so the mdx looks better
        const raw = typeof file === 'string' ? file : file.code
        const indent = raw.match(/^\n(\s+)/)?.[1]
        if (indent === undefined) {
          throw new Error(`Sandbox file ${filename} must start with a newline to parse indentation.`)
        }
        return [filename, {
          ...typeof file === 'object' && file,
          code: raw.replaceAll(new RegExp(`\n${indent}`, 'g'), '\n').trim(),
        }]
      }))}
    />
  )
} 

const TailwindSandbox = (props: SandboxProps) =>
  <Sandbox
    {...props}
    options={{
      ...props.options,
      externalResources: [
        ...props.options?.externalResources ?? [],
        'https://cdn.tailwindcss.com'
      ],
    }}
  />

export type { SandboxProps }
export { Sandbox, TailwindSandbox }