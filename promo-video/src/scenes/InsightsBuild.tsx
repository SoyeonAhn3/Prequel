import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {colors} from '../theme';
import {fontFamily} from '../fonts';
import {AppFrame} from '../components/AppFrame';
import {ChatBubble} from '../components/ChatBubble';
import {ProgressSteps} from '../components/ProgressSteps';
import {InsightRow} from '../components/InsightRow';

export const InsightsBuild: React.FC = () => {
	const frame = useCurrentFrame();

	const progress = interpolate(frame, [0, 165], [2 / 11, 6 / 11], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const captionOpacity = interpolate(frame, [4, 16], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<AbsoluteFill
			style={{background: colors.bg, alignItems: 'center', justifyContent: 'center'}}
		>
			<AppFrame title="Interview" width={1360} height={760}>
				<div style={{height: '100%', display: 'flex'}}>
					<div
						style={{
							flex: 1.35,
							padding: '36px 44px',
							display: 'flex',
							flexDirection: 'column',
							justifyContent: 'space-between',
							borderRight: `1px solid ${colors.border}`,
						}}
					>
						<div style={{display: 'flex', flexDirection: 'column', gap: 18}}>
							<ChatBubble
								role="ai"
								text="Who are your main users?"
								startFrame={0}
								framesPerChar={1.6}
								fontSize={26}
								maxWidth={620}
							/>
							<ChatBubble
								role="user"
								text="Recruiters and hiring managers."
								startFrame={50}
								fontSize={26}
								maxWidth={620}
							/>
							<ChatBubble
								role="ai"
								text="What's the core value?"
								startFrame={75}
								framesPerChar={1.6}
								fontSize={26}
								maxWidth={620}
							/>
							<ChatBubble
								role="user"
								text="Cut time-to-schedule by 70%."
								startFrame={118}
								fontSize={26}
								maxWidth={620}
							/>
						</div>
						<div
							style={{
								fontFamily,
								fontSize: 18,
								fontWeight: 600,
								color: colors.textMuted,
								opacity: captionOpacity,
							}}
						>
							Structured questions. No blank page.
						</div>
					</div>
					<div
						style={{
							flex: 1,
							padding: '36px 32px',
							display: 'flex',
							flexDirection: 'column',
							gap: 14,
							background: colors.surfaceAlt,
						}}
					>
						<div
							style={{
								fontFamily,
								fontSize: 15,
								fontWeight: 700,
								color: colors.textSubtle,
								textTransform: 'uppercase',
								letterSpacing: 0.6,
								marginBottom: 4,
							}}
						>
							Collected
						</div>
						<InsightRow label="Target users" value="Recruiters" startFrame={62} />
						<InsightRow
							label="Core value"
							value="Faster scheduling"
							startFrame={130}
						/>
						<InsightRow label="Tech stack" value="React + FastAPI" startFrame={150} />
					</div>
				</div>
				<div style={{position: 'absolute', left: 56, right: 56, bottom: 30}}>
					<ProgressSteps progress={progress} width={1248} />
				</div>
			</AppFrame>
		</AbsoluteFill>
	);
};
