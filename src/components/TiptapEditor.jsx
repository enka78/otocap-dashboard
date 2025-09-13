import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';

const TiptapEditor = ({ content, onChange, placeholder = "Metin girin..." }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color.configure({
        types: ['textStyle'],
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: 'tiptap-editor-content',
      },
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="tiptap-editor">
      {/* Toolbar */}
      <div className="tiptap-toolbar">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'is-active' : ''}
        >
          <strong>B</strong>
        </button>
        
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'is-active' : ''}
        >
          <em>I</em>
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive('strike') ? 'is-active' : ''}
        >
          <s>S</s>
        </button>

        <div className="toolbar-separator"></div>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
        >
          H1
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
        >
          H2
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}
        >
          H3
        </button>

        <div className="toolbar-separator"></div>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'is-active' : ''}
        >
          • Liste
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'is-active' : ''}
        >
          1. Liste
        </button>

        <div className="toolbar-separator"></div>

        {/* Color Buttons */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setColor('#000000').run()}
          className={editor.isActive('textStyle', { color: '#000000' }) ? 'is-active' : ''}
          style={{ color: '#000000' }}
        >
          ● Siyah
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setColor('#ef4444').run()}
          className={editor.isActive('textStyle', { color: '#ef4444' }) ? 'is-active' : ''}
          style={{ color: '#ef4444' }}
        >
          ● Kırmızı
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setColor('#3b82f6').run()}
          className={editor.isActive('textStyle', { color: '#3b82f6' }) ? 'is-active' : ''}
          style={{ color: '#3b82f6' }}
        >
          ● Mavi
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setColor('#10b981').run()}
          className={editor.isActive('textStyle', { color: '#10b981' }) ? 'is-active' : ''}
          style={{ color: '#10b981' }}
        >
          ● Yeşil
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setColor('#f59e0b').run()}
          className={editor.isActive('textStyle', { color: '#f59e0b' }) ? 'is-active' : ''}
          style={{ color: '#f59e0b' }}
        >
          ● Sarı
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setColor('#8b5cf6').run()}
          className={editor.isActive('textStyle', { color: '#8b5cf6' }) ? 'is-active' : ''}
          style={{ color: '#8b5cf6' }}
        >
          ● Mor
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().unsetColor().run()}
          className="reset-color"
        >
          ✕ Renk Sıfırla
        </button>

        <div className="toolbar-separator"></div>

        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          ↶ Geri
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          ↷ İleri
        </button>
      </div>

      {/* Editor Content */}
      <div className="tiptap-content">
        <EditorContent editor={editor} placeholder={placeholder} />
      </div>
    </div>
  );
};

export default TiptapEditor;