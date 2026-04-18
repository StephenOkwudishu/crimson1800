# Project Images Management

## Overview
Project images have been downloaded from Google Cloud Storage (`gs://portfoliopics/projects/`) and organized in the `public/projects/` directory for proper serving with the application.

## Directory Structure

```
public/projects/
├── bicmosquepics/
│   ├── real.png          - Real-world photography
│   ├── revit.png         - Revit architectural model
│   └── site.png          - Site plan
├── ceb/
│   ├── cebvideo.mp4      - Video asset
│   ├── envelopeceb.png   - Building envelope visualization
│   ├── greenceb.png      - Green/sustainable features
│   ├── houseceb.png      - House design
│   ├── isometric/        - Isometric renderings
│   ├── livingceb.png     - Living space design
│   ├── multiunitceb.png  - Multi-unit development
│   ├── outside.png       - Exterior view
│   ├── redgrayceb.png    - Alternative color scheme
│   ├── solar.png         - Solar panels visualization
│   ├── totalview.png     - Comprehensive view
│   └── wallexterior.png  - Wall exterior detail
└── hydrorender           - Hydropower rendering asset
```

## Usage in React Components

### Method 1: Using Constants
Import the `PROJECT_IMAGES` constant for type-safe image references:

```tsx
import { PROJECT_IMAGES } from '@/constants/imagePaths';

export function ProjectShowcase() {
  return (
    <div>
      <img src={PROJECT_IMAGES.bicMosque.real} alt="BIC Mosque" />
      <img src={PROJECT_IMAGES.ceb.living} alt="CEB Living Room" />
      <video src={PROJECT_IMAGES.ceb.video} controls />
    </div>
  );
}
```

### Method 2: Using Helper Function
Use the `getImagePath()` helper for dynamic image selection:

```tsx
import { getImagePath } from '@/constants/imagePaths';

export function DynamicImage({ project, image }: Props) {
  return (
    <img 
      src={getImagePath(project, image)} 
      alt={`${project} - ${image}`}
    />
  );
}
```

### Method 3: Direct Path
For simple cases, reference directly (less type-safe):

```tsx
<img src="/crimson1800/projects/bicmosquepics/real.png" alt="BIC Mosque" />
```

## Important Notes

### GitHub Pages Path
Since the app is deployed to `https://stephenokwudishu.github.io/crimson1800/`:
- All image paths include the `/crimson1800/` base URL
- This is handled automatically by the Vite config's `base` property
- **Do NOT** use relative paths like `./public/projects/...`

### Vite Configuration
The `vite.config.ts` includes:
```typescript
export default defineConfig({
  base: "/crimson1800/",
  // ... other config
});
```

This ensures:
- All assets are resolved relative to `/crimson1800/`
- Images are correctly served on GitHub Pages
- Works in both development and production

### Static Asset Serving
- Images in `public/` are served as-is (not bundled)
- They're available at their path from the root: `/crimson1800/projects/...`
- No import/require needed for images in `public/`

## Adding New Images

1. **Download**: Get images from Google Cloud Storage:
   ```bash
   gsutil -m cp -r "gs://portfoliopics/projects" .
   ```

2. **Organize**: Place files in appropriate subdirectories under `public/projects/`

3. **Document**: Update `src/constants/imagePaths.ts` with new image references

4. **Use**: Import from constants and reference in components

## Performance Considerations

- **Video files**: Consider lazy loading with `loading="lazy"` attribute
- **Large images**: Use responsive images with `<picture>` or `srcset`
- **Compression**: Ensure images are optimized before deployment
- **CDN**: GitHub Pages serves from CDN automatically

## Deployment Notes

- Images are included in the `dist/` folder after build
- GitHub Pages hosts from the `gh-pages` branch
- Deployment workflow automatically handles image inclusion
- No additional configuration needed beyond the base URL setup

## Troubleshooting

### Images not loading?
1. Check browser DevTools → Network tab
2. Verify full path: `https://stephenokwudishu.github.io/crimson1800/projects/...`
3. Ensure `vite.config.ts` has `base: "/crimson1800/"`
4. Clear browser cache and rebuild

### Local development (npm run dev)?
- Images load from `/crimson1800/projects/...` automatically
- Vite dev server respects the base URL
- No special configuration needed

### Build errors?
- Ensure `public/projects/` exists
- Check file permissions: `chmod -R 755 public/projects/`
- Run `bun run build` to verify build process
