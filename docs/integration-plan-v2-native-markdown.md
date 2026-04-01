# Mail Studio × emailmd 整合方案（方案二：Markdown 原生融合）

## 设计哲学

方案一把 emailmd 作为一个平行编辑模式塞进 mail-studio，结果是两个割裂的世界。

方案二的思路完全不同：**不新增编辑模式，而是让 Markdown 成为 mail-studio 原生理解的内容语言**，融入现有的每一个工作流节点。

对用户来说感知是：「Mail Studio 现在懂 Markdown 了」，而不是「Mail Studio 里多了个 Markdown 编辑器」。

---

## 核心能力：Segment → EditorNode 桥接

emailmd 的处理管线是：

```
Markdown → parseMarkdown() → HTML 片段 → segment() → Segment[] → MJML → email HTML
```

关键发现：emailmd 的 Segment 类型与 mail-studio 的 EditorNode 组件 **几乎 1:1 映射**：

| emailmd Segment | mail-studio EditorNode                                  |
| --------------- | ------------------------------------------------------- |
| `text`          | `mj-section > mj-column > mj-text`                      |
| `button`        | `mj-section > mj-column > mj-button`                    |
| `button-group`  | `mj-section > [mj-column > mj-button] × N`              |
| `image`         | `mj-section > mj-column > mj-image`                     |
| `hr`            | `mj-section > mj-column > mj-divider`                   |
| `table`         | `mj-section > mj-column > mj-table`                     |
| `callout`       | `mj-section(bg) > mj-column(bg+radius) > mj-text`       |
| `header`        | `mj-section > mj-column > mj-text(small, center)`       |
| `footer`        | `mj-section > mj-column > mj-text(small, center)`       |
| `hero`          | `mj-hero > mj-column > mj-text` 或 `mj-section(bg-url)` |

这意味着我们可以编写 `segmentsToEditorNodes()` 转换器，**直接把 emailmd 的中间产物转为 mail-studio 的文档树**，无需经过 MJML 文本再解析。

### 核心转换函数

```typescript
// lib/markdown/converter.ts
import { render, extractFrontmatter, type Theme } from "emailmd";
import { parseMarkdown } from "emailmd";  // 内部用
import { segment } from "emailmd";        // 内部用

/**
 * 将 Markdown 转为 EditorNode 文档树
 * 利用 emailmd 的 segment 中间产物，直接映射到 EditorNode，
 * 比 markdown → MJML string → parseMjml() 更精准、更可控。
 */
function segmentsToEditorNodes(segments: Segment[], theme: Theme): EditorNode[] { ... }

/**
 * 将 Markdown 文本转为完整的 EditorNode 文档
 * 同时提取 frontmatter 中的主题和 head settings
 */
export function markdownToDocument(markdown: string): {
  document: EditorNode;
  headSettings: Partial<HeadSettings>;
} { ... }

/**
 * 将 Markdown 文本直接渲染为 email HTML（用于快速预览）
 */
export function renderMarkdownPreview(markdown: string): {
  html: string;
  text: string;
} { ... }
```

---

## 融合点一：「从 Markdown 创建」入口

### 产品体验

用户在创建新邮件时，除了选择模板、空白文档，还可以选择「从 Markdown 创建」：

1. 弹出一个 Dialog，左侧是 Markdown 编辑区，右侧是实时邮件预览
2. 用户粘贴或编写 Markdown（支持 emailmd 完整语法）
3. 预览满意后点击「创建」
4. emailmd 将 Markdown 转为 `Segment[]` → `EditorNode` 文档树
5. 用户进入标准的 Canvas/Edit 模式，像编辑任何其他邮件一样继续工作

### 关键特征

- **不是一个新的编辑模式** — 是一个创建流程的入口
- **转换后是标准 EditorNode** — 后续编辑完全在现有体系内
- **Markdown 是输入格式，不是编辑格式** — 就像 Figma 导入 Sketch 文件一样

### 技术实现

```
Sidebar > Templates Tab > 新增 "From Markdown" 选项
                                    │
                                    ▼
                        ┌──────────────────────────┐
                        │  MarkdownImportDialog     │
                        │  ┌──────┐  ┌──────────┐  │
                        │  │Monaco│  │  Preview  │  │
                        │  │  .md │  │ (iframe)  │  │
                        │  └──────┘  └──────────┘  │
                        │         [创建邮件]        │
                        └──────────────────────────┘
                                    │
                                    ▼
                        markdownToDocument(md)
                                    │
                                    ▼
                        editorStore.setDocument(doc)
                        → 进入 Canvas 模式正常编辑
```

---

## 融合点二：Markdown 模板库

### 产品体验

在 Sidebar 的 **Templates** 面板中，新增一个类别 「Markdown 模板」。每个模板展示：

- 模板名称 + 缩略预览
- 点击后直接将 Markdown 转为 EditorNode 文档树加载到编辑器

### 模板来源

- 内置的 emailmd 示例模板（welcome, newsletter, transactional 等）
- 用户可以粘贴任意 Markdown 保存为模板

### 技术实现

```typescript
// lib/markdown/templates.ts
export const markdownTemplates: MarkdownTemplate[] = [
  {
    id: "md-welcome",
    name: "Welcome Email",
    category: "markdown",
    markdown: `---\npreheader: "Thanks for signing up."\n---\n\n# Welcome!\n...`,
    // 预览 HTML 在构建时预生成或首次使用时缓存
  },
  // ...
];
```

**与现有模板系统统一**：现有的 `templates` 数组存的是 `EditorNode` 文档树，Markdown 模板只是多了一步转换，最终产出物完全相同。

---

## 融合点三：文本块的 Markdown 输入

### 产品体验

在 Canvas 模式下，用户双击 `mj-text` 组件进入编辑时：

- 当前默认是 TipTap 富文本编辑
- 在 TipTap 工具栏上新增一个 `</>` 按钮，点击切换到 Markdown 输入模式
- 在 Markdown 模式下，显示一个 Monaco 编辑器（或简易文本域），用户直接写 Markdown
- 输入的 Markdown 通过 `markdown-it` 实时转为 HTML，存入 `node.content`
- 切换回富文本模式时，看到的就是渲染后的 HTML

### 关键特征

- **逐块 Markdown** — 不是整封邮件，而是单个文本块级别
- **与现有工作流无缝** — 只是 mj-text 的另一种输入方式
- **适合习惯 Markdown 的开发者** — 写列表、链接、代码块时比富文本更快

### 技术实现

```
TextNode 组件
├── mode: "richtext" (默认) → TipTap EditorContent
└── mode: "markdown" (切换) → Monaco/Textarea
                                    │
                        parseMarkdown(md) → HTML
                                    │
                        updateNodeContent(nodeId, html)
```

在 `EditorNode` 中新增可选字段：

```typescript
interface EditorNode {
  // ... 现有字段
  /** 如果此文本块是用 Markdown 编写的，保存原始 Markdown 源码 */
  markdownSource?: string;
}
```

这样当用户再次编辑时，可以回到 Markdown 模式继续编辑源码，而不是面对转换后的 HTML。

---

## 融合点四：Code 模式支持 Markdown

### 产品体验

在现有的 Code 模式中，工具栏新增一个下拉切换：

```
[MJML ▾]  →  MJML | Markdown
```

- 选择 **MJML** 时，与现在完全一致（Monaco 编辑 MJML 源码）
- 选择 **Markdown** 时：
  - 左侧编辑器切换为 Markdown 语法高亮
  - 右侧预览使用 `emailmd.render()` 直接生成邮件 HTML
  - 编辑完成后，用户可以点击「应用到编辑器」，执行 `markdownToDocument()` 同步到 EditorNode

### 关键特征

- **不是新的 EditorMode** — 是 Code 模式内部的一个子选项
- **对现有架构改动最小** — 只是 CodeEditor 组件内部的 tab 切换
- **明确的方向性** — Markdown → EditorNode 是显式操作，用户知道这是单向转换

---

## 融合点五：导入/导出 Markdown

### File 菜单新增

- **Import Markdown (.md)** — 读取 .md 文件 → `markdownToDocument()` → `setDocument()`
- **Export Markdown** — 仅当文档有 `markdownSource` 时可用，否则 disabled

### 剪贴板

- **Copy as Markdown** — 未来可考虑，需要 HTML → Markdown 逆向转换，优先级低

---

## 不做什么

| 不做                            | 原因                                                 |
| ------------------------------- | ---------------------------------------------------- |
| ❌ 新增 `"markdown"` EditorMode | 会造成两个割裂的编辑世界                             |
| ❌ Markdown 实时双向同步        | MJML → Markdown 逆向转换不可靠                       |
| ❌ 替换现有的 TipTap 编辑器     | Markdown 是补充，不是替代                            |
| ❌ 全局 Markdown 主题面板       | emailmd 主题通过 frontmatter 配置即可，不需要专门 UI |

---

## 新增组件清单

| 组件                       | 路径                                  | 说明                                               |
| -------------------------- | ------------------------------------- | -------------------------------------------------- |
| `MarkdownImportDialog.tsx` | `features/editor/components/toolbar/` | 「从 Markdown 创建」对话框，含编辑器 + 预览        |
| `MarkdownToggle.tsx`       | `features/editor/components/tiptap/`  | TextNode 的 Markdown/富文本 切换按钮               |
| `MarkdownTextInput.tsx`    | `features/editor/components/tiptap/`  | 单个文本块的 Markdown 输入组件                     |
| `converter.ts`             | `features/editor/lib/markdown/`       | `markdownToDocument()` — Segment → EditorNode 桥接 |
| `templates.ts`             | `features/editor/lib/markdown/`       | 内置 Markdown 邮件模板                             |

---

## 类型扩展

```typescript
// types/node.ts — EditorNode 新增可选字段
interface EditorNode {
  // ... 现有字段不变
  /** Markdown 源码（仅 mj-text 块，用于 Markdown 编辑模式回显） */
  markdownSource?: string;
}

// types/ui.ts — EditorMode 不变！
export type EditorMode = "canvas" | "edit" | "preview" | "code"; // 保持不变

// types/ui.ts — Code 模式新增子类型
export type CodeLanguage = "mjml" | "markdown";
```

---

## 实施路线图

| 阶段        | 内容                                                  | 改动范围                   | 复杂度 |
| ----------- | ----------------------------------------------------- | -------------------------- | ------ |
| **Phase 1** | 核心桥接：`converter.ts`（Segment → EditorNode 映射） | 新增 1 个文件              | ⭐⭐   |
| **Phase 2** | 导入 Markdown：File 菜单 + Import Dialog              | Toolbar 改动 + 新增 Dialog | ⭐     |
| **Phase 3** | 「从 Markdown 创建」Dialog（带编辑器 + 预览）         | 新增 Dialog 组件           | ⭐⭐   |
| **Phase 4** | Markdown 模板库（Sidebar Templates 新增分类）         | TemplatesPanel 改动        | ⭐     |
| **Phase 5** | 文本块 Markdown 切换（TextNode 内 Markdown 输入）     | TextNode + TipTap 改动     | ⭐⭐⭐ |
| **Phase 6** | Code 模式 Markdown 子选项                             | CodeEditor 改动            | ⭐⭐   |

### 推荐实施顺序

**Phase 1 → 2 → 3 → 4** 是最小可用路径，能让用户立刻体验到 Markdown 创建邮件的能力。

Phase 5 和 6 是锦上添花，可以后续迭代。

---

## 与方案一的对比

| 维度                | 方案一（平行模式）                 | 方案二（原生融合）           |
| ------------------- | ---------------------------------- | ---------------------------- |
| **用户心智模型**    | 「两个编辑器」                     | 「一个编辑器，多种输入方式」 |
| **EditorMode 改动** | 新增 `"markdown"` 模式             | 不变                         |
| **数据模型**        | 需要 markdownStore                 | 复用 editorStore             |
| **模式切换**        | 需要复杂的同步逻辑 + 确认弹窗      | 无模式切换问题               |
| **代码改动量**      | 大（新 Store + 新模式 + 同步逻辑） | 中（桥接函数 + UI 入口）     |
| **产品一致性**      | 偏低（两个世界）                   | 高（Markdown 融入现有体系）  |
| **后续维护**        | 需维护两套编辑逻辑                 | 只有一套编辑逻辑             |

---

## 风险与注意事项

1. **Segment → EditorNode 映射精度** — emailmd 的 callout/highlight 等指令在转为 EditorNode 后，样式信息（圆角、背景色）需要正确映射到 mj-section/mj-column 的 props 中。需要逐一验证。
2. **`markdownSource` 持久化** — 如果用户在 Markdown 模式下编辑了文本块，然后在富文本模式下又改了 HTML，`markdownSource` 就过时了。需要在富文本编辑时清除 `markdownSource`。
3. **emailmd 浏览器兼容性** — 同方案一，需 dynamic import + ssr: false。
4. **渐进式发布** — Phase 1-4 可以独立发布，不影响现有功能。Phase 5 改动 TextNode，需要更多测试。
