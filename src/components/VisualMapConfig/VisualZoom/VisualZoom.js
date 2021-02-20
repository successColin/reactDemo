import { Component } from 'react';
import { InputNumber, Tooltip } from 'antd';
import { connect } from 'dva';
import CMessage from '@/components/common/BasicWidgets/Widgets/CMessage/CMessage';
import { BaseContext } from '@/constants/global';

@connect(state => ({
  canvasZoom: state.visualState.canvasZoom,
  allState: state.visualState, // model层中所有的数据
}))

class VisualZoom extends Component {
  static contextType = BaseContext;

  constructor(props) {
    super(props);
    this.state = {
      canvasZoom: parseInt(props.canvasZoom * 100),
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ canvasZoom: parseInt(nextProps.canvasZoom * 100) });
  }

  setVisualState(canvasZoom = 1) {
    const { dispatch } = this.context;
    dispatch({
      type: 'visualState/updateState',
      payload: { canvasZoom, controlStatus: 'setCanvasZoom' },
    });
  }

  // 显示图层配置
  showZoomConfig = () => {
    console.log(this.props);
    const { allState = {} } = this.props;
    const { visualMapGroupID = '' } = allState;
    if (!visualMapGroupID) {
      CMessage('请选择图层', 'warn');
      return;
    }
    const { dispatch } = this.context;
    dispatch({
      type: 'visualState/updateState',
      payload: { isZoomConfigVisible: true },
    });
  };

  setCanvasZoom = (zoom) => {
    if (zoom <= 20) {
      this.setVisualState(0.2);
    } else if (zoom >= 1000) {
      this.setVisualState(10);
    } else {
      this.setVisualState((zoom / 100).toFixed(2));
    }
  };

  render() {
    const { canvasZoom } = this.state;
    const { langLib } = this.context;
    return (
      <div className="visualZoomBox">
        <div className="visualZoom">
          <span className={`iconfont icon-layer-shrink ${canvasZoom <= 20 ? 'disabled' : ''}`}
                onClick={() => this.setCanvasZoom(canvasZoom - 5)}></span>
          <InputNumber
            value={canvasZoom}
            min={20}
            max={1000}
            formatter={value => `${value}%`}
            parser={value => value.replace('%', '')}
            style={{ width: 55, borderColor: '#fff' }}
            onChange={this.setCanvasZoom}
          />
          <span className={`iconfont icon-layer-grow ${canvasZoom >= 1000 ? 'disabled' : ''}`}
                onClick={() => this.setCanvasZoom(canvasZoom + 5)}></span>
        </div>
        <Tooltip title={langLib['visual.layer.setting'] /* lang: "上传底图"*/}>
          <span onClick={() => {
            this.showZoomConfig();
          }} className="iconfont icon-layer-setting margInLeftClass"></span>
        </Tooltip>
      </div>
    );
  };
}

export default VisualZoom;
