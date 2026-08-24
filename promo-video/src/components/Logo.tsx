import React from 'react';
import {colors, LOGO_PATH} from '../theme';
import {fontFamily} from '../fonts';

export const LogoMark: React.FC<{size: number}> = ({size}) => (
	<svg
		width={size}
		height={(size * 46) / 48}
		viewBox="0 0 48 46"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<path d={LOGO_PATH} fill={colors.brand} />
	</svg>
);

export const Wordmark: React.FC<{fontSize: number; color?: string}> = ({
	fontSize,
	color = colors.text,
}) => (
	<span
		style={{
			fontFamily,
			fontSize,
			fontWeight: 800,
			color,
			letterSpacing: -1,
		}}
	>
		Prequel
	</span>
);
