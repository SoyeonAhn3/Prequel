import React from 'react';
import {colorsV2} from '../theme2';
import {fontFamily} from '../fonts';
import {LogoBadgeV2, WordmarkV2} from './LogoV2';

// Floating app card whose header chrome mirrors the real Prequel product
// (logo + wordmark left, project title right) instead of a generic
// macOS-style traffic-light window.
export const AppShellV2: React.FC<{
	width: number;
	height: number;
	projectTitle: string;
	children: React.ReactNode;
}> = ({width, height, projectTitle, children}) => (
	<div
		style={{
			width,
			height,
			borderRadius: 20,
			background: colorsV2.bg,
			border: `1px solid ${colorsV2.border}`,
			boxShadow: '0 30px 80px rgba(20,22,40,0.16)',
			overflow: 'hidden',
			display: 'flex',
			flexDirection: 'column',
		}}
	>
		<div
			style={{
				height: 64,
				flexShrink: 0,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between',
				padding: '0 28px',
				background: colorsV2.surface,
				borderBottom: `1px solid ${colorsV2.border}`,
			}}
		>
			<div style={{display: 'flex', alignItems: 'center', gap: 12}}>
				<LogoBadgeV2 size={30} />
				<WordmarkV2 fontSize={20} />
			</div>
			<div
				style={{
					fontFamily,
					fontSize: 15,
					fontWeight: 600,
					color: colorsV2.inkMuted,
				}}
			>
				{projectTitle}
			</div>
		</div>
		<div style={{flex: 1, minHeight: 0, position: 'relative'}}>{children}</div>
	</div>
);
