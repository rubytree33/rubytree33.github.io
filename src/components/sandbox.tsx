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

/** This doesn't work, see https://github.com/codesandbox/sandpack/issues/640 */
const TailwindSandbox = (props: SandboxProps) =>
  <Sandbox
    {...props}
    files={{
      '/tailwind.config.js': `
        /** @type {import('tailwindcss').Config} */
        module.exports = {
          content: ["./**/*.{html,{j,t}s{,x}}"],
          theme: {
            extend: {},
          },
          plugins: [],
        }
      `,
      '/postcss.config.js': `
        module.exports = {
          plugins: {
            tailwindcss: {},
            autoprefixer: {},
          },
        }
      `,
      '/styles.css': `
        @tailwind base;
        @tailwind components;
        @tailwind utilities;
      `,
      ...props.files,
    }}
    customSetup={{
      dependencies: {
        tailwindcss: 'latest',
        autoprefixer: 'latest',
      },
    }}
  />

export type { SandboxProps }
export { Sandbox }