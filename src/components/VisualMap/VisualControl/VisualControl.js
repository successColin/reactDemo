import { Component } from 'react';
import { BaseContext } from '@/constants/global';
import { Tooltip, Input, message, Popover } from 'antd';
import VisualGroup from '@/components/VisualMap/VisualGroup/VisualGroup';
import CreateModal from '@/components/common/CreateModal/CreateModal';
import { getStates } from '@/services/visualMap';
import { connect } from 'dva';
import { hostPotPopover } from '@/components/VisualMapConfig/VisualMapConfig.less';

const { Search } = Input;

@connect(state => ({
  canvasState: state.visualmap.canvasState,
}))

class VisualControl extends Component {
  static contextType = BaseContext;

  constructor(props) {
    super(props);
    this.state = {
      canvasState: props.canvasState,
      drawType: props.drawType,
      fullScreenState: props.fullScreenState,
      visibleGroup: false,
      groupName: '',
      stateList: [], // 状态集合
    };
    this.keydownEvent = null;
    this.keyupEvent = null;
    this.lastCanvasState = 'default';
    this.visualMapGroup = {};
  }

  componentDidMount() {
    this.onKeyDownMove();
    this.getStatesList();
    if(this.props.initVisualMapGroupID){
      this.saveVisualMapGroupID(this.props.initVisualMapGroupID,'init')
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.canvasState !== this.state.canvasState) {
      this.setState({ canvasState: nextProps.canvasState });
    }
  }

  // 获取状态的集合，用于提示
  getStatesList = () => {
    getStates().then(res => {
      this.setState({ stateList: res });
    });
  };
  renderHelpList = () => {
    const { stateList = [] } = this.state;
    return stateList.map((item, index) => {
      return (<li key={item.id + index}><span
        style={{
          width: '10px',
          height: '10px',
          'display': 'inline-block',
          borderRadius: '50%',
          backgroundColor: item.colorCode,
        }}></span>{item.name}
      </li>);
    });
  };

  // DOM销毁时
  componentWillUnmount() {
    this.setVisualState({ canvasState: 'default', drawType: '' }); // 退出时重置状态
    this.keydownEvent();
    this.keyupEvent();
  }

  isAllow = () => {
    const { langLib } = this.context;
    if (!this.visualMapGroup.id) {
      message.warning(langLib['visual.select.group']); // lang: '请选择图层分组后再操作'
      return false;
    } else {
      return true;
    }
  };

  setVisualState = (payload) => {
    const { dispatch } = this.context;
    dispatch({
      type: 'visualmap/updateState',
      payload: payload,
    });
  };

  setFulllScreenState = () => {
    this.setVisualState({ fullScreenState: !this.state.fullScreenState });
    this.setState({ fullScreenState: !this.state.fullScreenState });
  };

  // 按住空格可以拖拽
  onKeyDownMove = () => {
    let isOnkeydown = false;
    this.keydownEvent = this.props.ownAddEventListener(window, 'keydown', e => {
      let keyCode = e.keyCode || e.which || e.charCode;
      if (!isOnkeydown && keyCode === 32) {
        isOnkeydown = true;
        this.lastCanvasState = this.state.canvasState;
        this.setVisualState({ canvasState: 'move', drawType: this.state.drawType, controlStatus: 'changeCanvasModel' });
      }
    });
    this.keyupEvent = this.props.ownAddEventListener(window, 'keyup', e => {
      let keyCode = e.keyCode || e.which || e.charCode;
      if (keyCode === 32) {
        isOnkeydown = false;
        this.setVisualState({
          canvasState: this.lastCanvasState,
          drawType: this.state.drawType,
          controlStatus: 'changeCanvasModel',
        });
      }
    });
  };

  // 选择图层组ID
  setVisualMapGroupID = (visualMapGroup) => {
    this.visualMapGroup = { ...visualMapGroup };
  };

  // 确认图层组选择
  saveVisualMapGroupID = (initVisualMapGroupID = {}, type = 'loadCanvasData') => {
    this.setVisualState({
      visualMapGroupID: initVisualMapGroupID.id || this.visualMapGroup.id,
      userDesignerId: initVisualMapGroupID.userDesignerId || this.visualMapGroup.userDesignerId,
      controlStatus: type,
      visualLoading: true,
    });
    this.setState({ visibleGroup: false, groupName: initVisualMapGroupID.name || this.visualMapGroup.name });
  };

  setDrawingMode = (type, drawType) => {
    if (!this.isAllow()) return;
    if (this.state.canvasState === type && this.state.drawType === drawType) {
      this.setVisualState({ canvasState: 'default', drawType, controlStatus: 'changeCanvasModel' });
      this.setState({ canvasState: 'default', drawType });
    } else {
      this.setVisualState({ canvasState: type, drawType, controlStatus: 'changeCanvasModel' });
      this.setState({ canvasState: type, drawType });
    }
  };

  render() {
    const { langLib } = this.context;
    const { canvasState, fullScreenState, visibleGroup, groupName } = this.state;
    return (
      <div className="visualControl">
        <Search
          value={groupName}
          readOnly
          placeholder={langLib['visual.select.layer'] /* lang: "请选择图层" */}
          onSearch={() => this.setState({ visibleGroup: true })}
          style={{ width: 140 }}
        />
        <span className="line">|</span>
        <Tooltip placement="bottom" title={langLib['visual.full.screen'] /* lang: "全屏"*/}>
          <span
            className={`iconfont ${fullScreenState ? 'icon-layer-exit-full-screen' : 'icon-layer-full-screen'} controlItem dataConfig`}
            onClick={() => this.setFulllScreenState()}></span>
        </Tooltip>
        <Tooltip placement="bottom" title={langLib['visual.control.mobile'] /* lang: "移动" */}>
          <span
            className={`iconfont icon-layer-move controlItem dataConfig ${canvasState === 'move' ? 'custom-color' : ''}`}
            onClick={() => this.setDrawingMode('move')}></span>
        </Tooltip>
        <Popover
          placement="bottom"
          getPopupContainer={() => document.getElementById('main-container')}
          content={
            <ul className={hostPotPopover}>
              {this.renderHelpList()}
            </ul>
          }
          trigger="hover"
        >
          <span className="iconfont icon-icon-Tips controlItem dataConfig"></span>
        </Popover>
        <CreateModal
          visible={visibleGroup}
          title={langLib['visual.control.layer.group'] /* lang: "选择图层分组" */}
          onCancel={() => this.setState({ visibleGroup: false })}
          onOk={this.saveVisualMapGroupID}
        >
          <VisualGroup setVisualMapGroupID={this.setVisualMapGroupID} showType="grouplist"
                       selectedRowKeys={this.visualMapGroup.id}></VisualGroup>
        </CreateModal>
      </div>
    );
  };
}

export default VisualControl;
