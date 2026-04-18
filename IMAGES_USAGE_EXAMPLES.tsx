/**
 * Image References Quick Start Guide
 * Copy-paste examples for common use cases
 */

// ============================================
// EXAMPLE 1: Simple Image Display
// ============================================
import { PROJECT_IMAGES } from '@/constants/imagePaths';

export function SimpleImageExample() {
  return (
    <div>
      <img 
        src={PROJECT_IMAGES.bicMosque.real} 
        alt="BIC Mosque - Real Photography"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
    </div>
  );
}

// ============================================
// EXAMPLE 2: Image Gallery
// ============================================
export function ImageGallery() {
  const bicMosqueImages = [
    { src: PROJECT_IMAGES.bicMosque.real, alt: 'Real Photography' },
    { src: PROJECT_IMAGES.bicMosque.revit, alt: 'Revit Model' },
    { src: PROJECT_IMAGES.bicMosque.site, alt: 'Site Plan' },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {bicMosqueImages.map((img) => (
        <img 
          key={img.alt}
          src={img.src} 
          alt={img.alt}
          className="w-full h-auto rounded-lg"
        />
      ))}
    </div>
  );
}

// ============================================
// EXAMPLE 3: Video Embedding
// ============================================
export function VideoPlayer() {
  return (
    <video 
      src={PROJECT_IMAGES.ceb.video}
      controls
      width="100%"
      height="auto"
      style={{ maxWidth: '600px' }}
    >
      Your browser does not support the video tag.
    </video>
  );
}

// ============================================
// EXAMPLE 4: Dynamic Project Showcase
// ============================================
interface ProjectItem {
  category: 'bicMosque' | 'ceb';
  title: string;
  images: string[];
}

export function ProjectShowcase({ project }: { project: ProjectItem }) {
  const projectMap = {
    bicMosque: PROJECT_IMAGES.bicMosque,
    ceb: PROJECT_IMAGES.ceb,
  };

  const images = projectMap[project.category];

  return (
    <div className="project-card">
      <h2>{project.title}</h2>
      <div className="image-gallery">
        {project.images.map((imgKey) => (
          <img
            key={imgKey}
            src={images[imgKey as keyof typeof images] as string}
            alt={`${project.title} - ${imgKey}`}
            className="project-image"
          />
        ))}
      </div>
    </div>
  );
}

// ============================================
// EXAMPLE 5: Lazy Loading with Intersection Observer
// ============================================
import { useEffect, useRef, useState } from 'react';

export function LazyImage({ src, alt }: { src: string; alt: string }) {
  const [isVisible, setIsVisible] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <img
      ref={imgRef}
      src={isVisible ? src : 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/%3E'}
      alt={alt}
      className="lazy-image"
    />
  );
}

// ============================================
// EXAMPLE 6: Responsive Image with srcset
// ============================================
export function ResponsiveImage() {
  return (
    <picture>
      <source 
        srcSet={PROJECT_IMAGES.ceb.living}
        media="(max-width: 600px)"
      />
      <source 
        srcSet={PROJECT_IMAGES.ceb.totalView}
        media="(max-width: 1200px)"
      />
      <img 
        src={PROJECT_IMAGES.ceb.totalView} 
        alt="CEB Project Overview"
      />
    </picture>
  );
}

// ============================================
// EXAMPLE 7: Using in a Component with Props
// ============================================
interface ImageCardProps {
  imageKey: keyof typeof PROJECT_IMAGES.ceb;
  title: string;
  description: string;
}

export function ImageCard({ imageKey, title, description }: ImageCardProps) {
  return (
    <div className="card">
      <img 
        src={PROJECT_IMAGES.ceb[imageKey] as string}
        alt={title}
        className="card-image"
      />
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

// ============================================
// AVAILABLE IMAGES REFERENCE
// ============================================

/*
BIC MOSQUE IMAGES:
- PROJECT_IMAGES.bicMosque.real      - Real photography
- PROJECT_IMAGES.bicMosque.revit     - Revit model
- PROJECT_IMAGES.bicMosque.site      - Site plan

CEB IMAGES:
- PROJECT_IMAGES.ceb.video           - Video file
- PROJECT_IMAGES.ceb.envelope        - Building envelope
- PROJECT_IMAGES.ceb.green           - Green features
- PROJECT_IMAGES.ceb.house           - House design
- PROJECT_IMAGES.ceb.isometric       - Isometric rendering
- PROJECT_IMAGES.ceb.living          - Living space
- PROJECT_IMAGES.ceb.outside         - Exterior view
- PROJECT_IMAGES.ceb.multiUnit       - Multi-unit development
- PROJECT_IMAGES.ceb.solar           - Solar panels
- PROJECT_IMAGES.ceb.totalView       - Full overview
- PROJECT_IMAGES.ceb.wallExterior    - Wall detail
- PROJECT_IMAGES.ceb.redGray         - Alternative color scheme

OTHER:
- PROJECT_IMAGES.hydroRender         - Hydropower rendering
*/
