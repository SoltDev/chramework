import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { TweenMax, TimelineMax, Cubic } from 'gsap';
import Waypoint from 'react-waypoint';
import { isPhone, isPad, isIos, iosVersion, isAndroid, isMobile } from '../../utils/devices';
import { checkSpeed } from '../../utils/helpers';

import ShareBlock from './ShareBlock/ShareBlock';
import ChangeQuality from './ChangeQuality/ChangeQuality';
import PlayIcon from '../../assets/player/play.svg';

import './css.styl';
import './Player.styl';

let currentPlayer = null; // For pausing active player

// Calculate quality
let calculatedQuality = undefined;
const calculateQuality = new Promise((resolve, reject) => {
	if (typeof window !== 'undefined') {
		window.onload = () => {
			checkSpeed((speed) => {
				switch (true) {
					case speed > 400 && speed <= 1000:
						calculatedQuality = 'low';
						break;
					case speed > 1000:
						calculatedQuality = 'hight';
						break;
					default: break;
				}
				resolve(calculatedQuality);
			});
		}
	} else {
		resolve(isIos() ? 'mob' : 'hight');
	}
});

class PlayIconInject extends Component {
	render() {
		return ReactDOM.createPortal(<PlayIcon className="vjs-big-play-button__icon" />, this.props.renderNode);
	}
}
class Player extends Component {
	static defaultProps = {
		compact: false,
		fullhd: false,
		banners: false,
		theme: 'light',
		shareURL: undefined
	};
	static propTypes = {
		compact: PropTypes.bool,
		theme: PropTypes.string,
		fullhd: PropTypes.bool,
		banners: PropTypes.bool,
		images: PropTypes.object,
		src: PropTypes.object,
		shareURL: PropTypes.string
	};
	state = {
		isCollapsed: this.props.compact,
		compact: false,

		poster: undefined,
		hideInitPoster: false,
		hideVideo: false,

		qualityList: {},
		currentQuality: calculatedQuality || (isIos() ? 'mob' : 'hight'),

		playerConrolNode: null,
		renderedVideoNode: false,

		shareOpened: false,
		changeQualityOpened: false,
	};
	player = null;

	componentDidMount = () => {
		this.videojs = require('video.js');

		if (!calculatedQuality) {
			calculateQuality.then((typeQuality) => {
				if (this.player) {
					if (this.player.paused() && this.props.src && this.props.src[typeQuality]) {
						this.player.src(this.props.src[typeQuality]);
					}
				} else {
					this.setState({ currentQuality: typeQuality });
				}
			});
		}

		let posterSrc = '';
		if (typeof this.props.images === 'object') {
			const { posterMini, poster, thumb } = this.props.images;
			posterSrc = poster;

			if (isMobile() || !this.props.compact) {
				if (isPhone()) {
					posterSrc = posterMini || poster;
				}
			} else {
				posterSrc = thumb;
			}
		} else if (typeof this.props.images === 'string') {
			posterSrc = this.props.images;
		}
		this.setState({
			compact: !isPad() && this.props.compact,
			poster: posterSrc,
		}, () => {
			if (isAndroid()) this.initPlayer();
		});
	};

	getQualityLabel = key => {
		const names = {
			hight: '1080p',
			low: '720p',
			mob: '360p',
		};
		return names[key];
	};
	getQualityIndex = key => {
		const index = {
			hight: '3',
			low: '2',
			mob: '1',
		};
		return index[key];
	};

	componentWillUnmount() {
		if (this.player) {
			if (this.player === currentPlayer) {
				currentPlayer = null;
			}
			this.player.dispose();
		}
	}
	initPlayer = () => {
		const { src, banners } = this.props;

		this.player = this.videojs(this.video, {
			preload: 'none',
			autoPlay: false,
			controls: true,
			// poster: banners ? poster : undefined,
			loop: banners,
			sources: [{
				src: typeof src === 'object' ? src[this.state.currentQuality] : src,
				type: 'video/mp4',
			}],
			playsinline: banners ? 'playsinline' : undefined,
			nativeControlsForTouch: banners ? false : iosVersion() >= 11,
		}, () => {
			this._injectVolumeIcon();
			this._injectFullscreenIcon();
			// this._injectPlayerIcon();
		});
		if (isAndroid()) this.player.poster(this.state.poster);
		this.player.on('play', this.onPlay);

		this.videoJsBox = this.playerBox.getElementsByClassName('Player__video');
		const qualityList = {};
		if (src) {
			Object.keys(src).map(
				key => qualityList[this.getQualityIndex(key)] = {
					name: key,
					label: this.getQualityLabel(key),
				}
			);
		}
		this.setState({
			qualityList,
			playerConrolNode: this.playerBox.getElementsByClassName('vjs-control-bar')[0],
		});
	};

	changeQuality = (type) => {
		if (this.props.src[type]) {
			this.curentTime = this.player.currentTime();
			this.setState({ hideVideo: true, currentQuality: type }, () => {
				this.player.pause();
				this.player.src(this.props.src[type]);
				setTimeout(() => {
					this.player.load();
					this.player.currentTime(this.curentTime);
				}, 0);
				this.player.one('timeupdate', () => {
					this.player.play();
				});
				this.player.one('loadeddata', () => {
					this.player.currentTime(this.curentTime);
				});
			});
		}
	};

	hidePoster = () => {
		return TweenMax.to(this.poster, 0.2, { autoAlpha: 0 });
	};

	slideDown = () => {
		if (!this.state.isCollapsed) {
			this.hidePoster();
			return false;
		}

		this.setState({ isCollapsed: false });
		const ratio = this.props.fullhd ? (2.35 / 1) : (840 / 475);

		const timeline = new TimelineMax();

		timeline
			.set(this.videoJsBox, { opacity: 0 })
			.add(() => this.video.removeAttribute('poster'))
			.add(this.hidePoster())
			.to(this.playerBox, 0.3, {
				height: !isPad() ? this.playerBox.offsetWidth / ratio : undefined,
				ease: Cubic.easeOut,
			})
			.to(this.videoJsBox, 0.3, { opacity: 1 }, '-=0.3');

		return true;
	};
	slideUp = () => {
		if (this.state.isCollapsed) return false;

		this.setState({ isCollapsed: true });
		const collapsedRatio = 840 / 240;

		const timeline = new TimelineMax();
		timeline
			.to(this.video, 0.3, { opacity: 0 }, 0)
			.to(this.poster, 0.3, { opacity: 1 }, 0)
			.to(this.playerBox, 0.3, {
				height: this.playerBox.offsetWidth / collapsedRatio,
				ease: Cubic.easeOut,
			})
			.to(this.video, 0.3, { opacity: 1 });

		return true;
	};

	_addPath = (svg, index, d) => {
		const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		path.setAttributeNS(null, 'd', d);
		path.setAttributeNS(null, 'stroke', 'none');
		path.setAttributeNS(
			null,
			'class',
			`vjs-volume-panel__path vjs-volume-panel__path_${index}`,
		);
		svg.appendChild(path);
	};
	_addUse = (svg, d) => {
		const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
		use.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
		use.setAttribute('href', `#${d}-icon`);
		svg.appendChild(use);
	};
	_injectVolumeIcon = () => {
		const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		svg.setAttribute('width', '36');
		svg.setAttribute('height', '36');
		svg.setAttribute('class', 'vjs-volume-panel__icon');
		svg.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:xlink', 'http://www.w3.org/1999/xlink');
		const pathes = [
			'M8,21 L12,21 L17,26 L17,10 L12,15 L8,15 L8,21 Z',
			'M19,14 L19,22 C20.48,21.32 21.5,19.77 21.5,18 C21.5,16.26 20.48,14.74 19,14 Z',
			'M19,11.29 C21.89,12.15 24,14.83 24,18 C24,21.17 21.89,23.85 19,24.71 L19,26.77 C23.01,25.86 26,22.28 26,18 C26,13.72 23.01,10.14 19,9.23 L19,11.29 Z',
		];
		pathes.forEach((d, index) => {
			this._addPath(svg, index, d);
		});
		const $volume = this.playerBox.getElementsByClassName('vjs-mute-control');

		$volume[0].appendChild(svg);
	};
	_injectPlayerIcon = () => {
		const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		svg.setAttribute('width', '76');
		svg.setAttribute('height', '76');
		svg.setAttribute('viewBox', '0 0 76 76');
		svg.setAttribute('class', 'vjs-big-play-button__icon');
		svg.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:xlink', 'http://www.w3.org/1999/xlink');

		this._addUse(svg, 'play');
		const $play = this.playerBox.querySelectorAll('.Player__video .vjs-big-play-button');
		$play[0].appendChild(svg);
	};
	_addFullscreenIconDecor = ($icon, index) => {
		const decor = document.createElement('span', {
			className: `vjs-fullscreen-control__decor vjs-fullscreen-control__decor_${index}`,
		});
		decor.className = `vjs-fullscreen-control__decor vjs-fullscreen-control__decor_${index}`;
		$icon[0].appendChild(decor);
	};
	_injectFullscreenIcon = () => {
		const $fullscreen = this.playerBox.getElementsByClassName(
			'vjs-fullscreen-control',
		);
		for (let i = 1; i <= 4; i++) {
			this._addFullscreenIconDecor($fullscreen, i);
		}
	};


	initAndPlay = () => {
		this.setState({ renderedVideoNode: true }, () => {
			this.initPlayer();
			if (!isIos() && !isAndroid()) {
				setTimeout(() => {
					this.setState({ hideInitPoster: true });
					this.player.play();
				}, 10);
			}
		});
	};

	onPlay = () => {
		this.setState({ hideVideo: false });
		if (window.innerWidth > 768) this.slideDown();
		if (currentPlayer && currentPlayer !== this.player) {
			currentPlayer.pause();
		}
		currentPlayer = this.player;
	};

	// For desktop and iOS
	onClick = () => {
		if (!this.state.renderedVideoNode) {
			this.initAndPlay();
		} else {
			this.setState({ hideInitPoster: true });
			this.player.play();
		}
	};
	// For Waypoint
	onEnter = (e) => {
		this.timer = setTimeout(() => {
			this.initAndPlay();
		}, 300);
	};
	onLeave = () => {
		clearTimeout(this.timer);
	};

	isPosterShow = () => !isAndroid() && this.state.poster && !this.state.hideInitPoster;

	toggleShare = () => {
		this.setState({
			shareOpened: !this.state.shareOpened,
			changeQualityOpened: false,
		});
	};
	toggleChangeQuality = () => {
		this.setState({
			shareOpened: false,
			changeQualityOpened: !this.state.changeQualityOpened,
		});
	};

	noop = () => {};

	getPlayerBox = i => (this.playerBox = i);
	getPlayerNode = i => (this.video = i);
	getPosterNode = i => (this.poster = i);

	renderVideoNode = () => {
		if (!isAndroid()) {
			if (this.state.renderedVideoNode) return <video data-vjs-player ref={this.getPlayerNode} className="Player__video" />;
			return null;
		}
		return <video data-vjs-player ref={this.getPlayerNode} className="Player__video" />
	};

	renderPlayer = () => {
		const { theme, fullhd, banners, shareURL } = this.props;
		const playerStyle = classNames({
			Player: true,
			player: true,
			[`Player_theme_${theme}`]: theme,
			[`player_theme_${theme}`]: theme,
			Player_compact: this.state.compact,
			Player_banners: banners,
			Player_ios: iosVersion() >= 11,
			Player_fullhd: fullhd,
			Player_shrareOpened: this.state.shareOpened,
			Player_changeQualityOpened: this.state.changeQualityOpened,
			Player_hideVideo: this.state.hideVideo,
		});
		const posterStyle = classNames({
			Player__poster: true,
			Player__poster_hide: !this.isPosterShow(),
		});

		const setPoster = () => this.state.poster ? { backgroundImage: `url(${this.state.poster})` } : undefined;

		return (
			<div className={banners ? 'wrapper-player' : ''}>
				<div className={playerStyle} ref={this.getPlayerBox}>
					{!isAndroid() && (
						<div style={setPoster()} onClick={this.onClick} className={posterStyle} ref={this.getPosterNode}>
							<button className="vjs-big-play-button" type="button">
								<PlayIcon />
							</button>
						</div>
					)}
					{this.renderVideoNode()}

					{shareURL && (
						<ShareBlock
							url={shareURL}
							onClick={isIos() ? this.toggleShare : undefined}
							isOpened={this.state.shareOpened}
						/>
					)}

					{this.state.playerConrolNode &&
						Boolean(Object.keys(this.state.qualityList).length) && (
							<ChangeQuality
								qualityList={this.state.qualityList}
								renderNode={this.state.playerConrolNode}
								currentQuality={this.state.currentQuality}
								onChangeQuality={this.changeQuality}
								onClick={isIos() ? this.toggleChangeQuality : undefined}
								isOpened={this.state.changeQualityOpened}
							/>
					)}

					{this.state.playerConrolNode && isAndroid() &&
						<PlayIconInject renderNode={this.playerBox.getElementsByClassName('vjs-big-play-button')[0]} />
					}

				</div>
			</div>
		);
	};
	render() {
		return (isIos()) ? (
			<Waypoint
				onEnter={!this.state.renderedVideoNode ? this.onEnter : this.noop}
				onLeave={!this.state.renderedVideoNode ? this.onLeave : this.noop}
			>
				{this.renderPlayer()}
			</Waypoint>
		) : (
			this.renderPlayer()
		);
	}
}
export default Player;