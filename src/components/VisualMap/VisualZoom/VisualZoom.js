import { Component } from 'react';
import { InputNumber } from 'antd';
import { connect } from 'dva';
import { BaseContext } from '@/constants/global';

@connect(state => ({
  canvasZoom: state.visualmap.canvasZoom,
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
      type: 'visualmap/updateState',
      payload: { canvasZoom, controlStatus: 'setCanvasZoom' },
    });
  }

  setCanvasZoom = (zoom) => {
    if (zoom <= 20) {
      this.setVisualState(0.2);
    } else if (zoom >= 1000) {
      this.setVisualState(10);
    } else {
      this.setVisualState((zoom / 100).toFixed(2));
    }
  }

  render() {
    const { canvasZoom } = this.state;
    return (
      <div className="visualZoom">
        <span className={`iconfont icon-layer-shrink ${canvasZoom <= 20 ? 'disabled' : ''}`} onClick={() => this.setCanvasZoom(canvasZoom - 5)}></span>
        <InputNumber
          value={canvasZoom}
          min={20}
          max={1000}
          formatter={value => `${value}%`}
          parser={value => value.replace('%', '')}
          style={{ width: 55, borderColor: '#fff' }}
          onChange={this.setCanvasZoom}
        />
        <span className={`iconfont icon-layer-grow ${canvasZoom >= 1000 ? 'disabled' : ''}`} onClick={() => this.setCanvasZoom(canvasZoom + 5)}></span>
      </div>
    );
  };
}

export default VisualZoom;
