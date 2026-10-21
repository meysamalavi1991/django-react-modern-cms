import { useEffect, useRef } from 'react'
import { Editor } from '@tinymce/tinymce-react'

import 'tinymce/tinymce'
import 'tinymce-i18n/langs/fa_IR.js'
import 'tinymce/icons/default'
import 'tinymce/themes/silver'
import 'tinymce/models/dom'

import 'tinymce/skins/ui/oxide/skin.min.css'
import 'tinymce/skins/ui/oxide/content.min.css'
import 'tinymce/skins/content/default/content.min.css'

import 'tinymce/plugins/advlist'
import 'tinymce/plugins/autolink'
import 'tinymce/plugins/lists'
import 'tinymce/plugins/link'
import 'tinymce/plugins/image'
import 'tinymce/plugins/charmap'
import 'tinymce/plugins/preview'
import 'tinymce/plugins/anchor'
import 'tinymce/plugins/searchreplace'
import 'tinymce/plugins/visualblocks'
import 'tinymce/plugins/code'
import 'tinymce/plugins/fullscreen'
import 'tinymce/plugins/insertdatetime'
import 'tinymce/plugins/media'
import 'tinymce/plugins/table'
import 'tinymce/plugins/wordcount'
import 'tinymce/plugins/directionality'
import 'tinymce/plugins/nonbreaking'
import 'tinymce/plugins/pagebreak'
import 'tinymce/plugins/quickbars'


export default function RichTextEditor({
                                           value = '',
                                           onChange,
                                           placeholder = 'متن مطلب را اینجا بنویسید...',
                                       }) {
    const editorRef = useRef(null)

    useEffect(() => {
        // اطمینان از ثبت نسخه self-hosted در زمان اجرای کامپوننت
        if (editorRef.current && editorRef.current.getContent() !== value) {
            editorRef.current.setContent(value || '')
        }
    }, [value])

    return (
        <div dir="rtl" className="tinymce-editor">
            <Editor
                tinymceScriptSrc={undefined}
                onInit={(_, editor) => {
                    editorRef.current = editor
                }}
                value={value}
                onEditorChange={(content) => onChange?.(content)}
                init={{
                    license_key: 'gpl',
                    language: 'fa_IR',
                    directionality: 'rtl',
                    height: 520,
                    menubar: 'file edit view insert format tools table help',
                    plugins: [
                        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
                        'preview', 'anchor', 'searchreplace', 'visualblocks', 'code',
                        'fullscreen', 'insertdatetime', 'media', 'table', 'wordcount',
                        'directionality', 'nonbreaking',
                        'pagebreak', 'quickbars',
                    ],
                    toolbar: [
                        'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough',
                        'forecolor backcolor | alignright aligncenter alignleft alignjustify |',
                        'bullist numlist outdent indent | link image media table |',
                        'ltr rtl | charmap | removeformat code fullscreen preview',
                    ].join(' '),
                    toolbar_mode: 'sliding',
                    placeholder,
                    content_style: `
            body {
              font-family: Tahoma, Arial, sans-serif;
              font-size: 14px;
              line-height: 2;
              direction: rtl;
              text-align: right;
            }
            img { max-width: 100%; height: auto; }
            table { border-collapse: collapse; width: 100%; }
            table td, table th { border: 1px solid #ccc; padding: 6px; }
          `,
                    skin: false,
                    content_css: false,
                    promotion: false,
                    branding: false,
                    statusbar: true,
                    resize: true,
                    contextmenu: 'link image table',
                    quickbars_selection_toolbar:
                        'bold italic underline | quicklink blockquote',
                    quickbars_insert_toolbar: 'quickimage quicktable',
                    image_caption: true,
                    image_advtab: true,
                    table_default_attributes: {
                        border: '1',
                    },
                    table_default_styles: {
                        width: '100%',
                        borderCollapse: 'collapse',
                    },
                    link_default_target: '_blank',
                    link_assume_external_targets: true,
                    relative_urls: false,
                    convert_urls: false,
                    setup(editor) {
                        editor.on('init', () => {
                            editor.getBody().setAttribute('dir', 'rtl')
                            editor.getBody().setAttribute('lang', 'fa')
                        })
                    },
                }}
            />
        </div>
    )
}
