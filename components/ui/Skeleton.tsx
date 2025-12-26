import React from 'react';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'card' | 'circle' | 'chart';
    width?: string;
    height?: string;
    count?: number;
}

const baseClasses = 'animate-pulse bg-slate-700/50 rounded';

export const Skeleton: React.FC<SkeletonProps> = ({
    className = '',
    variant = 'text',
    width,
    height,
    count = 1,
}) => {
    const getVariantClasses = () => {
        switch (variant) {
            case 'text':
                return 'h-4 rounded';
            case 'card':
                return 'h-32 rounded-lg';
            case 'circle':
                return 'rounded-full aspect-square';
            case 'chart':
                return 'h-48 rounded-lg';
            default:
                return '';
        }
    };

    const style: React.CSSProperties = {};
    if (width) style.width = width;
    if (height) style.height = height;

    const items = Array.from({ length: count }, (_, i) => (
        <div
            key={i}
            className={`${baseClasses} ${getVariantClasses()} ${className}`}
            style={style}
        />
    ));

    if (count > 1) {
        return <div className="space-y-2">{items}</div>;
    }

    return items[0];
};

// Pre-built skeleton components for common use cases
export const TextSkeleton: React.FC<{ lines?: number }> = ({ lines = 3 }) => (
    <div className="space-y-2">
        {Array.from({ length: lines }, (_, i) => (
            <Skeleton
                key={i}
                variant="text"
                width={i === lines - 1 ? '60%' : '100%'}
            />
        ))}
    </div>
);

export const CardSkeleton: React.FC = () => (
    <div className="bg-slate-900/50 border border-cyan-400/20 rounded-lg p-6 space-y-4">
        <Skeleton variant="text" width="40%" height="24px" />
        <TextSkeleton lines={2} />
        <div className="flex gap-2 pt-2">
            <Skeleton variant="text" width="80px" height="32px" />
            <Skeleton variant="text" width="80px" height="32px" />
        </div>
    </div>
);

export const TableRowSkeleton: React.FC<{ columns?: number }> = ({ columns = 4 }) => (
    <div className="flex gap-4 py-3 border-b border-slate-700/50">
        {Array.from({ length: columns }, (_, i) => (
            <Skeleton
                key={i}
                variant="text"
                width={i === 0 ? '120px' : '80px'}
                height="16px"
            />
        ))}
    </div>
);

export const ChartSkeleton: React.FC = () => (
    <div className="space-y-4">
        <div className="flex justify-between">
            <Skeleton variant="text" width="120px" height="20px" />
            <Skeleton variant="text" width="80px" height="20px" />
        </div>
        <Skeleton variant="chart" />
    </div>
);

export const AvatarSkeleton: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-16 h-16',
    };
    return <Skeleton variant="circle" className={sizeClasses[size]} />;
};

export default Skeleton;
