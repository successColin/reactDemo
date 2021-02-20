import { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { message, Popover } from 'antd';
import { connect } from 'dva';
import { BaseContext } from '@/constants/global';
import { fabric } from 'fabric';
import { getVisulaMap, insertVisualMap, updateVisualMap } from '@/services/visualMap';
import Styles from '../VisualMap.less';
import SummaryItem from '../SummaryItem/SummaryItem';

/* @fabricCanvas      canvas对象
 * @controlStatus     状态控制：changeCanvasModel（修改模式状态）setCanvasZoom（设置缩放）loadCanvasData（加载数据）delete（删除标识）save（保存图层）setBackground（设置背景图）
 * @canvasState       当前状态：draw（绘制模式）move（拖拽模式）default（默认）
 * @canvasResize      resize事件绑定对象,组件销毁时解除事件绑定用
 * @isMoveCanvas      是否为拖拽模式
 * @visualMapGroupID  图层分组ID
 * @visualMapID       当前图层ID
 * @visualMapRootID   当前图层父级ID
 * @imgUrl            当前选择的图片url
*/
@connect(state => ({
  controlStatus: state.visualmap.controlStatus,
  canvasState: state.visualmap.canvasState,
  canvasZoom: state.visualmap.canvasZoom,
  visualMapGroupID: state.visualmap.visualMapGroupID,
  visualMapID: state.visualmap.visualMapID,
  visualMapRootID: state.visualmap.visualMapRootID,
  imgUrl: state.visualmap.imgUrl,
  fullScreenState: state.visualmap.fullScreenState,
  visualLoading: state.visualmap.visualLoading,
  user: state.user,
  tabs: state.tabs,
}))
class VisualDetail extends Component {
  static contextType = BaseContext;

  constructor(props) {
    super(props);
    this.state = {
      blockId: 0,
      recordName: '',
      relationTabName: '',
      isShowBackBtn: false,
      isShowData: false, // 获取数据统计
      zoomConfig: {},
    };
    this.canvasState = props.canvasState;
    this.fabricCanvas = null;
    this.canvasResize = null;
    this.isMoveCanvas = false;
    this.visualMapConfigId = 0;
    this.flashTimer = null;
    this.flashAll = null;
  }

  // DOM结构生成的时候
  componentDidMount() {
    this.visualInit();
    if(this.props.initVisualMapGroupID){
      this.loadFromJSONData('root', { visualMapGroupID: this.props.initVisualMapGroupID.id });
    }
  }

  // DOM销毁时
  componentWillUnmount() {
    // 解除resize绑定
    this.canvasResize();
    this.setVisualState({
      canvasZoom: 1,
      visualMapGroupID: 0,
      visualMapID: 0,
      visualMapRootID: 0,
      isShowUpBackground: false,
      controlStatus: null,
      imgUrl: '',
    });
    this.fabricCanvas = null;
    clearInterval(this.flashTimer);
    clearInterval(this.flashAll);
  }

  /* @setCanvasModel    更改当前绘制模式以及鼠标样式
   * @setCanvasZoom     设置缩放
   * @loadFromJSONData  加载图层数据
   */

  componentWillReceiveProps(nextProps) {
    if (nextProps.fullScreenState !== this.props.fullScreenState) {
      this.setCanvasSize();
    }
    switch (nextProps.controlStatus) {
      case 'changeCanvasModel':
        this.setCanvasModel(nextProps);
        break;
      case 'setCanvasZoom':
        this.setCanvasZoom(nextProps.canvasZoom);
        break;
      case 'addChildVisual':
        this.loadFromJSONData('child', { visualMapID: nextProps.visualMapID });
        // clearInterval(this.flashAll);
        // this.flashAll = setInterval(() => {
        //   this.setState({ zoomConfig: {} });
        //   this.loadFromJSONData('child', { visualMapID: nextProps.visualMapID });
        // }, 60000);
        break;
      case 'loadCanvasData':
        this.loadFromJSONData('root', { visualMapGroupID: nextProps.visualMapGroupID });
        // clearInterval(this.flashAll);
        // this.flashAll = setInterval(() => {
        //   this.setState({ zoomConfig: {} });
        //   this.loadFromJSONData('root', { visualMapGroupID: nextProps.visualMapGroupID });
        // }, 60000);
        break;
      default:
        break;
    }
  }

  visualInit = () => {
    let that = this;
    this.fabricCanvas = new fabric.Canvas('visualCanvas');
    this.fabricCanvas.selection = false;
    let mouseForm = { x: 0, y: 0 },
      mouseTo = { x: 0, y: 0 },
      mouseMove = { x: 0, y: 0 },
      lastMouseMove = { x: 0, y: 0 };
    this.fabricCanvas.on({
      'mouse:down': (e) => {
        mouseForm = that.fabricCanvas.getPointer(e, false);
        lastMouseMove = { x: e.e.layerX, y: e.e.layerY };
        that.setCanvasSate(true);
      },
      'mouse:move': (e) => {
        mouseMove = { x: e.e.layerX, y: e.e.layerY };
        if (that.isMoveCanvas) {
          let viewportTransform = Object.assign([], that.fabricCanvas.viewportTransform);
          viewportTransform[4] = viewportTransform[4] - (lastMouseMove.x - mouseMove.x); // 当前已经偏移的X值
          viewportTransform[5] = viewportTransform[5] - (lastMouseMove.y - mouseMove.y); // 当前已经偏移的Y值
          that.fabricCanvas.setViewportTransform(viewportTransform);
          lastMouseMove = { x: e.e.layerX, y: e.e.layerY };
        }
      },
      'mouse:up': (e) => {
        mouseTo = that.fabricCanvas.getPointer(e, false);
        that.setCanvasSate(false);
      },
      'mouse:wheel': (e) => {
        let corsurPoint = new fabric.Point(e.e.layerX, e.e.layerY);
        let canvasZoom = that.fabricCanvas.getZoom();
        let scale = 1.05;
        if (e.e.deltaY < 0 && canvasZoom <= 0.2) { // 解决缩小到极限抖动问题
          canvasZoom = 0.2;
        } else if (e.e.deltaY < 0) {
          canvasZoom = canvasZoom * (1 / scale);
        } else if (canvasZoom < 10) {
          canvasZoom = canvasZoom * scale;
        }
        that.fabricCanvas.zoomToPoint(corsurPoint, canvasZoom);
        that.setVisualState({ canvasZoom });
      },
    });
    this.setCanvasSize();
    this.resizeCanvasSize();
  };

  setCanvasModel(nextProps) {
    this.canvasState = nextProps.canvasState;
    if (this.canvasState === 'move') {
      this.fabricCanvas.defaultCursor = '-webkit-grab';
      this.fabricCanvas.hoverCursor = '-webkit-grab';
      this.fabricCanvas.moveCursor = '-webkit-grab';
    } else {
      this.fabricCanvas.defaultCursor = 'default';
      this.fabricCanvas.hoverCursor = 'move';
      this.fabricCanvas.moveCursor = 'move';
    }
    this.setVisualState({ controlStatus: null });
  }

  loadFromJSONData(type, options = {}) {
    const { langLib } = this.context;
    const { visualMapGroupID, visualMapID, visualMapRootID } = options;
    if (!visualMapGroupID && !visualMapID && type !== 'back') {
      this.setVisualState({ visualLoading: false });
      return;
    }
    let reqParams = {};
    if (type === 'root') {
      reqParams.groupId = visualMapGroupID;
    } else if (type === 'child') {
      reqParams.rootId = visualMapID;
      reqParams.visualMapConfigId = this.visualMapConfigId;
    } else if (type === 'back') {
      reqParams.id = visualMapRootID;
    }
    getVisulaMap(reqParams).then(visualMapInfo => {
      if (visualMapInfo) {
        const visualMap = JSON.parse(visualMapInfo.jsonString);
        this.fabricCanvas && this.fabricCanvas.loadFromJSON(visualMap, this.fabricCanvas.renderAll.bind(this.fabricCanvas), (o, objects) => {
          if (!objects) return;
          objects.borderColor = 'rgba(0, 0, 0, 1)';
          objects.cornerColor = '#fff';
          objects.cornerSize = 8;
          objects.cornerStrokeColor = 'rgba(0, 0, 0, 1)';
          objects.transparentCorners = false;
          objects.selectable = false;
          this.addBlockHover(objects, visualMapInfo.visualMapConfigList);
          this.addBlockEvent(objects);
        });
        
        this.bolckFlash();
        this.setVisualState({
          visualMapID: visualMapInfo.id,
          visualMapRootID: visualMapInfo.rootId,
          controlStatus: null,
          isShowUpBackground: visualMap.objects.length > 0 ? true : false,
          visualLoading: false,
          relationTableName: visualMapInfo.relationTableName,
        });
        if(visualMap.backgroundImage){
          setTimeout(() => {
            this.setInitZoom(visualMap.backgroundImage)
          }, 90);
          this.fabricCanvas.backgroundColor = '#345065';
        }
        this.setState({
          isShowBackBtn: !!visualMapInfo.rootId,
          // isShowBackBtn: true,
          zoomConfig: {
            relationId: visualMapInfo.relationId,
            relationTableName: visualMapInfo.relationTableName,
          },
        });
      } else {
        // this.fabricCanvas.backgroundColor = null;
        message.warning(langLib['visual.layer.configured.yet']); // '暂未配置该图层'
        this.setVisualState({ visualLoading: false, controlStatus: null });
      }
    }, err => this.setVisualState({ visualLoading: false }));
  }

  setInitZoom =(item) =>{
    const {width, height} = item;
    const zoom = parseInt(this.fabricCanvas.width * 100/width)/100
    const layerY = (this.fabricCanvas.height-height*zoom) > 0 ? parseInt((this.fabricCanvas.height-height*zoom)/2) : 0
    const corsurPoint = new fabric.Point(10, layerY);
    this.setVisualState({ canvasZoom: zoom });
    this.fabricCanvas.zoomToPoint(corsurPoint, zoom);
  }

  setVisualState(payload) {
    const { dispatch } = this.context;
    dispatch({
      type: 'visualmap/updateState',
      payload: payload,
    });
  }

  // canvas控制状态变更
  setCanvasSate(flag) {
    if (this.canvasState === 'move') {
      this.isMoveCanvas = flag;
    } else {
      this.isMoveCanvas = false;
    }
  }

  // 控制器输入的缩放比例
  setCanvasZoom(zoom) {
    let center = this.fabricCanvas.getCenter();
    let corsurPoint = new fabric.Point(center.left, center.top);
    this.fabricCanvas.zoomToPoint(corsurPoint, zoom);
    this.setVisualState({ controlStatus: null });
  }


  // 设置canvas画布大小
  setCanvasSize() {
    if (this.refs.visualmapInner) {
      setTimeout(() => {
        let w = this.refs.visualmapInner.clientWidth;
        let h = this.refs.visualmapInner.clientHeight;
        this.fabricCanvas.setWidth(w);
        this.fabricCanvas.setHeight(h);
        this.fabricCanvas.renderAll();
      }, 30);
    }
  }

  // 根据窗口自适应大小
  resizeCanvasSize() {
    this.canvasResize = this.props.ownAddEventListener(window, 'resize', (() => {
      let _lastTime = null;
      return () => {
        let _nowTime = new Date();
        if (_nowTime - _lastTime > 500 || !_lastTime) {
          this.setCanvasSize(this.fabricCanvas);
          _lastTime = _nowTime;
        }
      };
    })(), false);
  }

  // 添加hoverDOM
  addBlockHover = (block, visualMapConfigList) => {
    if (block.id && !!visualMapConfigList.length) {
      for (let i = 0, len = visualMapConfigList.length; i < visualMapConfigList.length; i++) {
        if (visualMapConfigList[i].id === block.id) {
          let { elementList, list } = visualMapConfigList[i];
          let PNodeAry = elementList.map(item => {
            let dataObj = !!list[0] && JSON.parse(list[0][item.elementId]);
            if(item.displayName === 'id'){
              return ''
            }
            return `
              <p>
                <span class="label">${item.displayName}：</span>
                <span>${dataObj.name}</span>
              </p>
            `
          });
          // <span>${dataObj.name}</span>
          if(elementList.length<=1) PNodeAry = []
          block.PNodeAry = PNodeAry;
          block.whetherFlash = visualMapConfigList[i].whetherFlash;
          visualMapConfigList.splice(i, 1);
          break;
        }
      }
    }
  };

  // 区块添加事件
  addBlockEvent = block => {
    const { langLib } = this.context;
    let that = this;
    let PNodeAry = block.PNodeAry || [];
    block.on('mousemove', (e) => {
      if (!!PNodeAry.length) that.props.setHoverInfo({ type: 'move', layer: { x: e.e.layerX, y: e.e.layerY } });
    });
    block.on('mouseover', () => {
      if (!!PNodeAry.length) that.props.setHoverInfo({ type: 'show', PNodeAry });
    });
    block.on('mouseout', () => {
      if (!!PNodeAry.length) that.props.setHoverInfo({ type: 'hide' });
    });
    block.on('mousedblclick', () => {
      if (!!block.id) {
        that.visualMapConfigId = block.id;
        that.setVisualState({ controlStatus: 'addChildVisual', visualLoading: true });
      } else {
        // message.warning(langLib['visual.layer.configured.yet']); // '暂未配置该图层'
      }
    });
  };

  // 闪烁动画
  bolckFlash = () => {
    let that = this;
    clearInterval(that.flashTimer);
    that.flashTimer = setInterval(() => {
      that.fabricCanvas && that.fabricCanvas.forEachObject(obj => {
        if (obj.whetherFlash !== '0' && !!obj.whetherFlash) {
          that.opacityFlash(obj);
          obj.dirty = true;
        }
      });
      that.fabricCanvas && that.fabricCanvas.renderAll();
    }, 500);
  };
  // 将二进制颜色换算成16进制
  colorToRgba = (str, opacity) => {
    // 16进制颜色值的正则
    let reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
    // 把颜色值变成小写
    let color = str.toLowerCase();
    if (reg.test(color)) {
      // 如果只有三位的值，需变成六位，如：#fff => #ffffff
      if (color.length === 4) {
        let colorNew = '#';
        for (let i = 1; i < 4; i += 1) {
          colorNew += color.slice(i, i + 1).concat(color.slice(i, i + 1));
        }
        color = colorNew;
      }
      // 处理六位的颜色值，转为RGB
      let colorChange = [];
      for (let i = 1; i < 7; i += 2) {
        colorChange.push(parseInt('0x' + color.slice(i, i + 2)));
      }
      return 'rgba(' + colorChange.join(',') + ',' + opacity + ')';
    } else {
      return color;
    }
  };

  // 透明度变更逻辑
  opacityFlash = (obj) => {
    let opacity = obj.opacity;
    let opa = 0
    obj.type = 'minus';
    if (obj.opacity >= 0.7) {
      opa = 0;
      obj.type = 'minus';
    } else if (obj.opacity <= 0) {
      opa = 0.7;
      obj.type = 'add';
    }
    // let colorSetting = {};
    let whetherFlash = obj.whetherFlash;
    let colorSetting = { fill: this.colorToRgba(whetherFlash, 1), stroke: this.colorToRgba(whetherFlash, 1) };
    // if (obj.colorCodergb) {
    //   let { r, g, b } = obj.colorCodergb;
    //   colorSetting = { fill: `rgba(${r},${g},${b},0.2)`, stroke: `rgba(${r},${g},${b},1)` };
    // }
    obj.type === 'minus' ? opacity = 0 : opacity = 0.7;
    obj.set({ ...colorSetting, 'opacity': parseFloat(opacity.toFixed(1)) });
  };

  // 回退上一层
  onVisualBack = () => {
    const { visualMapRootID } = this.props;
    this.loadFromJSONData('back', { visualMapRootID });
    this.setVisualState({ visualLoading: true });
    // clearInterval(this.flashAll);
    // this.flashAll = setInterval(() => {
    //   this.setState({ zoomConfig: {} });
    //   this.loadFromJSONData('back', { visualMapRootID });
    // }, 300000);
  };
  // 渲染统计数据列表
  renderDataList = () => {
    const { tabList = [], elementMap = {},userInfo,functionData,user,tabs } = this.props;
    let elementList = elementMap[tabList[0].id] || [];
    const { zoomConfig } = this.state;
    let chartMap = {
      '@@GraphicalGobalTableName': { value: zoomConfig.relationTableName, type: 1 },
      '@@GraphicalGobalId': { value: zoomConfig.relationId, type: 2 },
    };
    return elementList.filter(item => !!item.visiabled).map(item => {
      return (
        <SummaryItem
          userInfo={userInfo}
          functionData={functionData}
          chartMap={chartMap}
          user={user}
          tabs={tabs}
          eleObj={item}
          key={`summaryItem_${item.id}`}
        />
      );
    });
  };


  render() {
    const { isShowBackBtn, isShowData, zoomConfig = {} } = this.state;
    const { tabList = [], elementMap = {} } = this.props;
    const VisualBack = (
      <div className="visualBack" onClick={this.onVisualBack}>
        <span className="iconfont icon-layer-back custom-color"></span>
        <span className="text">
          <FormattedMessage id="visual.back"/> {/* lang: 回退 */}
        </span>
      </div>
    );
    const listDom = !!zoomConfig.relationTableName && !!zoomConfig.relationId && !!tabList.length && JSON.stringify(elementMap) !== '{}' && this.renderDataList();
    const dom = <div>
      {/* <div className={Styles.tit}><FormattedMessage id="visual.data.statistics"/></div> */}
      {listDom}
    </div>;

    return (
      <div id="visualmapInnerHook" className="visualmapInner" ref="visualmapInner">
        <canvas id="visualCanvas" className="visualCanvas"></canvas>

        <div className="visualShowBox">
          {!!zoomConfig.relationTableName && !!zoomConfig.relationId && !!tabList.length && JSON.stringify(elementMap) !== '{}' &&
          <Popover
            overlayClassName={Styles.visualDataSty}
            placement="bottomRight"
            content={dom}
            trigger="click"
            overlayStyle={{ 'zIndex': 2 }}
            visible={true}
            getPopupContainer={() => document.getElementById('visualmapInnerHook')}
            // onVisibleChange={(visible) => this.setState({ isShowData: visible })}
          >
            {/* <div className="visualNumBox" onClick={() => this.setState({ isShowData: !isShowData })}>
              <span className={`iconfont ${isShowData ? 'icon-up' : 'icon-down'} custom-color`}></span>
              <FormattedMessage id="visual.data.statistics"/>
            </div> */}
          </Popover>
          }
          {isShowBackBtn && VisualBack}
        </div>
      </div>
    );
  }
}

export default VisualDetail;
