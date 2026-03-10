# Ramadan Kareem — Awwwards-Style Immersive Website

A production-style React + Vite codebase for a cinematic Ramadan Kareem experience built for visitors who may be unfamiliar with Ramadan.

## Stack

- React + Vite
- React Router
- React Three Fiber / Three.js
- Drei
- Framer Motion
- TailwindCSS
- Custom GLSL shader for the water footer

## Install

Assuming your Vite project already exists:

```bash
npm install react-router-dom three @react-three/fiber @react-three/drei framer-motion lucide-react
npm install -D tailwindcss postcss autoprefixer
```

If Tailwind is not configured yet:

```bash
npx tailwindcss init -p
```

Then copy the files from this codebase into your project.

## Run

```bash
npm run dev
```

## Routes

- `/`
- `/about-ramadan`
- `/worship-during-ramadan`
- `/ramadan-culture-celebration`

## Folder structure

```text
src/
  components/
    CelebrationSection.jsx
    CharitySection.jsx
    FastingSection.jsx
    Footer.jsx
    Hero.jsx
    InfoCardGrid.jsx
    Navbar.jsx
    PageHero.jsx
    PrayerSection.jsx
    QuranSection.jsx
    RamadanIntro.jsx
    ScrollProgress.jsx
    SectionTitle.jsx
    StorySection.jsx
    WaterFooter.jsx
  data/
    content.js
  hooks/
    useMouseRipple.js
    useScrollProgress.js
  pages/
    AboutRamadan.jsx
    Celebration.jsx
    Home.jsx
    Worship.jsx
  three/
    CrescentMoon.jsx
    LanternSystem.jsx
    MosqueEnvironment.jsx
    StarField.jsx
    WaterReflection.jsx
    shaders/
      waterShader.js
  App.jsx
  index.css
  main.jsx
index.html
postcss.config.js
tailwind.config.js
```

## Highlights

- Cinematic fullscreen hero with crescent moon, floating lanterns, star field, and mosque silhouette.
- Multi-page educational storytelling flow for first-time Ramadan visitors.
- Framer Motion reveals, staggered cards, and subtle parallax motion.
- Sticky reflective water footer with custom GLSL wave displacement, Fresnel glow, shimmer, and mouse-driven ripple distortion.
- Tailwind-driven layout with custom CSS only where it improves complex visual layering.

## Notes

- The water shader uses a multi-sine displacement field and a cursor-driven ripple ring to simulate calm interactive water.
- The site is intentionally art-directed toward a dark, elegant, moonlit mood rather than a generic corporate layout.
- If you want even more realism, the next upgrade would be postprocessing bloom and a higher-end reflection pass.
