import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import rehypePrism from 'rehype-prism-plus'
import { type Memo } from '~/app/api/memos/route'
import { formatDate } from '~/utils/date'
import { useState, useEffect, useRef } from 'react'
import { visit } from 'unist-util-visit'

interface MemoCardProps extends Memo {}

function processContent(content: string) {
  return content.replace(
    /(?:^|\s)(#[\w-/]+)(?=\s|$)/g,
    ' <span class="not-prose inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-600 ring-1 ring-inset ring-indigo-600/20 dark:bg-indigo-400/10 dark:text-indigo-400 dark:ring-indigo-400/20">$1</span>'
  )
}

// Add copy button to code blocks
function setupCodeCopyButtons(container: HTMLElement) {
  const codeBlocks = container.querySelectorAll('pre')
  codeBlocks.forEach((pre) => {
    // Add relative positioning to pre
    pre.classList.add('relative')

    // Create copy button
    const button = document.createElement('button')
    button.className =
      'absolute right-2 top-2 rounded bg-white/90 px-2 py-1 text-xs font-medium text-zinc-600 opacity-0 transition-all hover:bg-white group-hover:opacity-100 dark:bg-zinc-700/70 dark:text-zinc-200 dark:hover:bg-zinc-700'
    button.textContent = 'Copy'

    // Add click handler
    button.addEventListener('click', async () => {
      const code = pre.querySelector('code')?.textContent || ''
      await navigator.clipboard.writeText(code)
      button.textContent = 'Copied!'
      button.classList.add('!bg-emerald-500/90', '!text-white')
      setTimeout(() => {
        button.textContent = 'Copy'
        button.classList.remove('!bg-emerald-500/90', '!text-white')
      }, 2000)
    })

    pre.appendChild(button)
  })
}

// Setup image preview functionality
function setupImagePreviews(container: HTMLElement) {
  const images = container.querySelectorAll('img[data-preview]')
  images.forEach((img) => {
    img.addEventListener('click', () => {
      // Create preview overlay
      const overlay = document.createElement('div')
      overlay.className =
        'fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm cursor-zoom-out'

      // Create preview image
      const preview = img.cloneNode(true) as HTMLImageElement
      preview.className = 'rounded-lg'
      preview.style.maxWidth = '90vw'
      preview.style.width = 'auto'
      preview.style.height = 'auto'
      preview.style.maxHeight = '90vh'
      preview.style.cursor = 'default'

      // Close preview when clicking outside
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.remove()
        }
      })

      // Close preview with Escape key
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          overlay.remove()
          document.removeEventListener('keydown', handleKeyDown)
        }
      }
      document.addEventListener('keydown', handleKeyDown)

      overlay.appendChild(preview)
      document.body.appendChild(overlay)
    })
  })
}

// Add click-to-preview functionality to images
function rehypeImagePreview() {
  return (tree: any) => {
    visit(tree, 'element', (node) => {
      if (node.tagName === 'img') {
        const { src, alt = '' } = node.properties
        node.tagName = 'div'
        node.properties = { className: 'my-4' }
        node.children = [
          {
            type: 'raw',
            value: `<img data-preview src="${src}" alt="${alt}" class="rounded-lg cursor-zoom-in" />`,
          },
        ]
      }
    })
  }
}

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype, {
    allowDangerousHtml: true,
  })
  .use(rehypeImagePreview)
  .use(rehypePrism, {
    ignoreMissing: true,
    defaultLanguage: 'plaintext',
  })
  .use(rehypeStringify, {
    allowDangerousHtml: true,
  })

export default function MemoCard({ content, createTime }: MemoCardProps) {
  const [html, setHtml] = useState<string>('')
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const processedContent = processContent(content)
    processor.process(processedContent).then((file) => setHtml(String(file)))
  }, [content])

  useEffect(() => {
    if (!contentRef.current) return

    setupCodeCopyButtons(contentRef.current)
    setupImagePreviews(contentRef.current)
  }, [html])

  return (
    <div className="group relative overflow-hidden rounded-xl bg-white/80 p-5 shadow-sm ring-1 ring-zinc-200/50 transition-all duration-300 hover:bg-white hover:shadow-md hover:ring-zinc-300 dark:bg-zinc-800/50 dark:ring-zinc-700/50 dark:hover:bg-zinc-800 dark:hover:ring-zinc-600">
      <div
        ref={contentRef}
        className="prose prose-sm prose-neutral max-w-none dark:prose-invert prose-p:my-2 prose-blockquote:my-2 prose-pre:my-2 prose-ol:my-2 prose-ul:my-2 prose-li:my-1"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <div className="mt-4 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <time dateTime={createTime}>{formatDate(createTime)}</time>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent dark:via-gray-700" />
      </div>
    </div>
  )
}
