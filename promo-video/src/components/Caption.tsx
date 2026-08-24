import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {colors} from '../theme';
import {fontFamily} from '../fonts';

export const Caption: React.FC<{
	text: string;
	sceneDuration: number;
	fontSize?: number;
	color?: string;
	weight?: number;
	align?: 'left' | 'center';
}> = ({
	text,
	sceneDuration,
	fontSize = 40,
	color = colors.text,
	weight = 700,
	align = 'left',
}) => {
	const frame = useCurrentFrame();
	const fadeIn = 12;
	const fadeOut = 12;

	const opacity = interpolate(
		frame,
		[0, fadeIn, sceneDuration - fadeOut, sceneDuration],
		[0, 1, 1, 0],
		{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
	);
	const translateY = interpolate(frame, [0, fadeIn], [14, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<div
			style={{
				fontFamily,
				fontSize,
				fontWeight: weight,
				color,
				letterSpacing: -0.5,
				lineHeight: 1.2,
				opacity,
				transform: `translateY(${translateY}px)`,
				textAlign: align,
			}}
		>
			{text}
		</div>
	);
};
