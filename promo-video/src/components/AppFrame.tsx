import React from 'react';
import {colors} from '../theme';
import {fontFamily} from '../fonts';

export const AppFrame: React.FC<{
	title: string;
	width: number;
	height: number;
	children: React.ReactNode;
}> = ({title, width, height, children}) => (
	<div
		style={{
			width,
			height,
			borderRadius: 24,
			background: colors.bg,
			border: `1px solid ${colors.border}`,
			boxShadow: '0 30px 80px rgba(28,31,38,0.14)',
			overflow: 'hidden',
			display: 'flex',
			flexDirection: 'column',
		}}
	>
		<div
			style={{
				height: 52,
				flexShrink: 0,
				display: 'flex',
				alignItems: 'center',
				gap: 16,
				padding: '0 22px',
				background: colors.surface,
				borderBottom: `1px solid ${colors.border}`,
			}}
		>
			<div style={{display: 'flex', gap: 8}}>
				{[colors.red, colors.amber, colors.green].map((c) => (
					<div
						key={c}
						style={{
							width: 12,
							height: 12,
							borderRadius: '50%',
							background: c,
							opacity: 0.55,
						}}
					/>
				))}
			</div>
			<div
				style={{
					fontFamily,
					fontSize: 16,
					fontWeight: 600,
					color: colors.textMuted,
				}}
			>
				{title}
			</div>
		</div>
		<div style={{flex: 1, minHeight: 0, position: 'relative'}}>{children}</div>
	</div>
);
