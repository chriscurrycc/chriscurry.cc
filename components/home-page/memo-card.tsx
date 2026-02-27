import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypePrism from 'rehype-prism-plus'
import { PhotoProvider, PhotoView } from 'react-photo-view'
import { type Memo } from '~/app/api/memos/types'
import { formatDate } from '~/utils/date'
import { useState, useEffect, useRef, type ReactNode } from 'react'
import { findAndReplace } from 'mdast-util-find-and-replace'
import { Modal } from '~/components/ui/modal'

interface MemoCardProps extends Memo {}

const MAX_CARD_HEIGHT = 400

// Fix: CommonMark doesn't recognize closing ** when preceded by CJK punctuation
// and followed by non-whitespace non-punctuation (e.g. **应用：**老俞)
function remarkFixEmphasis() {
  return (tree: any) => {
    findAndReplace(tree, [
      /\*\*(.+?)\*\*/g,
      (_: string, text: string) =>
        ({ type: 'strong', children: [{ type: 'text', value: text }] }) as any,
    ])
  }
}

function remarkHashtags() {
  return (tree: any) => {
    findAndReplace(tree, [
      /#[\w\p{L}/\-]+/gu,
      (match: string) =>
        ({
          type: 'emphasis',
          data: {
            hName: 'span',
            hProperties: { className: 'memo-hashtag' },
          },
          children: [{ type: 'text', value: match }],
        }) as any,
    ])
  }
}

function extractText(children: ReactNode): string {
  if (typeof children === 'string') return children
  if (typeof children === 'number') return String(children)
  if (Array.isArray(children)) return children.map(extractText).join('')
  if (children && typeof children === 'object' && 'props' in children) {
    return extractText(children.props.children)
  }
  return ''
}

function CodeBlock({ children, ...props }: any) {
  const [copied, setCopied] = useState(false)
  const [showCopy, setShowCopy] = useState(false)
  const code = extractText(children)

  return (
    <div className="group/code relative">
      <pre
        {...props}
        onClick={() => {
          if (window.innerWidth < 768) setShowCopy((v) => !v)
        }}
      >
        {children}
      </pre>
      <button
        className={`absolute right-2 top-2 z-10 rounded px-2 py-1 text-xs font-medium transition-all ${
          copied
            ? '!bg-emerald-500/90 !text-white opacity-100'
            : `bg-white/90 text-zinc-600 hover:bg-white dark:bg-zinc-700/70 dark:text-zinc-200 dark:hover:bg-zinc-700 ${showCopy ? 'opacity-100' : 'opacity-0 group-hover/code:opacity-100'}`
        }`}
        onClick={(e) => {
          e.stopPropagation()
          navigator.clipboard.writeText(code)
          setCopied(true)
          setTimeout(() => {
            setCopied(false)
            if (window.innerWidth < 768) setShowCopy(false)
          }, 2000)
        }}
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  )
}

const remarkPluginsList: any[] = [[remarkGfm, { breaks: true }], remarkFixEmphasis, remarkHashtags]
const rehypePluginsList: any[] = [
  [rehypePrism, { ignoreMissing: true, defaultLanguage: 'plaintext' }],
]
const markdownComponents: any = {
  img: ({ src, alt }: any) => (
    <div className="my-1 flex justify-center">
      <PhotoView src={src}>
        <img
          src={src}
          alt={alt || ''}
          className="cursor-zoom-in rounded-lg"
          style={{ maxWidth: '100%', maxHeight: '360px' }}
        />
      </PhotoView>
    </div>
  ),
  a: ({ href, children, ...props }: any) => (
    <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
      {children}
    </a>
  ),
  pre: CodeBlock,
  br: () => <span className="block h-1.5" />,
  span: ({ className, children, ...props }: any) => {
    if (className === 'memo-hashtag') {
      return (
        <span className="not-prose inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-600 ring-1 ring-inset ring-indigo-600/20 dark:bg-indigo-400/10 dark:text-indigo-400 dark:ring-indigo-400/20">
          {children}
        </span>
      )
    }
    return (
      <span className={className} {...props}>
        {children}
      </span>
    )
  },
}

function MemoContent({ content }: { content: string }) {
  return (
    <PhotoProvider>
      <div className="prose prose-sm prose-neutral max-w-none dark:prose-invert prose-headings:my-2 prose-p:my-1.5 prose-a:break-all prose-blockquote:my-1.5 prose-pre:my-1.5 prose-ol:my-1.5 prose-ul:my-1.5 prose-li:my-1.5 prose-img:my-1 prose-hr:my-4">
        <ReactMarkdown
          remarkPlugins={remarkPluginsList}
          rehypePlugins={rehypePluginsList}
          components={markdownComponents}
        >
          {content}
        </ReactMarkdown>
      </div>
    </PhotoProvider>
  )
}

export default function MemoCard({ content, createTime, updateTime }: MemoCardProps) {
  const isEdited = updateTime && updateTime !== createTime
  const contentRef = useRef<HTMLDivElement>(null)
  const [isTruncated, setIsTruncated] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const el = contentRef.current
    if (!el) return

    function checkHeight() {
      setIsTruncated(el!.scrollHeight > MAX_CARD_HEIGHT)
    }

    checkHeight()

    const images = el.querySelectorAll('img')
    images.forEach((img) => {
      if (!img.complete) img.addEventListener('load', checkHeight, { once: true })
    })
  }, [content])

  return (
    <>
      <div className="group relative overflow-hidden rounded-xl bg-white/80 px-4 pb-4 pt-3 shadow-sm ring-1 ring-zinc-200/50 transition-all duration-300 hover:bg-white hover:shadow-md hover:ring-zinc-300 dark:bg-zinc-800/50 dark:ring-zinc-700/50 dark:hover:bg-zinc-800 dark:hover:ring-zinc-600">
        <div
          ref={contentRef}
          className={isTruncated ? 'relative max-h-[400px] overflow-hidden' : ''}
        >
          <MemoContent content={content} />
          {isTruncated && (
            <div className="absolute inset-x-0 bottom-0 flex h-24 items-end justify-center bg-gradient-to-t from-white via-white/80 to-transparent dark:from-zinc-800 dark:via-zinc-800/80">
              <button
                className="mb-3 text-xs font-medium text-indigo-600 underline-offset-2 transition-colors hover:text-indigo-700 hover:underline dark:text-indigo-400 dark:hover:text-indigo-300"
                onClick={() => setIsOpen(true)}
              >
                Show more
              </button>
            </div>
          )}
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <time dateTime={createTime}>{formatDate(createTime)}</time>
          {isEdited && (
            <span className="text-gray-400 dark:text-gray-500">
              edited {formatDate(updateTime)}
            </span>
          )}
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent dark:via-gray-700" />
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} className="max-w-2xl">
        <MemoContent content={content} />
        <div className="mt-4 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <time dateTime={createTime}>{formatDate(createTime)}</time>
          {isEdited && (
            <span className="text-gray-400 dark:text-gray-500">
              edited {formatDate(updateTime)}
            </span>
          )}
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent dark:via-gray-700" />
        </div>
      </Modal>
    </>
  )
}
