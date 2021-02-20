import { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'dva';
import { Spin } from 'antd';
import VisualDetail from './VisualDetail/VisualDetail';
import VisualControl from './VisualControl/VisualControl';
import VisualZoom from './VisualZoom/VisualZoom';
import imgSrc from '@/assets/visualMapUpImg.png';
import styles from './VisualMapConfig.less';

const ownAddEventListener = (scope, type, handler, capture) => {
  scope.addEventListener(type, handler, capture);
  return () => {
    scope.removeEventListener(type, handler, capture);
  };
};

@connect(state => ({
  fullScreenState: state.visualState.fullScreenState,
  isShowUpBackground: state.visualState.isShowUpBackground,
  visualLoading: state.visualState.visualLoading,
}))

class VisualMapConfig extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  setHoverInfo = (options) => {
    let { type, PNodeAry, layer } = options;
    let hoverInfo = this.refs.hoverInfo;
    if (type === 'move') {
      let { offsetHeight, offsetWidth } = hoverInfo;
      let topValue = layer.y - offsetHeight - 10 <= 0 ? layer.y + 10 : layer.y - offsetHeight - 10;
      let leftValue = layer.x - offsetWidth - 10 <= 0 ? layer.x + 10 : layer.x - offsetWidth - 10;
      hoverInfo.style.left = `${leftValue}px`;
      hoverInfo.style.top = `${topValue}px`;
    } else if (type === 'show') {
      let PNode = PNodeAry.join('');
      hoverInfo.innerHTML = PNode;
      hoverInfo.style.opacity = 1;
    } else {
      hoverInfo.style.opacity = 0;
      hoverInfo.innerHTML = '';
    }
  };

  render() {
    const { isShowUpBackground, fullScreenState, visualLoading } = this.props;
    const visualControlProps = {
      ownAddEventListener: ownAddEventListener,
    };

    const visualDetailProps = {
      setHoverInfo: this.setHoverInfo,
      ownAddEventListener: ownAddEventListener,
    };

    const visualZoomProps = {};

    const UpBackground = (
      <div className="upBackground">
        <img src={imgSrc} alt=""/>
        <p>
          <FormattedMessage id="visual.upload.image"/> {/* lang: 上传一张底图（大于800*600px，支持jpg、png格式） */}
        </p>
      </div>
    );
    return (
      <div className={`${styles.visualmap} ${fullScreenState ? styles.fullScreen : ''}`}>
        <div className="hoverInfo" ref="hoverInfo"></div>
        {!isShowUpBackground && UpBackground}
        <VisualControl {...visualControlProps}/>
        <Spin spinning={visualLoading}>
          <VisualDetail {...visualDetailProps}/>
        </Spin>
        <VisualZoom {...visualZoomProps}/>
      </div>
    );
  }
}

export default VisualMapConfig;
