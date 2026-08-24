import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {colors} from '../theme';
import {fontFamily} from '../fonts';
import {AppFrame} from '../components/AppFrame';
import {ChatBubble} from '../components/ChatBubble';
import {ProgressSteps} from '../components/ProgressSteps';

export const InterviewHook: React.FC = () => {
	const frame = useCurrentFrame();

	const progress = interpolate(frame, [20, 165], [1 / 11, 2 / 11], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const bottomCaptionOpacity = interpolate(frame, [110, 125], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<AbsoluteFill
			style={{background: colors.bg, alignItems: 'center', justifyContent: 'center'}}
		>
			<AppFrame title="Interview" width={1360} height={760}>
				<div
					style={{
						height: '100%',
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'space-between',
						padding: '40px 56px',
					}}
				>
					<div style={{display: 'flex', flexDirection: 'column', gap: 22, width: 920}}>
						<ChatBubble
							role="ai"
							text="What problem are you solving?"
							startFrame={10}
							framesPerChar={2.2}
						/>
						<ChatBubble
							role="user"
							text="Interview scheduling for recruiters."
							startFrame={95}
							maxWidth={700}
						/>
					</div>
					<div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
						<div
							style={{
								fontFamily,
								fontSize: 18,
								fontWeight: 600,
								color: colors.textMuted,
								opacity: bottomCaptionOpacity,
							}}
						>
							It interviews you — one focused question at a time.
						</div>
						<ProgressSteps progress={progress} width={1248} />
					</div>
				</div>
			</AppFrame>
		</AbsoluteFill>
	);
};
