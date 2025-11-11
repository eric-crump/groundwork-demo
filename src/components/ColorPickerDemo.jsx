"use client";

/**
 * ColorPickerDemo Component
 * Displays "Underline" text with customizable colors from color picker fields
 * 
 * @param {Object} props.colors - Color values from Contentstack
 * @param {Object} props.colors.background_color - Background color (hex, r, g, b)
 * @param {Object} props.colors.line_color - Underline color (hex, r, g, b)
 * @param {Object} props.colors.text_color - Text color (hex, r, g, b)
 */
export default function ColorPickerDemo({ colors }) {
  // Extract color values with fallbacks
  const backgroundColor = colors?.background_color?.hex || '#1A1A1A';
  const lineColor = colors?.line_color?.hex || '#3A8FFF';
  const textColor = colors?.text_color?.hex || '#FFFFFF';

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
          style={{ color: textColor }}
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

