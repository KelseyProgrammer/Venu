# Venu

A modern venue management platform built with Next.js 14, TypeScript, Tailwind CSS, and shadcn/ui.

## Features

- ⚡ Next.js 14 with App Router
- 🎨 Tailwind CSS with custom design system
- 🧩 shadcn/ui components
- 📱 Responsive design
- 🌙 Dark mode support
- 🔧 TypeScript for type safety

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd VENU
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── components/          # Reusable components
│   └── ui/             # shadcn/ui components
└── lib/                # Utility functions
    └── utils.ts        # shadcn utility functions
```

## Adding shadcn/ui Components

To add new shadcn/ui components:

1. Use the shadcn CLI:
```bash
npx shadcn@latest add [component-name]
```

2. Or manually create components following the shadcn/ui patterns in the `src/components/ui/` directory.

## Customization

- Colors and design tokens are defined in `src/app/globals.css`
- Tailwind configuration is in `tailwind.config.js`
- Component variants and styling are in individual component files

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## License

This project is licensed under the MIT License. 