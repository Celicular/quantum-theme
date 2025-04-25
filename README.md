# Quantum by Himadri

An interactive 3D visualization experience featuring a quantum-themed interface with dynamic animations, user controls, and responsive design.

## Features

- Beautiful 3D quantum cube with customizable colors
- Interactive star field with thousands of particles
- Performance-optimized for all devices
- Touch and mouse controls for navigation
- Responsive design for desktop and mobile

## Getting Started

### Prerequisites

- Node.js 14.x or higher
- npm 6.x or higher

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd quantum-theme
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

## Production Build

The project is configured with several production optimizations:

### Building for Production

1. Generate an optimized production build:
```bash
npm run build
```

2. Analyze the bundle size (optional):
```bash
npm run build:analyze
```

3. Test the production build locally:
```bash
npm run serve
```

### Optimization Features

- **Code Splitting**: Automatically splits code into smaller chunks for better loading performance
- **Tree Shaking**: Removes unused code
- **Dynamic Performance Settings**: Automatically adjusts rendering quality based on device capabilities
- **Image Optimization**: Compresses and optimizes images
- **Gzip Compression**: Compresses assets for faster delivery
- **No Source Maps**: Improves loading performance and reduces bundle size
- **Console Log Removal**: Removes console.log statements in production

## Deployment

### Static Hosting (Recommended)

Deploy to any static hosting service like Netlify, Vercel, GitHub Pages, or AWS S3:

1. Build the project
```bash
npm run build
```

2. Upload the contents of the `build` folder to your hosting service

### Server Configuration

For optimal performance, set the following headers:

```
Cache-Control: max-age=31536000, immutable (for files with content hashes)
Cache-Control: no-cache (for index.html)
Content-Encoding: gzip
```

## Performance Optimization

The application automatically detects device capabilities and adjusts quality settings accordingly:

- **Low-end devices**: Reduced particle count, lower resolution, disabled antialiasing
- **Mid-range devices**: Balanced settings with moderate particle count
- **High-end devices**: Full quality with maximum particles and visual effects

## Credits

Made with ❤️ by Himadri

## License

This project is licensed under the MIT License - see the LICENSE file for details
