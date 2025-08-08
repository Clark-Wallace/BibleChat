# Illuminated Sanctuary Style Guide

## Design Philosophy
The Illuminated Sanctuary theme creates a divine digital space that feels both sacred and welcoming. Inspired by cathedral stained glass, divine light, and spiritual illumination, this design system brings heavenly atmosphere to modern interface.

## Color Palette

### Primary Colors
```css
--primary-gold: #ffd700;
--primary-gold-light: #ffed4e;
--primary-purple: #8a2be2;
--primary-blue: #1e90ff;
```

### Background Gradients
```css
--bg-dark: linear-gradient(180deg, #0a0a0f 0%, #0f0f19 100%);
--bg-sanctuary: linear-gradient(180deg, rgba(10, 10, 15, 0.98) 0%, rgba(15, 15, 25, 0.98) 100%);
--bg-divine-glow: radial-gradient(circle at center, rgba(255, 215, 0, 0.1), transparent);
```

### Stained Glass Effects
```css
--stained-glass: 
  radial-gradient(circle at 20% 30%, rgba(138, 43, 226, 0.15) 0%, transparent 50%),
  radial-gradient(circle at 80% 70%, rgba(255, 215, 0, 0.15) 0%, transparent 50%),
  radial-gradient(circle at 50% 50%, rgba(30, 144, 255, 0.1) 0%, transparent 70%);
```

### Text Colors
```css
--text-divine: #ffd700;
--text-holy: rgba(255, 223, 186, 0.9);
--text-scripture: rgba(200, 200, 255, 0.7);
--text-light: rgba(255, 255, 255, 0.9);
```

### Border & Accent Colors
```css
--border-divine: linear-gradient(180deg, rgba(255, 215, 0, 0.3), rgba(138, 43, 226, 0.3), rgba(30, 144, 255, 0.3));
--border-gold: rgba(255, 215, 0, 0.3);
--glow-gold: 0 0 20px rgba(255, 215, 0, 0.5);
--glow-purple: 0 0 30px rgba(138, 43, 226, 0.3);
```

## Typography

### Font Stack
```css
--font-primary: 'Georgia', -apple-system, 'Segoe UI', serif;
--font-secondary: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

### Font Sizes
```css
--fs-xxl: 28px;   /* Main titles */
--fs-xl: 24px;    /* Section headers */
--fs-lg: 18px;    /* Subheaders */
--fs-md: 15px;    /* Body text */
--fs-sm: 13px;    /* Secondary text */
--fs-xs: 11px;    /* Meta text */
```

### Font Weights
```css
--fw-light: 300;
--fw-regular: 400;
--fw-medium: 500;
--fw-semibold: 600;
--fw-bold: 700;
```

## Spacing System

```css
--space-xs: 4px;
--space-sm: 8px;
--space-md: 12px;
--space-lg: 20px;
--space-xl: 30px;
--space-xxl: 40px;
```

## Component Patterns

### Cards & Containers
```css
.divine-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0.01));
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.illuminated-container {
  background: linear-gradient(180deg, rgba(10, 10, 15, 0.98), rgba(15, 15, 25, 0.98));
  border: 2px solid;
  border-image: var(--border-divine) 1;
}
```

### Buttons
```css
.btn-divine {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 193, 7, 0.2));
  border: 1px solid rgba(255, 215, 0, 0.4);
  color: #ffd700;
  padding: 10px 20px;
  border-radius: 8px;
  transition: all 0.3s;
  cursor: pointer;
}

.btn-divine:hover {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.3), rgba(255, 193, 7, 0.3));
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
  transform: translateY(-2px);
}

.btn-primary {
  background: linear-gradient(135deg, #ffd700, #ffb300);
  color: #1a1a2e;
  font-weight: 600;
}
```

### Input Fields
```css
.input-divine {
  background: linear-gradient(135deg, rgba(138, 43, 226, 0.05), rgba(30, 144, 255, 0.05));
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 12px;
  padding: 12px 15px;
  color: rgba(255, 255, 255, 0.9);
  transition: all 0.3s;
}

.input-divine:focus {
  background: linear-gradient(135deg, rgba(138, 43, 226, 0.1), rgba(30, 144, 255, 0.1));
  box-shadow: 0 0 30px rgba(255, 215, 0, 0.2);
  outline: none;
}
```

## Animations

### Divine Light Ray
```css
@keyframes rayMove {
  0% { transform: translateY(-100%) rotate(15deg); }
  100% { transform: translateY(100%) rotate(15deg); }
}

.light-ray {
  position: absolute;
  width: 2px;
  height: 300%;
  background: linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.1), transparent);
  animation: rayMove 20s linear infinite;
}
```

### Holy Glow
```css
@keyframes glow {
  0%, 100% { filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.5)); }
  50% { filter: drop-shadow(0 0 30px rgba(255, 215, 0, 0.8)); }
}

.holy-glow {
  animation: glow 3s ease-in-out infinite;
}
```

### Fade In Illumination
```css
@keyframes fadeInIlluminate {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.divine-message {
  animation: fadeInIlluminate 0.5s ease-out;
}
```

### Rotating Halo
```css
@keyframes rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.halo {
  animation: rotate 10s linear infinite;
}
```

## Layout Principles

### Sacred Geometry
- Use golden ratio (1.618) for proportions
- Centered, symmetrical layouts for important elements
- Vertical hierarchy emphasizing ascension

### Visual Hierarchy
1. Divine headers with gold gradient text
2. Section dividers with ornate separators
3. Content cards with subtle illumination
4. Meta information in scripture blue

### Responsive Breakpoints
```css
--mobile: 480px;
--tablet: 768px;
--desktop: 1024px;
--wide: 1440px;
```

## Icon System

### Spiritual Emojis
- ✝️ Cross - Main identity
- 🕊️ Dove - Peace, Holy Spirit
- ⛪ Church - Community
- 🙏 Praying hands - Prayer
- ✨ Sparkles - Divine presence
- 📖 Book - Scripture
- 🕯️ Candle - Prayer/vigil
- 💫 Star - Guidance
- 🌟 Glowing star - Praise
- ⚜️ Fleur-de-lis - Trinity

## Special Effects

### Stained Glass Background
```css
.stained-glass-bg {
  background: 
    radial-gradient(circle at 20% 30%, rgba(138, 43, 226, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(255, 215, 0, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, rgba(30, 144, 255, 0.1) 0%, transparent 70%);
  animation: shimmer 30s ease-in-out infinite;
}
```

### Divine Border
```css
.divine-border {
  border: 2px solid;
  border-image: linear-gradient(180deg, 
    rgba(255, 215, 0, 0.3), 
    rgba(138, 43, 226, 0.3), 
    rgba(30, 144, 255, 0.3)) 1;
}
```

### Prayer Card
```css
.prayer-card {
  background: linear-gradient(135deg, rgba(255, 152, 0, 0.1), rgba(255, 193, 7, 0.05));
  border: 1px solid rgba(255, 152, 0, 0.3);
  border-radius: 8px;
  padding: 15px;
  position: relative;
  overflow: hidden;
}

.prayer-card::before {
  content: '🕊️';
  position: absolute;
  top: -20px;
  right: -20px;
  font-size: 80px;
  opacity: 0.1;
  transform: rotate(-15deg);
}
```

## Implementation Notes

### Performance
- Use CSS variables for all colors
- Implement animations with `will-change` property
- Lazy load heavy effects on mobile
- Use `backdrop-filter` sparingly

### Accessibility
- Ensure contrast ratio of 4.5:1 for normal text
- Provide focus states for all interactive elements
- Include aria-labels for decorative elements
- Respect prefers-reduced-motion

### Cross-browser Support
- Fallbacks for backdrop-filter
- Vendor prefixes for gradients
- Test stained glass effects in all browsers