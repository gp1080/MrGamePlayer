import React, { useState, useEffect } from 'react';

const GnomeMascot = ({ 
    size = 'medium', 
    color = 'brown', 
    animated = true, 
    position = 'static',
    onClick = null 
}) => {
    const [isAnimating, setIsAnimating] = useState(false);

    const sizeClasses = {
        small: 'w-8 h-8',
        medium: 'w-12 h-12',
        large: 'w-16 h-16',
        xl: 'w-20 h-20'
    };

    const colorClasses = {
        brown: 'bg-amber-800',
        green: 'bg-green-800',
        red: 'bg-red-800',
        purple: 'bg-purple-800',
        blue: 'bg-blue-800'
    };

    const positionClasses = {
        static: 'relative',
        fixed: 'fixed',
        absolute: 'absolute'
    };

    useEffect(() => {
        if (animated) {
            const interval = setInterval(() => {
                setIsAnimating(true);
                setTimeout(() => setIsAnimating(false), 1000);
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [animated]);

    const handleClick = () => {
        if (onClick) {
            onClick();
        }
    };

    return (
        <div 
            className={`${sizeClasses[size]} ${positionClasses[position]} cursor-pointer`}
            onClick={handleClick}
        >
            {/* Gnome Body */}
            <div className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full relative ${isAnimating ? 'animate-bounce' : ''}`}>
                {/* Gnome Head */}
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-yellow-200 rounded-full">
                    {/* Eyes */}
                    <div className="absolute top-1 left-1 w-1 h-1 bg-black rounded-full"></div>
                    <div className="absolute top-1 right-1 w-1 h-1 bg-black rounded-full"></div>
                    
                    {/* Nose */}
                    <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-pink-400 rounded-full"></div>
                    
                    {/* Mouth */}
                    <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-2 h-1 bg-black rounded-full"></div>
                </div>
                
                {/* Gnome Hat */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-6 border-l-transparent border-r-transparent border-b-red-600"></div>
                
                {/* Beard */}
                <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-4 h-3 bg-amber-600 rounded-full"></div>
                
                {/* Arms */}
                <div className="absolute top-1 left-0 w-2 h-1 bg-amber-800 rounded-full"></div>
                <div className="absolute top-1 right-0 w-2 h-1 bg-amber-800 rounded-full"></div>
                
                {/* Legs */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-2 bg-amber-800 rounded-full"></div>
                <div className="absolute bottom-0 left-1/2 transform translate-x-1/2 w-1 h-2 bg-amber-800 rounded-full"></div>
            </div>
        </div>
    );
};

export default GnomeMascot;
