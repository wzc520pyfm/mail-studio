'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Editor, { OnMount, BeforeMount } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { useEditorStore } from '@/stores/editor';
import { generateMjml, parseMjmlToNode } from '@/lib/mjml/compiler';
import { Button } from '@/components/ui/button';
import { RefreshCw, Check, AlertCircle, Loader2 } from 'lucide-react';

export function CodeEditor() {
  const document = useEditorStore((s) => s.document);
  const setDocument = useEditorStore((s) => s.setDocument);
  const [code, setCode] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  // Generate MJML from document
  useEffect(() => {
    if (!isDirty) {
      const mjml = generateMjml(document);
      setCode(mjml);
    }
  }, [document, isDirty]);

  const handleChange = useCallback((value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
      setIsDirty(true);
      setError(null);
    }
  }, []);

  const handleSync = useCallback(() => {
    try {
      const node = parseMjmlToNode(code);
      if (node) {
        setDocument(node);
        setIsDirty(false);
        setError(null);
      } else {
        setError('Failed to parse MJML. Please check the syntax.');
      }
    } catch (err) {
      setError((err as Error).message);
    }
  }, [code, setDocument]);

  const handleReset = useCallback(() => {
    const mjml = generateMjml(document);
    setCode(mjml);
    setIsDirty(false);
    setError(null);
  }, [document]);

  const handleEditorMount: OnMount = useCallback((editor) => {
    editorRef.current = editor;
    // Focus editor when mounted
    editor.focus();
  }, []);

  const handleBeforeMount: BeforeMount = useCallback((monaco) => {
    // Register MJML as XML-like language
    monaco.languages.register({ id: 'mjml' });
    monaco.languages.setLanguageConfiguration('mjml', {
      brackets: [['<', '>'], ['{', '}'], ['(', ')']],
      autoClosingPairs: [
        { open: '<', close: '>' },
        { open: '"', close: '"' },
        { open: "'", close: "'" },
      ],
      surroundingPairs: [
        { open: '<', close: '>' },
        { open: '"', close: '"' },
        { open: "'", close: "'" },
      ],
    });

    // Set token rules for MJML (XML-like)
    monaco.languages.setMonarchTokensProvider('mjml', {
      defaultToken: '',
      tokenPostfix: '.mjml',
      ignoreCase: true,

      brackets: [
        { open: '<!--', close: '-->', token: 'comment.content.mjml' },
        { open: '<![CDATA[', close: ']]>', token: 'cdata.content.mjml' },
        { open: '<', close: '>', token: 'tag.mjml' },
      ],

      tokenizer: {
        root: [
          [/<!--/, 'comment.mjml', '@comment'],
          [/<!\[CDATA\[/, 'cdata.mjml', '@cdata'],
          [/<\?/, 'metatag.mjml', '@processingInstruction'],
          [/<\/?mj-[\w-]+/, { token: 'tag.mjml', next: '@tag' }],
          [/<\/?[\w-]+/, { token: 'tag.mjml', next: '@tag' }],
          [/[^<]+/, ''],
        ],
        comment: [
          [/-->/, 'comment.mjml', '@pop'],
          [/[^-]+/, 'comment.content.mjml'],
          [/./, 'comment.content.mjml'],
        ],
        cdata: [
          [/\]\]>/, 'cdata.mjml', '@pop'],
          [/[^\]]+/, 'cdata.content.mjml'],
          [/./, 'cdata.content.mjml'],
        ],
        processingInstruction: [
          [/\?>/, 'metatag.mjml', '@pop'],
          [/[^?]+/, 'metatag.content.mjml'],
          [/./, 'metatag.content.mjml'],
        ],
        tag: [
          [/[\w-]+/, 'attribute.name.mjml'],
          [/=/, 'delimiter.mjml'],
          [/"[^"]*"/, 'attribute.value.mjml'],
          [/'[^']*'/, 'attribute.value.mjml'],
          [/\/>/, 'tag.mjml', '@pop'],
          [/>/, 'tag.mjml', '@pop'],
          [/\s+/, ''],
        ],
      },
    });

    // Define theme for MJML
    monaco.editor.defineTheme('mjml-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'tag.mjml', foreground: '569CD6' },
        { token: 'attribute.name.mjml', foreground: '9CDCFE' },
        { token: 'attribute.value.mjml', foreground: 'CE9178' },
        { token: 'comment.mjml', foreground: '6A9955' },
        { token: 'comment.content.mjml', foreground: '6A9955' },
      ],
      colors: {
        'editor.background': '#1e1e1e',
      },
    });
  }, []);

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e]">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-[#3c3c3c]">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">MJML Source</span>
          {isDirty && (
            <span className="text-xs px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400">
              Modified
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isDirty && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-gray-400 hover:text-white hover:bg-[#3c3c3c]"
                onClick={handleReset}
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                Reset
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-green-400 hover:text-green-300 hover:bg-green-500/20"
                onClick={handleSync}
              >
                <Check className="w-3.5 h-3.5 mr-1.5" />
                Apply Changes
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border-b border-red-500/30">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span className="text-sm text-red-400">{error}</span>
        </div>
      )}

      {/* Monaco Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          language="mjml"
          theme="mjml-dark"
          value={code}
          onChange={handleChange}
          onMount={handleEditorMount}
          beforeMount={handleBeforeMount}
          loading={
            <div className="h-full flex items-center justify-center bg-[#1e1e1e]">
              <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
            </div>
          }
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            tabSize: 2,
            insertSpaces: true,
            automaticLayout: true,
            formatOnPaste: true,
            formatOnType: true,
            folding: true,
            foldingStrategy: 'indentation',
            renderWhitespace: 'selection',
            bracketPairColorization: { enabled: true },
            guides: {
              bracketPairs: true,
              indentation: true,
            },
          }}
        />
      </div>
    </div>
  );
}
