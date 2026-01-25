# Mail Studio

A modern, visual email editor built with [MJML](https://mjml.io/) and [Next.js](https://nextjs.org/). Create beautiful, responsive email templates with an intuitive drag-and-drop interface.

![Mail Studio](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)
![MJML](https://img.shields.io/badge/MJML-4.18-orange?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)

## ✨ Features

### 🎨 Visual Editor

- **Drag & Drop** - Intuitive component placement with visual feedback
- **Multiple View Modes** - Switch between Canvas, Edit, Code, and Preview modes
- **Real-time Preview** - See your changes instantly as you edit
- **Properties Panel** - Fine-tune every aspect of your components

### 📧 Email Components

- **Layout** - Section, Column, Group, Wrapper
- **Content** - Text, Image, Button, Divider, Spacer, Table
- **Interactive** - Accordion, Carousel, Navbar
- **Social** - Social icons with customizable links

### 🚀 Developer Experience

- **Monaco Code Editor** - Full-featured code editing with syntax highlighting
- **MJML Compilation** - Real-time MJML to HTML conversion
- **Undo/Redo** - Full history support with keyboard shortcuts
- **Keyboard Shortcuts** - Efficient workflow with hotkeys

### 📬 Email Delivery

- **Send Test Emails** - Built-in email sending via Nodemailer or Resend
- **Export HTML** - Get production-ready HTML output

### 📋 Templates

Pre-built templates to get you started:

- Welcome Email
- Newsletter
- Marketing Promo
- Account Notification

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/)
- **UI Library**: [React 19](https://react.dev/)
- **Email Engine**: [MJML Browser](https://mjml.io/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Drag & Drop**: [dnd-kit](https://dndkit.com/)
- **Code Editor**: [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/)

## Deploy Your Own

You can deploy this template to Vercel with the button below:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fwzc520pyfm%2Fmail-studio)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended)

### Installation

```bash
# Clone the repository
git clone https://github.com/wzc520pyfm/mail-studio.git
cd mail-studio

# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the editor.

### Available Scripts

```bash
# Development
pnpm dev          # Start development server

# Build
pnpm build        # Create production build
pnpm start        # Start production server

# Code Quality
pnpm lint         # Run ESLint
pnpm lint:fix     # Fix ESLint errors
pnpm format       # Format code with Prettier
pnpm format:check # Check code formatting
```

## 📖 Usage

### Editor Modes

| Mode        | Description                                         |
| ----------- | --------------------------------------------------- |
| **Canvas**  | Visual drag-and-drop editing with component sidebar |
| **Edit**    | Focused editing mode for quick content changes      |
| **Code**    | Direct MJML code editing with Monaco Editor         |
| **Preview** | See the final rendered email output                 |

### Keyboard Shortcuts

| Shortcut             | Action                    |
| -------------------- | ------------------------- |
| `Ctrl/⌘ + Z`         | Undo                      |
| `Ctrl/⌘ + Shift + Z` | Redo                      |
| `Delete / Backspace` | Delete selected component |
| `Escape`             | Deselect component        |

## 🔧 Configuration

### Email Sending

To enable email sending, configure your environment variables:

```env
# For Resend
RESEND_API_KEY=your_resend_api_key

# Or for Nodemailer
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_username
SMTP_PASS=your_password
```

## 📁 Project Structure

```
mail-studio/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API routes
│   │   ├── page.tsx            # Main editor page
│   │   └── layout.tsx          # Root layout
│   ├── components/
│   │   └── ui/                 # Reusable UI components
│   └── features/
│       └── editor/             # Editor feature module
│           ├── components/     # Editor components
│           │   ├── canvas/     # Canvas view components
│           │   ├── code-editor/# Monaco code editor
│           │   ├── edit-mode/  # Edit mode components
│           │   ├── preview/    # Preview component
│           │   ├── properties/ # Properties panel
│           │   ├── sidebar/    # Component sidebar
│           │   └── toolbar/    # Top toolbar
│           ├── hooks/          # Custom React hooks
│           ├── lib/            # Utilities and MJML schema
│           ├── stores/         # Zustand stores
│           └── types/          # TypeScript types
├── public/                     # Static assets
└── package.json
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [MJML](https://mjml.io/) - The framework that makes responsive emails easy
- [Next.js](https://nextjs.org/) - The React framework for production
- [dnd-kit](https://dndkit.com/) - Modern drag and drop for React
- [Radix UI](https://www.radix-ui.com/) - Unstyled, accessible components
