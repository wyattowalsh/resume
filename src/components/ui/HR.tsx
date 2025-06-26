import { cn } from '@/lib/utils';
import React from 'react';

type HRProps = {
	icon?: React.ReactNode;
	className?: string;
};

export function HR({ icon, className }: HRProps) {
	return (
		<div className={cn('relative mt-1.5 mb-0.5 	flex items-center', className)}>
			<div className="h-px flex-grow bg-gradient-to-r from-transparent to-border" />
			{icon && (
				<span className="mx-4 flex-shrink-0 text-primary">
					{React.cloneElement(icon as React.ReactElement, {
						className: 'h-4 w-4 opacity-33',
					})}
				</span>
			)}
			<div className="h-px flex-grow bg-gradient-to-l from-transparent to-border" />
		</div>
	);
} 