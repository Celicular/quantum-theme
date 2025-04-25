# Quantum Visualization

An immersive 3D quantum-inspired visualization with React and Three.js.

## Features

- **Dynamic Star Background**: A space environment with twinkling stars, shooting stars, and nebula clouds
- **Quantum Cube**: Nested 3D cubes with an outer transparent cube and an inner vibrant cube, both rotating on different axes
- **Animated Title**: "QUANTUM" title with color gradient animations and glowing effects
- **Futuristic Search Bar**: A stylish search interface positioned at the bottom of the screen

## Technologies Used

- React.js
- Three.js with React Three Fiber
- Styled Components for styling
- GLSL Shaders for custom materials and effects

## Setup and Running

1. Install dependencies:
   ```
   npm install
   ```

2. Run the development server:
   ```
   npm start
   ```

3. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## How It Works

The application creates a 3D scene with the following components:

1. **StarBackground**: Creates multiple layers of stars with different behaviors:
   - Regular background stars
   - Twinkling stars with color variations
   - Shooting stars with trailing effects
   - Nebula clouds with color gradients

2. **QuantumCube**: Two nested cubes:
   - Outer cube: Transparent material with 80% transparency
   - Inner cube: Custom shader material with chroma gradient effects
   - Both cubes rotate independently on all three axes

3. **AnimatedTitle**: Text with multiple animations:
   - Color gradient animations
   - Pulsing effect
   - Letter spacing animation
   - Glowing text effects

4. **FuturisticSearchBar**: Positioned at the bottom of the screen with:
   - Transparent background with blur effect
   - Glowing border
   - Interactive hover and focus states

## Customization

You can customize various aspects of the visualization:

- Adjust star density, sizes, and colors in `StarBackground.js`
- Modify cube sizes, rotation speeds, and materials in `QuantumCube.js`
- Change title animations and styling in `AnimatedTitle.js`
- Adjust search bar positioning and appearance in `FuturisticSearchBar.js`

## License

MIT
