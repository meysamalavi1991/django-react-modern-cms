import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import {
    Table,
    TableRow,
    TableHeader,
    TableCell,
} from '@tiptap/extension-table'
import { useEffect } from 'react'

import './RichTextEditor.css'

const buttonClass = (active) =>
    `btn btn-sm ${active ? 'btn-primary' : 'btn-outline-secondary'}`

export default function RichTextEditor({
                                           value = '',
                                           onChange,
                                           placeholder = 'متن مطلب را اینجا بنویسید...',
                                       }) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Link.configure({
                openOnClick: false,
                autolink: true,
                HTMLAttributes: {
                    rel: 'noopener noreferrer',
                    target: '_blank',
                },
            }),
            Table.configure({ resizable: true }),
            TableRow,
            TableHeader,
            TableCell,
        ],
        content: value,
        onUpdate: ({ editor: currentEditor }) => {
            onChange?.(currentEditor.getHTML())
        },
        editorProps: {
            attributes: {
                dir: 'rtl',
                lang: 'fa',
                class: 'rich-text-editor__content',
                'aria-label': 'متن مطلب',
                'data-placeholder': placeholder,
            },
        },
    })

    useEffect(() => {
        if (!editor) return

        const currentContent = editor.getHTML()
        const nextContent = value || ''

        if (currentContent !== nextContent) {
            editor.commands.setContent(nextContent, {
                emitUpdate: false,
            })
        }
    }, [editor, value])

    if (!editor) {
        return <div className="form-control">در حال آماده‌سازی ویرایشگر...</div>
    }

    const setLink = () => {
        const previousUrl = editor.getAttributes('link').href || ''
        const url = window.prompt('آدرس لینک را وارد کنید:', previousUrl)

        if (url === null) return

        if (!url.trim()) {
            editor.chain().focus().extendMarkRange('link').unsetLink().run()
            return
        }

        try {
            const parsedUrl = new URL(url.trim(), window.location.origin)

            if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
                window.alert('فقط لینک‌های HTTP و HTTPS مجاز هستند.')
                return
            }

            editor
                .chain()
                .focus()
                .extendMarkRange('link')
                .setLink({ href: parsedUrl.href })
                .run()
        } catch {
            window.alert('آدرس لینک معتبر نیست.')
        }
    }

    const insertTable = () => {
        editor
            .chain()
            .focus()
            .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
            .run()
    }

    return (
        <div className="rich-text-editor" dir="rtl">
            <div className="rich-text-editor__toolbar" role="toolbar" aria-label="ابزارهای ویرایش متن">
                <button
                    type="button"
                    className={buttonClass(editor.isActive('bold'))}
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    title="ضخیم"
                    aria-label="ضخیم"
                >
                    <strong>B</strong>
                </button>

                <button
                    type="button"
                    className={buttonClass(editor.isActive('italic'))}
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    title="مورب"
                    aria-label="مورب"
                >
                    <em>I</em>
                </button>

                <button
                    type="button"
                    className={buttonClass(editor.isActive('underline'))}
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    title="زیرخط"
                    aria-label="زیرخط"
                >
                    <u>U</u>
                </button>

                <button
                    type="button"
                    className={buttonClass(editor.isActive('heading', { level: 2 }))}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                >
                    تیتر ۲
                </button>

                <button
                    type="button"
                    className={buttonClass(editor.isActive('heading', { level: 3 }))}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                >
                    تیتر ۳
                </button>

                <button
                    type="button"
                    className={buttonClass(editor.isActive('bulletList'))}
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                >
                    فهرست نشانه‌ای
                </button>

                <button
                    type="button"
                    className={buttonClass(editor.isActive('orderedList'))}
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                >
                    فهرست شماره‌ای
                </button>

                <button
                    type="button"
                    className={buttonClass(editor.isActive('link'))}
                    onClick={setLink}
                >
                    لینک
                </button>

                <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={insertTable}
                >
                    درج جدول
                </button>

                <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                >
                    واگرد
                </button>

                <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                >
                    انجام مجدد
                </button>
            </div>

            <EditorContent editor={editor} />

            <div className="rich-text-editor__footer">
                محتوای مطلب به‌صورت HTML ذخیره می‌شود.
            </div>
        </div>
    )
}
