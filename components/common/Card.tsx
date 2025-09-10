import React from 'react';

// The props for the Card component, extending standard HTML div attributes
// to allow passthrough of props like `onClick`, `className`, etc.
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

// Simplified the Card component to a standard functional component.
// The previous implementation used React.forwardRef, but this capability was not being
// utilized. Removing it simplifies the component and avoids potential module resolution
// issues that can arise from the "exotic" component type created by forwardRef.
const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
    return (
      <div
        // The `ref` is no longer needed or accepted here.
        className={`bg-light-card/80 dark:bg-dark-card/80 backdrop-blur-xl border border-white/10 dark:border-white/5 rounded-2xl shadow-lg transition-all duration-300 ${className}`}
        {...props}
      >
        {children}
      </div>
    );
};

export default Card;
