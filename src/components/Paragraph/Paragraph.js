import React, { Component } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import './style.styl';

export default class Paragraph extends Component {
	static propTypes = {
		TagName: PropTypes.string,
		mod: PropTypes.string.isRequired,
		Paragraph: PropTypes.string,
		className: PropTypes.string,
		children: PropTypes.any,
	}
	static defaultProps = {
		TagName: 'p'
	}
	render() {
		const {
			TagName,
			mod,
			className,
			children,
			...rest
		} = this.props;

		const paragraphStyle = classNames('Paragraph', className, {
			[`Paragraph_${mod}`]: mod,
		});

		return (
			<TagName {...rest} className={paragraphStyle}>{children}</TagName>
		);
	}
}
