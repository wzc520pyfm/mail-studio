# Mail Studio × emailmd 整合方案（方案一：新增 Markdown 编辑模式）

## 项目分析

|              | **Mail Studio**                    | **emailmd**                 |
| ------------ | ---------------------------------- | --------------------------- |
| **核心定位** | 可视化邮件编辑器（拖拽 MJML 组件） | Markdown → 邮件 HTML 转换器 |
| **底层引擎** | `mjml-browser`                     | `mjml` + `markdown-it`      |
| **编辑方式** | Canvas / Edit / Code / Preview     | Markdown 编辑器 + 实时预览  |
| **数据模型** | `EditorNode` 树（MJML AST）        | Markdown 纯文本             |

**关键发现：两者都以 MJML 作为中间格式。** emailmd 的管线是 `Markdown → HTML 片段 → Segments → MJML → email HTML`，这是天然的整合桥梁。

---

## 核心思路

在 Mail Studio 现有的 4 种编辑模式（Canvas / Edit / Preview / Code）基础上，**新增第 5 种 "Markdown" 编辑模式**，将 emailmd 作为 Markdown → 邮件 HTML 的渲染引擎集成进来。

---

## 架构概览

```
┌──────────────────────────────────────────────────────┐
│                    Mail Studio                        │
│                                                      │
│   ┌─────────────────── Toolbar ───────────────────┐  │
│   │  Canvas │ Edit │ Markdown │ Preview │ Code    │  │
│   └───────────────────────────────────────────────┘  │
│                                                      │
│   ┌─────────────┐     ┌──────────────────────────┐  │
│   │  Markdown   │     │                          │  │
│   │  Editor     │ ←→  │   Live Email Preview     │  │
│   │  (Monaco)   │     │   (emailmd render)       │  │
│   │             │     │                          │  │
│   └─────────────┘     └──────────────────────────┘  │
│         │                                            │
│         │  markdown → emailmd.render() → HTML        │
│         │  markdown → MJML segments → EditorNode     │
│         ▼                                            │
│   ┌──────────────────────────────────────────────┐  │
│   │  editorStore (EditorNode tree) ←→ MJML Code  │  │
│   └──────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

---

## 数据流设计

| 操作                       | 方向             | 实现方式                                          |
| -------------------------- | ---------------- | ------------------------------------------------- |
| **Markdown → Preview**     | 单向实时         | `emailmd.render(md)` → iframe HTML                |
| **Markdown → Canvas/Edit** | 单向转换         | emailmd 生成 MJML → `parseMjml()` → EditorNode 树 |
| **Canvas → Markdown**      | ❌ 不支持        | MJML → Markdown 逆向转换复杂度高，不建议          |
| **导入 .md 文件**          | 单向             | File menu → emailmd → EditorNode                  |
| **导出 Markdown**          | 仅 markdown 模式 | 直接保存当前 markdown 文本                        |

---

## 类型扩展

```typescript
// types/ui.ts
export type EditorMode = "canvas" | "edit" | "preview" | "code" | "markdown";
```

---

## Store 设计

### 新增 markdownStore

```typescript
// stores/markdownStore.ts
interface MarkdownState {
  markdown: string; // 当前 markdown 内容
  renderedHtml: string; // emailmd 渲染后的 HTML
  renderedText: string; // 纯文本版本
  theme: Partial<Theme>; // emailmd 主题覆盖
  isDirty: boolean; // 是否有未同步到 EditorNode 的修改
}

interface MarkdownActions {
  setMarkdown: (md: string) => void;
  renderMarkdown: () => void; // debounced render
  syncToEditor: () => void; // markdown → MJML → EditorNode
  importMarkdown: (md: string) => void;
  setTheme: (theme: Partial<Theme>) => void;
}
```

---

## 模式切换逻辑

```
用户在 Markdown 模式编辑
        │
        ├── 切换到 Preview → 直接用 emailmd 渲染的 HTML 显示
        │
        ├── 切换到 Code → 先调用 syncToEditor()，显示生成的 MJML
        │
        ├── 切换到 Canvas/Edit → 先调用 syncToEditor()，进入可视化编辑
        │   (弹出确认：「从 Markdown 转换到可视化模式后，无法回转为 Markdown，是否继续？」)
        │
        └── 从其他模式切换到 Markdown → 初始化空白 markdown 或保留上次 markdown
            (弹出确认：「当前可视化内容不会自动转为 Markdown，是否开始新的 Markdown 编辑？」)
```

---

## 新增组件清单

| 组件                      | 路径                                   | 说明                                                          |
| ------------------------- | -------------------------------------- | ------------------------------------------------------------- |
| `MarkdownEditor.tsx`      | `features/editor/components/markdown/` | 主容器，左右分栏（Monaco + Preview），复用 `ResizablePanel`   |
| `MarkdownEditorPane.tsx`  | 同上                                   | Monaco 编辑器，配置 markdown 语法高亮 + emailmd snippets      |
| `MarkdownPreviewPane.tsx` | 同上                                   | iframe 实时预览，复用 `Preview` 组件的 iframe 逻辑            |
| `MarkdownToolbar.tsx`     | 同上                                   | Markdown 专用工具栏（插入按钮/图片/callout 等 emailmd 指令）  |
| `MarkdownThemePanel.tsx`  | 同上                                   | emailmd 主题配置面板（颜色、字体等）                          |
| `markdownStore.ts`        | `features/editor/stores/`              | Markdown 状态管理                                             |
| `converter.ts`            | `features/editor/lib/markdown/`        | Markdown ↔ MJML 桥接层，封装 emailmd 的 `render` + 中间态提取 |

---

## Toolbar 改动

### 模式按钮

在现有的 `Canvas | Edit | Preview | Code` 中间加入 **Markdown** 按钮：

```
Canvas | Edit | Markdown | Preview | Code
```

### File 菜单新增

- **Import Markdown (.md)** — 将 .md 文件通过 emailmd → MJML → EditorNode 导入可视化编辑
- **Export Markdown** — 仅在 markdown 模式可用，直接下载当前 markdown 文本
- **Copy Markdown** — 仅在 markdown 模式可用

---

## Markdown 编辑器 UI 布局

```
┌──────────────────────────────────────────────────────────┐
│ [Toolbar: H1 H2 Bold Italic Link Image Button Callout]  │
├────────────────────────┬─────────────────────────────────┤
│                        │                                 │
│   Monaco Editor        │   Live Email Preview            │
│   (Markdown mode)      │   (iframe, 150ms debounce)     │
│                        │                                 │
│   ---                  │   ┌─────────────────────────┐  │
│   preheader: Welcome   │   │  [rendered email HTML]  │  │
│   ---                  │   │                         │  │
│   # Hello!             │   │  Hello!                 │  │
│   Thanks for...        │   │  Thanks for...          │  │
│                        │   │  [Get Started]          │  │
│   [Get Started]        │   │                         │  │
│   (https://...){button}│   └─────────────────────────┘  │
│                        │                                 │
├────────────────────────┴─────────────────────────────────┤
│ Status: Auto-saved | Theme: Light | Words: 42            │
└──────────────────────────────────────────────────────────┘
```

---

## 依赖安装

```bash
pnpm add emailmd
```

> emailmd 已声明 `"browser": { "mjml": "mjml-browser" }`，与 mail-studio 现有的 `mjml-browser` 依赖兼容，无需额外配置。

---

## 实施路线图

| 阶段        | 内容                                                                                       | 复杂度 |
| ----------- | ------------------------------------------------------------------------------------------ | ------ |
| **Phase 1** | 安装 `emailmd`，新增 `markdown` EditorMode，创建基础 `MarkdownEditor`（Monaco + 实时预览） | ⭐⭐   |
| **Phase 2** | Markdown → MJML → EditorNode 桥接，支持从 Markdown 模式切换到 Canvas                       | ⭐⭐⭐ |
| **Phase 3** | Markdown 专用工具栏（插入 emailmd 指令的快捷按钮）                                         | ⭐⭐   |
| **Phase 4** | emailmd 主题配置面板，frontmatter 可视化编辑                                               | ⭐⭐   |
| **Phase 5** | 导入/导出 .md 文件，Markdown 模板库                                                        | ⭐     |

---

## 风险与注意事项

1. **单向转换** — Markdown → 可视化是单向的，用户需明确知晓无法逆向。UI 应在切换时给出明确提示。
2. **emailmd 浏览器兼容性** — emailmd 依赖 `markdown-it` 等库，需确认 Next.js client-side bundle 无 Node.js 专属 API 问题。可能需要 `dynamic import` + `ssr: false`。
3. **MJML 版本一致性** — 确保 emailmd 内置的 MJML 版本与 mail-studio 的 `mjml-browser@4.18.0` 兼容。
4. **Bundle 大小** — emailmd 引入 `markdown-it` 及多个插件，需关注对 client bundle 的影响，考虑代码分割。
