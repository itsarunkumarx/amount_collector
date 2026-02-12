import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

export function Button({ className, variant = "primary", size = "default", isLoading, children, ...props }) {
    const variants = {
        primary: "bg-royal-gold text-royal-900 hover:bg-yellow-500 shadow-md font-bold",
        outline: "border-2 border-royal-gold text-royal-gold hover:bg-royal-gold/10",
        ghost: "text-royal-text hover:bg-royal-800",
        danger: "bg-red-600 text-white hover:bg-red-700"
    };

    const sizes = {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-12 px-8 text-lg"
    };

    return (
        <button
            className={cn(
                "inline-flex items-center justify-center rounded-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-royal-gold/50 disabled:opacity-50 disabled:pointer-events-none",
                variants[variant],
                sizes[size],
                className
            )}
            disabled={isLoading}
            {...props}
        >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {children}
        </button>
    );
}
