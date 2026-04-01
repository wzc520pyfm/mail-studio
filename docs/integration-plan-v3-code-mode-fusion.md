# Mail Studio × emailmd 整合方案（方案三：Code 模式双语融合）

## 设计哲学

- **方案一的问题**：新增第 5 个 EditorMode，两个编辑世界生硬并列
- **方案二的问题**：把 Markdown 拆散到各个角落，偏离了「用 Markdown 写邮件」的核心体验
- **方案三的思路**：Markdown 本质上是代码编辑，所以它天然属于 Code 模式。将 Code 模式升级为「双语编辑器」——MJML 和 Markdown 是同一个编辑空间里的两种源码语言，通过清晰的转化关系连接

---

## 核心概念：两种源码语言，一个编辑器

```
┌──────────────────────────────────────────────────────────┐
│                      Mail Studio                          │
│                                                          │
│   ┌──── Toolbar ─────────────────────────────────────┐   │
│   │   Canvas  │  Edit  │  Preview  │  Code           │   │
│   └──────────────────────────────────────────────────┘   │
│                                                          │
│   Canvas / Edit / Preview                                │
│     └── 操作对象：EditorNode 文档树（MJML AST）          │
│                                                          │
│   Code 模式                                              │
│     ├── MJML 语言   ⟷  EditorNode（双向同步）           │
│     └── Markdown 语言  →  EditorNode（单向转化）         │
└──────────────────────────────────────────────────────────┘
```

用户的心智模型非常简单：

- **Canvas / Edit / Preview** — 可视化操作邮件
- **Code** — 查看和编辑源码，源码有两种语言可选：MJML（原生格式）和 Markdown（便捷格式）

---

## 转化关系图

这是整个方案的核心，也是需要在 UI 中清晰传达给用户的：

```
                ┌─────────────────────────┐
                │    EditorNode 文档树     │
                │   （Mail Studio 核心）   │
                └────┬──────────┬─────────┘
                     │          │
                ⟷ 双向同步   ⟷ 双向驱动
                     │          │
              ┌──────┴───┐  ┌──┴──────────────┐
              │ MJML 源码 │  │ Canvas/Edit/预览 │
              └──────────┘  └─────────────────┘
                     ▲
                     │ 单向转化（Convert）
                     │
              ┌──────┴─────┐
              │ Markdown    │
              │ (via emailmd)│
              └────────────┘
```

**关键规则**：

1. MJML ⟷ EditorNode：双向同步（现有行为，Apply/Reset）
2. Markdown → EditorNode：单向转化（Convert 操作，不可逆）
3. Canvas/Edit/Preview ⟷ EditorNode：双向驱动（现有行为）
4. Markdown 有自己的实时预览：直接用 emailmd.render()，不经过 EditorNode

---

## Code 模式 UI 设计

### 当前 Code 模式（不变）

```
┌─────────────────────────────────────────────────────────┐
│ MJML Source          [Modified]       [Reset] [Apply]   │
├────────────────────────────┬────────────────────────────┤
│                            │  ┌──────────┬──────┐       │
│  Monaco Editor             │  │ Preview  │ HTML │       │
│  (MJML language)           │  └──────────┴──────┘       │
│                            │                            │
│  <mjml>                    │  ┌──────────────────┐      │
│    <mj-body>               │  │                  │      │
│      <mj-section>          │  │  Rendered Email  │      │
│        ...                 │  │                  │      │
│                            │  └──────────────────┘      │
└────────────────────────────┴────────────────────────────┘
```

### 升级后的 Code 模式

工具栏新增语言切换 Tab：

```
┌─────────────────────────────────────────────────────────┐
│ ┌──────┬────────────┐                                   │
│ │ MJML │ Markdown ✦ │         [Modified] [Reset] [Apply]│
│ └──────┴────────────┘                                   │
├────────────────────────────┬────────────────────────────┤
│                            │                            │
│  (内容根据选中的语言变化)    │  (预览根据选中的语言变化)    │
│                            │                            │
└────────────────────────────┴────────────────────────────┘
```

### MJML Tab（默认，现有行为不变）

```
┌─────────────────────────────────────────────────────────┐
│ ┌────────┬──────────┐                                   │
│ │✦ MJML  │ Markdown │      [Modified]  [Reset] [Apply]  │
│ └────────┴──────────┘                                   │
│  ⟷ Changes sync with the visual editor                  │
├────────────────────────────┬────────────────────────────┤
│                            │  ┌──────────┬──────┐       │
│  <mjml>                    │  │ Preview  │ HTML │       │
│    <mj-body>               │  └──────────┴──────┘       │
│      <mj-section>          │                            │
│        <mj-column>         │   [Rendered Email]         │
│          <mj-text>         │                            │
│            Hello!          │                            │
│                            │                            │
└────────────────────────────┴────────────────────────────┘
```

- 标签下方提示：`⟷ Changes sync with the visual editor`
- Apply = 将 MJML 代码解析回 EditorNode（现有行为）
- 这就是当前的 Code 模式，完全不变

### Markdown Tab

```
┌─────────────────────────────────────────────────────────┐
│ ┌──────┬────────────┐                                   │
│ │ MJML │✦ Markdown  │              [Convert to Editor ➜]│
│ └──────┴────────────┘                                   │
│  → Markdown will replace the current document on convert│
├────────────────────────────┬────────────────────────────┤
│                            │                            │
│  ---                       │                            │
│  preheader: Welcome!       │   ┌──────────────────┐     │
│  ---                       │   │                  │     │
│                            │   │  Welcome!        │     │
│  # Welcome!                │   │                  │     │
│                            │   │  Thanks for      │     │
│  Thanks for signing up.    │   │  signing up.     │     │
│                            │   │                  │     │
│  [Get Started]             │   │  [Get Started]   │     │
│  (https://...){button}     │   │                  │     │
│                            │   └──────────────────┘     │
│                            │                            │
│                            │  emailmd live preview      │
└────────────────────────────┴────────────────────────────┘
```

- 标签下方提示：`→ Markdown will replace the current document on convert`
- **没有 Apply/Reset**，取而代之的是 **「Convert to Editor ➜」** 按钮
- 左侧：Monaco editor，language = markdown
- 右侧：emailmd.render() 的实时预览（150ms debounce），独立于 EditorNode
- Markdown 内容保存在 `uiStore` 中，不影响 EditorNode

---

## 转化操作：「Convert to Editor」

这是 Markdown 与可视化世界的唯一连接点，需要设计清晰。

### 点击「Convert to Editor ➜」后

弹出确认 Dialog：

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  ⚠ Convert Markdown to Visual Editor            │
│                                                 │
│  This will:                                     │
│  • Parse your Markdown into visual blocks       │
│  • Replace the current document in the editor   │
│  • Your Markdown source will be preserved in    │
│    the Markdown tab for future reference        │
│                                                 │
│  This conversion is one-way. The visual editor  │
│  uses MJML format. Edits made in Canvas/Edit    │
│  mode won't sync back to Markdown.              │
│                                                 │
│             [Cancel]  [Convert & Open Editor ➜] │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 转化后的行为

1. Markdown 通过 `markdownToDocument()` 转为 EditorNode 文档树
2. 调用 `editorStore.setDocument(newDoc)` 替换当前文档
3. 自动切换到 Canvas 模式，让用户立刻看到可视化结果
4. Markdown 源码保留在 Markdown Tab 中（但标记为 "已转化"，显示与当前文档的关系）
5. 用户可以随时回到 Code → Markdown Tab 修改并再次 Convert

### 转化后回到 Markdown Tab

```
┌─────────────────────────────────────────────────────────┐
│ ┌──────┬────────────┐                                   │
│ │ MJML │✦ Markdown  │              [Convert to Editor ➜]│
│ └──────┴────────────┘                                   │
│  ✓ Last converted at 20:30 · Visual editor may have     │
│    been modified since then                             │
├────────────────────────────┬────────────────────────────┤
│                            │                            │
│  (保留上次的 Markdown)       │  (emailmd 实时预览)        │
│                            │                            │
└────────────────────────────┴────────────────────────────┘
```

提示信息让用户清楚知道：

- 这份 Markdown 上次已经转化过
- 之后在可视化编辑器中做的修改不会反映回这里
- 再次 Convert 会再次替换当前文档

---

## 模式切换行为总结

| 从                            | 到              | 行为                                   |
| ----------------------------- | --------------- | -------------------------------------- |
| Canvas/Edit                   | Code (MJML)     | MJML 从 EditorNode 生成（现有行为）    |
| Canvas/Edit                   | Code (Markdown) | 显示上次的 Markdown 内容（或默认模板） |
| Code (MJML) Apply             | Canvas/Edit     | MJML 解析回 EditorNode（现有行为）     |
| Code (Markdown) Convert       | Canvas          | Markdown → EditorNode，切换到 Canvas   |
| Code (MJML) ↔ Code (Markdown) | Tab 切换        | 两个独立缓冲区，互不影响               |
| Preview                       | 任意            | 无特殊行为                             |

---

## 技术设计

### 类型定义

```typescript
// types/ui.ts — EditorMode 不变
export type EditorMode = "canvas" | "edit" | "preview" | "code";

// types/ui.ts — 新增 Code 语言类型
export type CodeLanguage = "mjml" | "markdown";
```

### Store 变更

```typescript
// stores/uiStore.ts — 新增字段
interface UIState {
  // ... 现有字段不变

  // Code 模式语言选择
  codeLanguage: CodeLanguage;

  // Markdown 编辑缓冲区
  markdownBuffer: string;

  // 上次 Convert 的时间戳（null = 从未转化）
  lastMarkdownConvertTime: number | null;
}

interface UIActions {
  // ... 现有 actions 不变

  setCodeLanguage: (lang: CodeLanguage) => void;
  setMarkdownBuffer: (md: string) => void;
  setLastMarkdownConvertTime: (time: number | null) => void;
}
```

不需要新的 Store，所有 Markdown 相关状态放在 `uiStore` 中（因为它是 UI 状态，不是文档状态）。

### 核心转化函数

```typescript
// lib/markdown/converter.ts

import { render, extractFrontmatter } from "emailmd";
// 利用 emailmd 的中间产物做精准映射
import { parseMarkdown } from "emailmd";
import { segment, type Segment } from "emailmd";

/**
 * 将 emailmd Segment 数组转为 EditorNode 文档树
 * 这是整个方案的核心桥梁
 */
function segmentsToEditorNodes(segments: Segment[], theme: Theme): EditorNode[];

/**
 * 完整转化：Markdown → EditorNode 文档
 */
export function markdownToDocument(markdown: string): {
  document: EditorNode;
  headSettings: Partial<HeadSettings>;
};

/**
 * 快速预览：Markdown → email HTML（用于 Markdown Tab 的实时预览）
 */
export function renderMarkdownPreview(markdown: string): {
  html: string;
  text: string;
};
```

### 组件变更

```
code-editor/
├── CodeEditor.tsx          ← 改造：根据 codeLanguage 切换 MJML/Markdown 编辑器
├── components/
│   ├── CodeEditorToolbar.tsx  ← 改造：新增 MJML/Markdown Tab 切换
│   ├── CodeEditorBanners.tsx  ← 小改：Markdown 模式下显示不同的提示
│   └── index.ts
├── hooks/
│   ├── useCodeSync.ts         ← 不变（MJML 专用）
│   ├── useMarkdownSync.ts     ← 新增：Markdown 缓冲区管理 + emailmd 渲染
│   └── index.ts
└── utils/
    └── ...                    ← 不变
```

### CodeEditor 组件改造逻辑

```typescript
export function CodeEditor() {
  const codeLanguage = useUIStore((s) => s.codeLanguage);

  if (codeLanguage === "markdown") {
    return <MarkdownCodeEditor />;
  }

  return <MjmlCodeEditor />;  // 现有的 CodeEditor 逻辑
}
```

`MarkdownCodeEditor` 是新组件：

- 使用 Monaco，language = "markdown"
- 读写 `uiStore.markdownBuffer`
- 右侧预览使用 `renderMarkdownPreview()` 而非 `compileDocument()`
- 工具栏显示 「Convert to Editor ➜」而非 Apply/Reset

---

## 右侧预览面板行为

现有 Code 模式的右侧预览（Preview 组件）从 EditorNode 编译。Markdown 模式需要独立预览。

### 方案：Markdown Tab 自带预览

在 Editor.tsx 的 Code 模式区域中：

```typescript
// 当前代码（不变）
{editorMode === "code" && isMediumScreen && (
  <ResizablePanelGroup direction="horizontal">
    <ResizablePanel defaultSize={50} minSize={30}>
      <CodeEditor />     {/* 内部根据 codeLanguage 切换 */}
    </ResizablePanel>
    <ResizableHandle withHandle />
    <ResizablePanel defaultSize={50} minSize={30}>
      <Preview />        {/* 需要改造：Markdown 模式下用 emailmd 预览 */}
    </ResizablePanel>
  </ResizablePanelGroup>
)}
```

Preview 组件改造：

- 检测 `codeLanguage`
- 若为 `"mjml"`：现有逻辑（从 EditorNode 编译）
- 若为 `"markdown"`：从 `uiStore.markdownBuffer` 用 emailmd.render() 生成 HTML

---

## File 菜单扩展

| 菜单项                    | 行为                                                        |
| ------------------------- | ----------------------------------------------------------- |
| **Import Markdown (.md)** | 读取文件 → 写入 markdownBuffer → 切换到 Code (Markdown) Tab |
| **Export Markdown (.md)** | 下载 markdownBuffer 内容（仅 markdownBuffer 非空时可用）    |

导入 Markdown 不直接替换文档，而是先进入 Markdown Tab 让用户预览和编辑，然后由用户主动点击 Convert。这避免了误操作覆盖当前工作。

---

## 不做什么

| 不做                          | 原因                                                             |
| ----------------------------- | ---------------------------------------------------------------- |
| ❌ 新增 EditorMode            | Markdown 属于 Code 模式内部                                      |
| ❌ Markdown 双向同步          | 保持转化关系简单清晰                                             |
| ❌ 文本块级别的 Markdown 输入 | 过于碎片化，偏离「用 Markdown 写邮件」的完整体验                 |
| ❌ Markdown 主题 UI 面板      | emailmd 的主题通过 frontmatter 配置，Code 编辑器本身就是配置入口 |
| ❌ 独立的 markdownStore       | 状态量小，放在 uiStore 即可                                      |

---

## 实施路线图

| 阶段        | 内容                                                                      | 改动文件                                       | 复杂度 |
| ----------- | ------------------------------------------------------------------------- | ---------------------------------------------- | ------ |
| **Phase 1** | `converter.ts`：Segment → EditorNode 映射 + `renderMarkdownPreview()`     | 新增 `lib/markdown/converter.ts`               | ⭐⭐   |
| **Phase 2** | uiStore 扩展 + CodeEditorToolbar 语言切换 Tab                             | `uiStore.ts`, `CodeEditorToolbar.tsx`          | ⭐     |
| **Phase 3** | `MarkdownCodeEditor` 组件 + Markdown 实时预览                             | 新增组件, 改造 `CodeEditor.tsx`, `Preview.tsx` | ⭐⭐   |
| **Phase 4** | Convert 操作 + 确认 Dialog                                                | 新增 Dialog, `useMarkdownSync.ts`              | ⭐⭐   |
| **Phase 5** | File 菜单 Import/Export Markdown                                          | `Toolbar.tsx`                                  | ⭐     |
| **Phase 6** | Markdown 模板（内置几个 emailmd 示例，从模板面板快速加载到 Markdown Tab） | `TemplatesPanel`, `lib/markdown/templates.ts`  | ⭐     |

### 最小可用路径

**Phase 1 → 2 → 3 → 4** 即可交付完整的 Markdown 编辑 + 预览 + 转化体验。

Phase 5 和 6 是便利性增强。

---

## 与方案一、方案二的对比

| 维度             | 方案一                 | 方案二            | 方案三                         |
| ---------------- | ---------------------- | ----------------- | ------------------------------ |
| **定位**         | 平行编辑模式           | 分散融入各处      | Code 模式内双语编辑            |
| **EditorMode**   | 新增 `markdown`        | 不变              | 不变                           |
| **新增 Store**   | markdownStore          | 无                | uiStore 扩展 2 个字段          |
| **用户心智**     | 两个编辑器             | 到处都有 Markdown | 一个 Code 编辑器，两种语言     |
| **转化关系**     | 模糊（模式切换时隐式） | 分散              | 清晰（Convert 按钮，确认弹窗） |
| **编辑体验**     | 完整但割裂             | 碎片化            | 完整且统一                     |
| **代码改动**     | 大                     | 中                | 中                             |
| **Preview 复用** | 需要独立处理           | 复杂              | 自然复用现有 Preview 组件      |
