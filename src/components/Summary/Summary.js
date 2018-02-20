import React from 'react';
import classNames from 'classnames';
import './Summary.styl';
import Paragraph from '../Paragraph/Paragraph';
import medal2 from './medal_2.png';
import medal8 from './medal_8.png';
import PropTypes from 'prop-types';
import Link from '../Link/Link';

const production = {
	external: { href: 'https://chulakov.ru/life/top8'},
	internal: {to: { pathname: '/life/top8', fromHome: true }}
}
const design = {
	external: {href: 'https://chulakov.ru/life/top2'},
	internal: {to: { pathname: '/life/top2', fromHome: true }}
}

const Summary = ({ awards, className, external, ...rest }) => {
	const blockStyle = classNames(['Summary', className]);

	const productionLink = external ? production.external : production.internal;
	const designLink = external ? design.external : design.internal;

	return (
		<div {...rest} className={blockStyle}>
			{!awards && <div className="Summary__item Summary__item_counter" key="counter1">
				<div className="Summary__number">70</div>
				<Paragraph mod="boldMedium" className="Summary__title">специалистов</Paragraph>
			</div>}
			{!awards && <div className="Summary__item Summary__item_counter" key="counter2">
				<div className="Summary__number">9</div>
				<div className="Summary__title">
					<Paragraph mod="boldMedium">лет опыта</Paragraph>
				</div>
			</div>}
			<div className="Summary__item Summary__item_medal">
				<img className="Summary__img" src={medal2} alt="" />
				<div className="Summary__content">
					<Paragraph mod="boldMedium" className="Summary__title">Топ-2 <nobr>дизайн-студий</nobr></Paragraph>
					<Paragraph mod="bodySmall" className="Summary__text">
						в&nbsp;digital по&nbsp;версии{' '}
						<Link
							{...designLink}
							className="Summary__text-link">
							Tagline
						</Link>
					</Paragraph>
				</div>
			</div>
			<div className="Summary__item Summary__item_medal">
				<img className="Summary__img" src={medal8} alt="" />
				<div className="Summary__content">
					<Paragraph mod="boldMedium" className="Summary__title">Топ-8 <nobr>digital production</nobr></Paragraph>
					<Paragraph mod="bodySmall" className="Summary__text">
						по версии{' '}
						<Link
							{...productionLink}
							className="Summary__text-link">
							Tagline
						</Link>
					</Paragraph>
				</div>
			</div>
		</div>
	);
};
Summary.defaultProps = {
	awards: undefined,
	external: undefined
};
Summary.propTypes = {
	awards: PropTypes.bool,
	external: PropTypes.bool
};

export default Summary;