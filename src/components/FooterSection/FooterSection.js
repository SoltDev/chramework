import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import reactHtmlParser from 'react-html-parser';

import SocialNetworks from '../SocialNetworks/SocialNetworks.js';
import Button from '../Button/Button';
import Copyright from '../Copyright/Copyright.js';
import moscow from '../../assets/contacts/moscow.svg';
import rostov from '../../assets/contacts/rostov.svg';

import './FooterSection.styl';
import defaultData from './data.json';

const icons = {
	moscow,
	rostov
};

const socials = {
	facebook: 'https://www.facebook.com/OlegChulakovStudio/',
	vkontakte: 'https://vk.com/olegchulakovstudio',
	instagram: 'https://www.instagram.com/chulakov.ru/'
};

const FooterSection = ({ text, light, offsetLeft, offsetRight, email, className, showButton, data, ...rest }) => {
	const blockStyle = classNames('FooterSection', className, {
		'FooterSection--light': light,
		'FooterSection--offsetLeft': offsetLeft,
		'FooterSection--offsetRight': offsetRight,
	});
	const currentData = data || defaultData;
	return (
		<div {...rest} className={blockStyle}>
			<div className="FooterSection__container">
				<div className="FooterSection__top">
					<div className="FooterSection__top-title">{reactHtmlParser(currentData.mainTitle || text)}</div>
					<a href={`mailto:${currentData.email || email}`} className="FooterSection__top-link">
						{currentData.email || email}
					</a>
				</div>
				<div className="FooterSection__content">
					<div className="FooterSection__info">
						{currentData.adresses.map((item, i) => {
							const key = `footerItem${i}`;
							const Icon = icons[item.icon];
							const iconStyle = classNames('FooterSection__icon', {
								[`FooterSection__icon--${item.mod}`]: item.mod,
							});

							return (
								<div key={key} className="FooterSection__content-item">
									<div className="FooterSection__content-head">
										<div className={iconStyle}>
											<Icon />
										</div>
										<div className="FooterSection__content-title">
											{reactHtmlParser(item.title)}
										</div>
									</div>
									<div className="FooterSection__content-address">
										{reactHtmlParser(item.address)}
									</div>
									<a
										href={`tel:${item.tel}`}
										className="FooterSection__content-phone">
										{reactHtmlParser(item.phone)}
									</a>
								</div>
							);
						})}
					</div>
					{showButton && <div className="FooterSection__feedback">
						<Button
							uppercase
							text={currentData.buttonText || `Заполнить бриф`}
							{...showButton}
							className="FooterSection__feedback-button"
						/>
					</div>}
				</div>
				<div className="FooterSection__bottom">
					<div className="FooterSection__copyright">
						<Copyright text={currentData.copyright} />
					</div>
					<SocialNetworks data={currentData.socials || socials} mod="white" />
				</div>
			</div>
		</div>
	);
};

FooterSection.defaultProps = {
	data: undefined,
	text: 'Оставьте заявку',
	email: 'hello@chulakov.ru',
};

FooterSection.propTypes = {
	text: PropTypes.string,
	light: PropTypes.bool,
	offsetLeft: PropTypes.bool,
	offsetRight: PropTypes.bool,
	showButton: PropTypes.object,
	email: PropTypes.string,
	data: PropTypes.object,
};

export default FooterSection;
