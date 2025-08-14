# 🎮 Maze Generator

A performant, type-safe maze generation web application built with [Astro](https://astro.build) and TypeScript.

[![Built with Astro](https://astro.badg.es/v2/built-with-astro/small.svg)](https://astro.build)

## ✨ Features

- Interactive maze generation and visualization
- Type-safe game logic with TypeScript
- Component-based architecture using Astro
- Zero client-side JavaScript by default (Astro's island architecture)
- Responsive controls and design

## 🛠️ Technical Stack

- [Astro](https://astro.build) v5.12.9
- [TypeScript](https://www.typescriptlang.org/) with strict mode enabled
- Modern CSS with global styles

## 🚀 Quick Start

1. Clone this repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Start the development server:
   ```bash
   pnpm dev
   ```
4. Open [http://localhost:4321](http://localhost:4321) in your browser

## 📁 Project Structure

```
/
├── public/               # Static assets
│   └── favicon.svg
├── src/
│   ├── assets/          # Project assets
│   │   ├── astro.svg
│   │   └── background.svg
│   ├── components/      # Reusable components
│   │   ├── Controls.astro
│   │   ├── MazeCanvas.astro
│   │   └── mazeLogic.ts
│   ├── layouts/         # Page layouts
│   │   └── Layout.astro
│   ├── pages/           # File-based routing
│   │   └── index.astro
│   └── styles/          # Global styles
│       └── global.css
└── package.json
```

## 🔧 Available Scripts

| Command        | Action                                      |
|---------------|---------------------------------------------|
| `pnpm install` | Install project dependencies                |
| `pnpm dev`     | Start development server at localhost:4321  |
| `pnpm build`   | Build production site to ./dist/           |
| `pnpm preview` | Preview production build locally            |

## 💻 Development Best Practices

1. **Type Safety**
   - Strict TypeScript configuration enabled
   - Type declarations in `src/@types`
   - Proper type annotations for maze algorithms

2. **Component Organization**
   - Logical component separation
   - Reusable layout patterns
   - Clear component responsibilities

3. **Asset Management**
   - Static assets in `public/`
   - Project-specific assets in `src/assets/`
   - SVG optimization for performance

4. **Styling**
   - Global styles in `src/styles/`
   - Component-specific styles in `.astro` files
   - CSS custom properties for theming

5. **Performance**
   - Zero-JavaScript by default
   - Optimized assets
   - Server-side rendering

## 🔍 Type Safety

The project uses TypeScript's strict mode with Astro's recommended configuration:
```typescript
// tsconfig.json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

## 📚 Useful Resources

- [Astro Documentation](https://docs.astro.build)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Astro's TypeScript Guide](https://docs.astro.build/en/guides/typescript/)
- [Astro Components Guide](https://docs.astro.build/en/core-concepts/astro-components/)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the MIT license.
