import React from 'react';
import {Composition} from 'remotion';
import {PrequelPromo, PREQUEL_PROMO_DURATION} from './PrequelPromo';
import {PrequelPromoV2, PREQUEL_PROMO_V2_DURATION} from './PrequelPromoV2';

export const Root: React.FC = () => {
	return (
		<>
			<Composition
				id="PrequelPromo"
				component={PrequelPromo}
				durationInFrames={PREQUEL_PROMO_DURATION}
				fps={30}
				width={1920}
				height={1080}
			/>
			<Composition
				id="PrequelPromoV2"
				component={PrequelPromoV2}
				durationInFrames={PREQUEL_PROMO_V2_DURATION}
				fps={30}
				width={1920}
				height={1080}
			/>
		</>
	);
};
