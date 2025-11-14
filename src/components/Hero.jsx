"use client";

/**
 * Hero Component
 * Displays "Underline" text with customizable colors and font from color picker and font picker fields
 * 
 * @param {Object} props.colors - Color values from Contentstack
 * @param {Object} props.colors.background_color - Background color (hex, r, g, b)
 * @param {Object} props.colors.line_color - Underline color (hex, r, g, b)
 * @param {Object} props.colors.text_color - Text color (hex, r, g, b)
 * @param {Object} props.headline_font - Font configuration from Contentstack
 * @param {string} props.headline_font.fontFamily - Font family name or CSS variable
 */
export default function Hero({ colors, headline_font }) {
  // Extract color values with fallbacks
  const backgroundColor = colors?.background_color?.hex || '#1A1A1A';
  const lineColor = colors?.line_color?.hex || '#3A8FFF';
  const textColor = colors?.text_color?.hex || '#FFFFFF';
  
  // Map font family to CSS variable or use directly
  const getFontFamily = (fontFamily) => {
    if (!fontFamily) return 'Arial, sans-serif';
    
    // Map common font names to CSS variables
    const fontMap = {
      'Roboto': 'var(--font-roboto), Roboto, sans-serif',
      'Inter': 'var(--font-inter), Inter, sans-serif',
      'Noto Serif': 'var(--font-noto-serif), "Noto Serif", serif',
      'Noto_Serif': 'var(--font-noto-serif), "Noto Serif", serif',
      'Irish Grover': 'var(--font-irish-grover), "Irish Grover", cursive',
      'Irish_Grover': 'var(--font-irish-grover), "Irish Grover", cursive',
      'Schoolbell': 'var(--font-schoolbell), Schoolbell, cursive',
    };
    
    // Check if it's a CSS variable (starts with --)
    if (fontFamily.startsWith('--')) {
      return `var(${fontFamily}), sans-serif`;
    }
    
    // Check font map
    if (fontMap[fontFamily]) {
      return fontMap[fontFamily];
    }
    
    // Use as-is (could be a font name or CSS variable)
    return fontFamily;
  };
  
  const fontFamily = getFontFamily(headline_font?.fontFamily);

  return (
    <div 
      className="w-full rounded-lg p-12 flex flex-col items-center justify-center"
      style={{ 
        backgroundColor: backgroundColor,
        minHeight: '300px'
      }}
    >
      <div className="relative inline-block">
        {/* "Underline" Text */}
        <h1 
          className="text-6xl md:text-7xl font-bold tracking-tight leading-tight"
          style={{ 
            color: textColor,
            fontFamily: fontFamily
          }}
        >
          Underline
        </h1>
        
        {/* Underline Line - extends slightly beyond text */}
        <div 
          className="absolute -bottom-2 -left-2 -right-2"
          style={{ 
            height: '10px',
            backgroundColor: lineColor,
            borderRadius: '5px'
          }}
        />
      </div>
    </div>
  );
}

