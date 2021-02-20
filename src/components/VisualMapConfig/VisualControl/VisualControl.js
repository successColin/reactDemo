import { Component } from 'react';
import { BaseContext } from '@/constants/global';
import { Tooltip, Input, Popover, message } from 'antd';
import { hostPotPopover } from '../VisualMapConfig.less';
import CreateModal from '@/components/common/CreateModal/CreateModal';
import ImgModal from '@/components/VisualMapConfig/ImgModal/ImgModal';
import VisualGroup from '@/components/VisualMapConfig/VisualGroup/VisualGroup';
import ModalBox from '@/components/common/ReminderBox/ReminderBox';
import { deleteVisualMap, getStates } from '@/services/visualMap';
import { connect } from 'dva';

const { Search } = Input;

@connect(state => ({
  isSave: state.visualState.isSave,
  visualMapGroupID: state.visualState.visualMapGroupID,
  canvasState: state.visualState.canvasState,
  visualMapID: state.visualState.visualMapID,
  isDeleteVisual: state.visualState.isDeleteVisual,
  imgUrl: state.visualState.imgUrl,
}))

class VisualControl extends Component {
  static contextType = BaseContext;

  constructor(props) {
    super(props);
    this.state = {
      canvasState: props.canvasState,
      drawType: props.drawType,
      fullScreenState: props.fullScreenState,
      visibleBackground: false,
      visibleGroup: false,
      visibleBlock: false,
      groupName: '',
      isDeleteVisual: props.isDeleteVisual,
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
  }


  // 获取状态的集合，用于提示
  getStatesList = () => {
    getStates().then(res => {
      this.setState({ stateList: res });
    });
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.canvasState !== this.state.canvasState) {
      this.setState({ canvasState: nextProps.canvasState });
    }
    if (nextProps.isDeleteVisual !== this.state.isDeleteVisual) {
      this.setState({ isDeleteVisual: nextProps.isDeleteVisual });
    }
  }

  // DOM销毁时
  componentWillUnmount() {
    this.setVisualState({ canvasState: 'default', drawType: '' }); // 退出时重置状态
    this.keydownEvent();
    this.keyupEvent();
  }

  isAllow = () => {
    const { langLib } = this.context;
    if (!this.props.visualMapGroupID) {
      message.warning(langLib['visual.select.group']); // lang: '请选择图层分组后再操作'
      return false;
    } else {
      return true;
    }
  };
  // 上传底图
  uploadBackground = () => {
    if (!this.isAllow()) return;
    this.setState({ visibleBackground: true });
  };
  // 绘制区块
  setDrawingMode = (type, drawType) => {
    if (!this.isAllow()) return;
    if (this.state.canvasState === type && this.state.drawType === drawType) {
      this.setVisualState({ canvasState: 'default', drawType: '', controlStatus: 'changeCanvasModel' });
      this.setState({ canvasState: 'default', drawType: '' });
    } else {
      this.setVisualState({ canvasState: type, drawType, controlStatus: 'changeCanvasModel' });
      this.setState({ canvasState: type, drawType });
    }
  };

  // 删除区块
  setDeleteState = () => {
    const { langLib } = this.context;
    if (!this.isAllow() || !this.state.isDeleteVisual) return;
    let { close } = ModalBox.confirm({
      title: langLib['visual.confirm.deletion'], // lang: '是否确认删除？'
      onOk: () => {
        this.setVisualState({ visualLoading: true });
        deleteVisualMap(this.props.visualMapID).then(res => {
          this.setVisualState({ controlStatus: 'goBackVisual', visualLoading: false });
        }, err => {
          this.setVisualState({ visualLoading: false });
        });
        close();
      },
      onCancel: () => close(),
    });
  };
  // 保存当前图层信息
  saveVisualMap = () => {
    if (!this.isAllow()) return;
    this.setVisualState({ controlStatus: 'save', visualLoading: true });
  };

  setVisualState = (payload) => {
    const { dispatch } = this.context;
    dispatch({
      type: 'visualState/updateState',
      payload: payload,
    });
  };

  setFulllScreenState = () => {
    this.setVisualState({ fullScreenState: !this.state.fullScreenState });
    this.setState({ fullScreenState: !this.state.fullScreenState });
  };

  preventDefaule = e => {
    if (e && e.preventDefault) {
      e.preventDefault(); // 阻止默认浏览器动作(W3C)
    } else {
      window.event.returnValue = false;
      return false;  // IE中阻止函数器默认动作的方式
    }
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
      } else if (keyCode === 83 && e.ctrlKey) {
        this.preventDefaule(e);
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
      } else if (keyCode === 46) {
        // deltel按键抬起删除选中区块
        this.setVisualState({ controlStatus: 'delete' });
      } else if (keyCode === 83 && e.ctrlKey) {
        this.setVisualState({ controlStatus: 'save', visualLoading: true });
        this.preventDefaule(e);
      }
    });
  };

  // 选择图层组ID
  setVisualMapGroupID = (visualMapGroup) => {
    this.visualMapGroup = { ...visualMapGroup };
  };

  // 确认图层组选择
  saveVisualMapGroupID = () => {
    this.setVisualState({
      visualMapGroupID: this.visualMapGroup.id,
      userDesignerId: this.visualMapGroup.userDesignerId,
      controlStatus: 'loadCanvasData',
      visualLoading: true,
    });
    this.setState({ visibleGroup: false, groupName: this.visualMapGroup.name });
  };

  // 确认图层背景
  setVisualMapBackground = () => {
    const { imgUrl } = this.props;
    if (!imgUrl) {
      const { langLib } = this.context;
      message.warning(langLib['visual.save.img.layer']); // lang:'请先保存当前图层'
      return;
    }
    ;
    this.setVisualState({ controlStatus: 'setBackground' });
    this.setState({ visibleBackground: false });
  };

  // 添加区块
  setVisualMapImgBlock = () => {
    this.setVisualState({ controlStatus: 'setImgBlock' });
    this.setState({ visibleBlock: false });
  };

  // 选择分组
  onOpenGroupModal = () => {
    const { langLib } = this.context;
    if (!this.props.isSave) {
      message.warning(langLib['visual.save.current.layer']); // lang:'请先保存当前图层'
      return;
    } else {
      this.setState({ visibleGroup: true });
    }
  };

  // imgCancal
  onModalCancel = (showName) => {
    this.setVisualState({ imgUrl: '' });
    this.setState({ [showName]: false });
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

  render() {
    const { langLib } = this.context;
    const { canvasState, visibleBackground, visibleGroup, fullScreenState, groupName, visibleBlock, drawType, isDeleteVisual } = this.state;
    const { ownAddEventListener } = this.props;
    return (
      <div className="visualControl">
        <Search
          value={groupName}
          readOnly
          placeholder={langLib['visual.select.layer'] /* lang: "请选择图层" */}
          onSearch={this.onOpenGroupModal}
          style={{ width: 140 }}
        />
        <span className="line">|</span>
        <Tooltip placement="bottom" title={langLib['visual.full.screen'] /* lang: "全屏"*/}>
          <span
            className={`iconfont ${fullScreenState ? 'icon-layer-exit-full-screen' : 'icon-layer-full-screen'} controlItem dataConfig`}
            onClick={() => this.setFulllScreenState()}></span>
        </Tooltip>
        <Tooltip placement="bottom" title={langLib['visula.upload.background'] /* lang: "上传底图"*/}>
          <span className="iconfont icon-layer-background controlItem dataConfig"
                onClick={() => this.uploadBackground()}></span>
        </Tooltip>
        <Popover
          placement="bottom"
          getPopupContainer={() => document.getElementById('main-container')}
          content={
            <ul className={hostPotPopover}>
              <li onClick={() => this.setDrawingMode('draw', 'rectangular')}><span
                className={`iconfont icon-layer-rectangular ${drawType === 'rectangular' ? 'custom-color' : ''}`}></span>{langLib['visual.rectangular'] /* lang:矩形 */}
              </li>
              <li onClick={() => this.setDrawingMode('draw', 'circle')}><span
                className={`iconfont icon-layer-circle ${drawType === 'circle' ? 'custom-color' : ''}`}></span>{langLib['visual.circle'] /* lang:圆形 */}
              </li>
              <li onClick={() => this.setDrawingMode('draw', 'ellipse')}><span
                className={`iconfont icon-layer-ellipse ${drawType === 'ellipse' ? 'custom-color' : ''}`}></span>{langLib['visual.ellipse'] /* lang:椭圆形 */}
              </li>
              <li onClick={() => this.setDrawingMode('draw', 'triangle')}><span
                className={`iconfont icon-layer-triangle ${drawType === 'triangle' ? 'custom-color' : ''}`}></span>{langLib['visual.triangle'] /* lang:三角形 */}
              </li>
              <li onClick={() => this.setState({ visibleBlock: true })}><span
                className={'iconfont icon-layer-hot'}></span>{langLib['visual.add.hot'] /* 添加热点 */}</li>
            </ul>
          }
          trigger="hover"
        >
          <span
            className={`iconfont icon-layer-hotspot controlItem dataConfig ${canvasState === 'draw' ? 'custom-color' : ''}`}></span>
        </Popover>
        <Tooltip placement="bottom" title={langLib['visual.layer.delete'] /* lang:"图层删除" */}>
          <span className={`iconfont icon-layer-delete controlItem dataConfig ${isDeleteVisual ? '' : 'disabled'}`}
                onClick={() => this.setDeleteState()}></span>
        </Tooltip>
        <Tooltip placement="bottom" title={langLib['visual.control.save'] /* lang: "保存" */}>
          <span className="iconfont icon-layer-save controlItem dataConfig" onClick={() => this.saveVisualMap()}></span>
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
          visible={visibleBackground}
          title={langLib['visual.control.upload'] /* lang: "上传底图" */}
          onCancel={() => this.onModalCancel('visibleBackground')}
          onOk={this.setVisualMapBackground}
        >
          <ImgModal visibleGroupID={this.visualMapGroup.id} relationTypeId={1}
                    ownAddEventListener={ownAddEventListener}></ImgModal>
        </CreateModal>
        <CreateModal
          visible={visibleGroup}
          title={langLib['visual.control.layer.group'] /* lang: "选择图层分组" */}
          onCancel={() => this.setState({ visibleGroup: false })}
          onOk={this.saveVisualMapGroupID}
        >
          <VisualGroup setVisualMapGroupID={this.setVisualMapGroupID} showType="grouplist"
                       selectedRowKeys={this.visualMapGroup.id}></VisualGroup>
        </CreateModal>
        <CreateModal
          visible={visibleBlock}
          title={langLib['visual.control.upload.pictures'] /* lang: "上传热区图片" */}
          onCancel={() => this.onModalCancel('visibleBlock')}
          onOk={() => this.setVisualMapImgBlock()}
        >
          <ImgModal visibleGroupID={this.visualMapGroup.id} relationTypeId={2}
                    ownAddEventListener={ownAddEventListener}></ImgModal>
        </CreateModal>
      </div>
    );
  };
}

export default VisualControl;
