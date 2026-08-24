import React from 'react';
import {colors} from '../theme';

export const ProgressSteps: React.FC<{
	progress: number; // 0..1
	total?: number;
	width?: number;
}> = ({progress, total = 11, width = 860}) => {
	const filledCount = progress * total;
	const gap = 6;
	const segW = (width - gap * (total - 1)) / total;

	return (
		<div style={{display: 'flex', gap, width}}>
			{Array.from({length: total}).map((_, i) => {
				const fill = Math.max(0, Math.min(1, filledCount - i));
				return (
					<div
						key={i}
						style={{
							position: 'relative',
							width: segW,
							height: 8,
							borderRadius: 4,
							background: colors.border,
							overflow: 'hidden',
						}}
					>
						<div
							style={{
								position: 'absolute',
								left: 0,
								top: 0,
								bottom: 0,
								width: `${fill * 100}%`,
								background: colors.accent,
								borderRadius: 4,
							}}
						/>
					</div>
				);
			})}
		</div>
	);
};
