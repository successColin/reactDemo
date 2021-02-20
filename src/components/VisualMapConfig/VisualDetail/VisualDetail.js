import { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { message } from 'antd';
import { connect } from 'dva';
import { BaseContext } from '@/constants/global';
import { fabric } from 'fabric';
import { getVisulaMap, insertVisualMap, updateVisualMap, deleteVisualConfig } from '@/services/visualMap';
import BlockConfig from '../BlockConfig/BlockConfig';
import ZoomConfig from '@/components/VisualMapConfig/ZoomConfig/ZoomConfig';
import ModalBox from '@/components/common/ReminderBox/ReminderBox';

/* @fabricCanvas      canvas对象
 * @controlStatus     状态控制：changeCanvasModel（修改模式状态）setCanvasZoom（设置缩放）loadCanvasData（加载数据）delete（删除标识）save（保存图层）setBackground（设置背景图）
 * @canvasState       当前状态：draw（绘制模式）move（拖拽模式）default（默认）
 * @canvasResize      resize事件绑定对象,组件销毁时解除事件绑定用
 * @isDrawing         是否为绘制模式
 * @drawType          绘制形状：rectangular（矩形）circle（圆形）ellipse（椭圆形）triangle（三角形）
 * @isMoveCanvas      是否为拖拽模式
 * @isHover           当前鼠标是否在热区上
 * @visualMapGroupID  图层分组ID
 * @visualMapID       当前图层ID
 * @visualMapRootID   当前图层父级ID
 * @imgUrl            当前选择的图片url
*/
@connect(state => ({
  controlStatus: state.visualState.controlStatus,
  canvasState: state.visualState.canvasState,
  drawType: state.visualState.drawType,
  canvasZoom: state.visualState.canvasZoom,
  visualMapGroupID: state.visualState.visualMapGroupID,
  visualMapID: state.visualState.visualMapID,
  visualMapRootID: state.visualState.visualMapRootID,
  imgUrl: state.visualState.imgUrl,
  isSave: state.visualState.isSave,
  fullScreenState: state.visualState.fullScreenState,
  visualLoading: state.visualState.visualLoading,
  isZoomConfigVisible: state.visualState.isZoomConfigVisible, //  控制图层配置是否显示
  zoomConfig: state.visualState.zoomConfig, // 图层配置信息
}))
class VisualDetail extends Component {
  static contextType = BaseContext;

  constructor(props) {
    super(props);
    this.state = {
      visibleConfig: false,
      blockId: 0,
      recordName: '',
      relationTabName: '',
      color: '',
      type: '',
      isClick: false,
      isShowBackBtn: false,
    };
    this.canvasState = props.canvasState;
    this.drawType = props.drawType;
    this.fabricCanvas = null;
    this.canvasResize = null;
    this.isDrawing = false;
    this.isMoveCanvas = false;
    this.isHover = false;
    this.flashTimer = null;
  }

  // DOM结构生成的时候
  componentDidMount() {
    this.visualInit();
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
      isSave: true,
    });
    this.fabricCanvas = null;
    clearInterval(this.flashTimer);
  }

  /* @setCanvasModel    更改当前绘制模式以及鼠标样式
   * @setCanvasZoom     设置缩放
   * @loadFromJSONData  加载图层数据
   * @removeBlock       删除区块
   * @saveVisualMap     保存当前图层信息
   */

  componentWillReceiveProps(nextProps) {
    if (nextProps.fullScreenState !== this.props.fullScreenState) {
      this.setCanvasSize();
    }
    console.log(nextProps, this.props, 'ssss');
    switch (nextProps.controlStatus) {
      case 'changeCanvasModel':
        this.setCanvasModel(nextProps);
        break;
      case 'setCanvasZoom':
        this.setCanvasZoom(nextProps.canvasZoom);
        break;
      case 'addChildVisual':
        this.loadFromJSONData('child', { visualMapID: nextProps.visualMapID });
        break;
      case 'loadCanvasData':
        this.loadFromJSONData('root', { visualMapGroupID: nextProps.visualMapGroupID });
        break;
      case 'goBackVisual':
        this.loadFromJSONData('back');
        break;
      case 'delete':
        this.removeBlock();
        break;
      case 'save':
        this.saveVisualMap(nextProps.visualMapID, nextProps.zoomConfig);
        break;
      case 'setBackground':
        this.setVisualBackground();
        break;
      case 'setImgBlock':
        this.setVisualImgBlock();
        break;
      default:
        break;
    }
  }

  visualInit = () => {
    let that = this;
    this.fabricCanvas = new fabric.Canvas('visualConfigCanvas');
    let mouseForm = { x: 0, y: 0 },
      mouseTo = { x: 0, y: 0 },
      mouseMove = { x: 0, y: 0 },
      lastMouseMove = { x: 0, y: 0 };
    this.fabricCanvas.on({
      'mouse:down': (e) => {
        mouseForm = that.fabricCanvas.getPointer(e, false);
        lastMouseMove = { x: e.e.layerX, y: e.e.layerY };
        that.setCanvasSate(true);
        if (!that.isHover) {
          that.setState({ visibleConfig: false });
          this.setVisualState({ isZoomConfigVisible: false });
        }
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
        if (that.isDrawing && !that.isHover) that.addBlock(mouseForm, mouseTo);
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

  setVisualImgBlock() {
    const { imgUrl } = this.props;
    if (!imgUrl) {
      this.setVisualState({ controlStatus: null });
      return;
    }
    fabric.Image.fromURL(imgUrl, (img) => {
      let center = this.fabricCanvas.getCenter();
      this.fabricCanvas.add(img.set({ left: center.left, top: center.top }));
      this.addBlockEvent(img);
      this.setVisualState({ controlStatus: null, isSave: false, isShowUpBackground: true, imgUrl: '' });
    });
  }

  setVisualBackground() {
    const { imgUrl } = this.props;
    if (!imgUrl) {
      this.setVisualState({ controlStatus: null });
      return;
    }
    this.fabricCanvas.setBackgroundImage(imgUrl, () => {
      this.setVisualState({ controlStatus: null, isSave: false, isShowUpBackground: true, imgUrl: '' });
      this.fabricCanvas.renderAll();
    });
  }

  setCanvasModel(nextProps) {
    this.canvasState = nextProps.canvasState;
    this.drawType = nextProps.drawType;
    if (this.canvasState === 'draw') {
      this.fabricCanvas.selection = true;
      this.fabricCanvas.defaultCursor = 'crosshair';
      this.fabricCanvas.hoverCursor = 'move';
      this.fabricCanvas.moveCursor = 'move';
      this.setObjectAble(true);
    } else if (this.canvasState === 'move') {
      this.fabricCanvas.selection = false;
      this.fabricCanvas.defaultCursor = '-webkit-grab';
      this.fabricCanvas.hoverCursor = '-webkit-grab';
      this.fabricCanvas.moveCursor = '-webkit-grab';
      this.setObjectAble(false);
    } else {
      this.fabricCanvas.selection = true;
      this.fabricCanvas.defaultCursor = 'default';
      this.fabricCanvas.hoverCursor = 'move';
      this.fabricCanvas.moveCursor = 'move';
      this.setObjectAble(true);
    }
    this.setVisualState({ controlStatus: null });
  }

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

  loadFromJSONData(type, options = {}) {
    const { visualMapGroupID, visualMapID } = options;
    const initVisualmapJSON = { version: '3.6.3', objects: [] };
    if (!visualMapGroupID && !visualMapID && type !== 'back') {
      this.setVisualState({ visualLoading: false });
      return;
    }
    let reqParams = {};
    if (type === 'root') {
      reqParams.groupId = visualMapGroupID;
    } else if (type === 'child') {
      let visualMapConfigId = this.fabricCanvas.getActiveObject().id;
      reqParams.rootId = visualMapID;
      reqParams.visualMapConfigId = visualMapConfigId;
    } else if (type === 'back') {
      reqParams.id = this.props.visualMapRootID;
    }
    getVisulaMap(reqParams).then(visualMapInfo => {
      if (visualMapInfo) {
        console.log(visualMapInfo, 'visualMapInfo');
        let isOpenFlash = false;
        const visualMap = JSON.parse(visualMapInfo.jsonString);
        const {
          relationId,
          relationName: relationname,
          relationTableName: relationtablename,
        } = visualMapInfo;

        this.fabricCanvas.loadFromJSON(visualMap, this.fabricCanvas.renderAll.bind(this.fabricCanvas), (o, objects) => {
          if (!objects) return;
          objects.borderColor = 'rgba(0, 0, 0, 1)';
          objects.cornerColor = '#fff';
          objects.cornerSize = 8;
          objects.cornerStrokeColor = 'rgba(0, 0, 0, 1)';
          objects.transparentCorners = false;
          this.addBlockHover(objects, visualMapInfo.visualMapConfigList);
          this.addBlockEvent(objects);
          if (objects.whetherFlash !== '0' && !!objects.whetherFlash) isOpenFlash = true;
        });
        isOpenFlash ? this.bolckFlash() : clearInterval(this.flashTimer);
        this.setVisualState({
          visualMapID: visualMapInfo.id,
          visualMapRootID: visualMapInfo.rootId,
          controlStatus: null,
          isShowUpBackground: visualMap.objects.length > 0 ? true : false,
          visualLoading: false,
          isSave: true,
          isDeleteVisual: !!visualMapInfo.rootId,
          zoomConfig: { relationId, relationname, relationtablename },
        });
        
        if(visualMap.backgroundImage){
          setTimeout(() => {
            this.setInitZoom(visualMap.backgroundImage)
          }, 90);
        }
        this.setState({ visibleConfig: false, isShowBackBtn: !!visualMapInfo.rootId });
      } else {
        reqParams = { ...reqParams, rootId: visualMapID || 0, jsonString: JSON.stringify(initVisualmapJSON) };
        insertVisualMap(reqParams).then(newVisualMapInfo => {
          this.setVisualState({
            visualMapID: newVisualMapInfo.id,
            visualMapRootID: newVisualMapInfo.rootId,
            controlStatus: null,
            visualLoading: false,
            isShowUpBackground: false,
            isSave: true,
            isDeleteVisual: type !== 'root',
          });
          this.setState({ visibleConfig: false, isShowBackBtn: type !== 'root' });
          this.fabricCanvas.loadFromJSON(initVisualmapJSON);
        }, err => this.setVisualState({ visualLoading: false }));
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

  saveVisualMap(ID, zoomConfig = {}) {
    const { langLib } = this.context;
    const { relationtablename: relationTableName, relationId, relationname: relationName } = zoomConfig;
    if (!ID) {
      console.log(1);
      message.warning(langLib['visual.select.group']); // lang: '请选择图层分组'
      return;
    } else if (!zoomConfig.relationId || !zoomConfig.relationtablename) {
      // message.warning(langLib['visual.zoom.config']); // lang: '请选择图层分组'
      this.setVisualState({
        controlStatus: null,
        visualLoading: false,
      });
      return;
    }
    const visualMapJSON = this.fabricCanvas.toJSON(['id', 'recordName', 'relationTabName', 'color', 'colorCodergb']);
    updateVisualMap({
      id: ID,
      relationTableName,
      relationName,
      relationId,
      jsonString: JSON.stringify(visualMapJSON),
    }).then(res => {
      this.setVisualState({
        controlStatus: null,
        isSave: true,
        visualLoading: false,
        isZoomConfigVisible: false,
      });
      this.setState({ visibleConfig: false });
      message.success(langLib['visual.save.success']); // lang:'保存成功'
    });
  }

  setVisualState(payload) {
    const { dispatch } = this.context;
    dispatch({
      type: 'visualState/updateState',
      payload: payload,
    });
  }

  // canvas控制状态变更
  setCanvasSate(flag) {
    if (this.canvasState === 'draw') {
      this.isDrawing = flag;
      this.isMoveCanvas = false;
    } else if (this.canvasState === 'move') {
      this.isDrawing = false;
      this.isMoveCanvas = flag;
    } else {
      this.isDrawing = false;
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

  // 设置页面所有元素操作状态 false-禁用 true-启用
  setObjectAble(flag) {
    let objectAry = this.fabricCanvas.getObjects();
    objectAry.forEach(item => {
      item.set({ selectable: flag });
    });
  }

  // 设置canvas画布大小
  setCanvasSize() {
    if (this.refs.visualmapInner) {
      setTimeout(() => {
        let w = this.refs.visualmapInner && this.refs.visualmapInner.clientWidth;
        let h = this.refs.visualmapInner && this.refs.visualmapInner.clientHeight;
        this.fabricCanvas && this.fabricCanvas.setWidth(w);
        this.fabricCanvas && this.fabricCanvas.setHeight(h);
        this.fabricCanvas && this.fabricCanvas.renderAll();
      }, 100);
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

  addBlock(mouseForm, mouseTo) {
    let w = mouseTo.x - mouseForm.x,
      h = mouseTo.y - mouseForm.y;
    if (w < 3 || h < 3) return;
    let bolckOption = {
      left: mouseForm.x,
      top: mouseForm.y,
      strokeWidth: 2,
      objectCaching: false,
      borderColor: 'rgba(0, 0, 0, 1)',
      cornerColor: '#fff',
      cornerSize: 8,
      cornerStrokeColor: 'rgba(0, 0, 0, 1)',
      transparentCorners: false,
      opacity: '1'
    };
    let newBlock = null;
    if (this.drawType === 'rectangular') {
      // 矩形绘制
      newBlock = new fabric.Rect({
        fill: 'rgba(0, 145, 255, 0.5)',
        stroke: 'rgba(0, 145, 255, 1)',
        width: w,
        height: h,
        ...bolckOption,
      });
    } else if (this.drawType === 'circle') {
      // 圆形绘制
      newBlock = new fabric.Circle({
        fill: 'rgba(204, 53, 52, 0.5)',
        stroke: 'rgba(204, 53, 52, 1)',
        radius: w / 2,
        ...bolckOption,
      });
    } else if (this.drawType === 'ellipse') {
      // 椭圆形绘制
      newBlock = new fabric.Ellipse({
        fill: 'rgba(204, 53, 52, 0.5)',
        stroke: 'rgba(204, 53, 52, 1)',
        rx: w / 2,
        ry: h / 2,
        ...bolckOption,
      });
    } else if (this.drawType === 'triangle') {
      // 椭圆形绘制
      newBlock = new fabric.Triangle({
        fill: 'rgba(247, 181, 0, 0.5)',
        stroke: 'rgba(247, 181, 0, 1)',
        width: w,
        height: h,
        ...bolckOption,
      });
    }
    this.addBlockEvent(newBlock);
    this.fabricCanvas.add(newBlock);
    if (!this.props.isShowUpBackground) this.setVisualState({ isShowUpBackground: true, isSave: false });
  }

  // 添加hoverDOM
  addBlockHover = (block, visualMapConfigList) => {
    if (block.id && !!visualMapConfigList.length) {
      for (let i = 0, len = visualMapConfigList.length; i < len; i++) {
        if (visualMapConfigList[i].id === block.id) {
          let { elementList, list } = visualMapConfigList[i];
          let PNodeAry = elementList.map(item => {
            let dataObj = {};
            try {
              dataObj = JSON.parse(list[0][item.elementId]);
              // eslint-disable-next-line no-empty
            } catch (error) {
            }
            ;
            return (
              `<p>
                <span className="label">${item.displayName}：</span>
                <span>${dataObj.name || ''}</span>
              </p>`
            );
          });
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
    let that = this;
    let PNodeAry = block.PNodeAry || [];
    block.on('mousedown', () => {
      if (!that.isMoveCanvas) {
        let { id, recordName, relationTabName, color, type } = block;
        const { dispatch } = that.context;
        that.setState({
          visibleConfig: true,
          blockId: id,
          isClick: true,
          recordName,
          relationTabName,
          color,
          type,
        });
      }
    });
    block.on('mousemove', (e) => {
      if (block.isMoving && that.props.isSave) {
        that.setVisualState({ isSave: false });
      }
      if (!!PNodeAry.length) that.props.setHoverInfo({ type: 'move', layer: { x: e.e.layerX, y: e.e.layerY } });
    });
    block.on('mouseover', () => {
      that.isHover = true;
      if (!!PNodeAry.length) that.props.setHoverInfo({ type: 'show', PNodeAry });
    });
    block.on('mouseout', () => {
      that.isHover = false;
      if (!!PNodeAry.length) that.props.setHoverInfo({ type: 'hide' });
    });
    if (block.type !== 'image') {
      block.on('scaling', (e) => {
        // 缩放已绘制好的区块，保持边框不变形
        if (e.target.type === 'ellipse') {
          e.target.rx *= e.target.scaleX;
          e.target.ry *= e.target.scaleY;
          e.target.width = e.target.rx * 2;
          e.target.height = e.target.ry * 2;
        } else if (e.target.type === 'circle') {
          let scale = e.target.scaleX === 1 ? e.target.scaleY : e.target.scaleX;
          e.target.radius *= scale;
          e.target.width = e.target.radius * 2;
          e.target.height = e.target.radius * 2;
        } else {
          e.target.width *= e.target.scaleX;
          e.target.height *= e.target.scaleY;
        }
        e.target.scaleX = 1;
        e.target.scaleY = 1;
        that.fabricCanvas.renderAll();
        this.setVisualState({ isSave: false });
      });
    }
  };

  removeBlock() {
    const { langLib } = this.context;
    this.setVisualState({ controlStatus: null });
    const activeObject = this.fabricCanvas.getActiveObject();
    if (!activeObject) return;
    if (activeObject.type === 'activeSelection') {
      message.warning(langLib['visual.select.hot.delete']); // lang: '请选择一个需要删除的热区'
      return;
    } else {
      let { close } = ModalBox.confirm({
        title: langLib['visual.confirm.deletion'], // lang: '是否确认删除？'
        onOk: () => {
          let { id } = activeObject;
          if (id) {
            deleteVisualConfig(id).then(res => {
              this.fabricCanvas.remove(activeObject);
              this.setState({ visibleConfig: false });
              this.saveVisualMap(this.props.visualMapID);
              this.setVisualState({ isZoomConfigVisible: false, controlStatus: 'save', visualLoading: true });
            }, err => {
              this.setState({ visibleConfig: false });
              this.setVisualState({ isZoomConfigVisible: false });
            });
          } else {
            this.fabricCanvas.remove(activeObject);
            this.setState({ visibleConfig: false });
            this.setVisualState({ isZoomConfigVisible: false });
          }
          close();
        },
        onCancel: () => close(),
      });
    }
  }

  setBlockInfo = (option) => {
    let { id, recordName, relationTabName, color, colorrgb, colorCodergb } = option;
    let activeObject = this.fabricCanvas.getActiveObject();
    activeObject.id = id;
    activeObject.recordName = recordName;
    activeObject.relationTabName = relationTabName;
    activeObject.colorCodergb = colorCodergb;
    if (!!colorrgb) {
      let { r, g, b } = colorrgb;
      activeObject.color = color;
      activeObject.set({ fill: `rgba(${r},${g},${b},0.2)`, stroke: `rgba(${r},${g},${b},1)` });
      this.fabricCanvas.renderAll();
    }
    const { zoomConfig } = this.props;
    this.saveVisualMap(this.props.visualMapID, zoomConfig);
    this.setVisualState({ isSave: false });
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


  // 透明度变更逻辑
  opacityFlash = (obj) => {
    let opacity = obj.opacity;
    let whetherFlash = obj.whetherFlash;
    let colorSetting = { fill: this.colorToRgba(whetherFlash, 0.2), stroke: this.colorToRgba(whetherFlash, 1) };
    if (obj.opacity >= 0.7) {
      obj.animateType = 'minus';
    } else if (obj.opacity <= 0) {
      obj.animateType = 'add';
    }
    // if (obj.colorCodergb) {
    //   let { r, g, b } = obj.colorCodergb;
    //   colorSetting = { fill: `rgba(${r},${g},${b},0.2)`, stroke: `rgba(${r},${g},${b},1)` };
    // }

    obj.animateType === 'minus' ? opacity = 0 : opacity = 0.7;
    obj.set({ ...colorSetting, opacity: parseFloat(opacity.toFixed(1)) });
  };

  // 回退上一层
  onVisualBack = () => {
    const { langLib } = this.context;
    if (!this.props.isSave) {
      message.warning(langLib['visual.save.layer']);
    }
    this.setVisualState({ visualLoading: true, controlStatus: 'goBackVisual' });
  };

  render() {
    const { visibleConfig, blockId, recordName, relationTabName, color, isShowBackBtn, type, isClick } = this.state;
    const blockInfo = { blockId, recordName, relationTabName, color, type, isClick };
    const { isZoomConfigVisible } = this.props;
    const VisualBack = (
      <div className="visualBack" onClick={this.onVisualBack}>
        <span className="iconfont icon-layer-back custom-color"></span>
        <span className="text">
          <FormattedMessage id="visual.back"/> {/* lang: 回退 */}
        </span>
      </div>
    );

    return (
      <div className="visualmapInner" ref="visualmapInner">
        <canvas id="visualConfigCanvas" className="visualCanvas"></canvas>
        {visibleConfig && <BlockConfig setBlockInfo={this.setBlockInfo} blockInfo={blockInfo}/>}
        {isZoomConfigVisible && <ZoomConfig/>}
        {isShowBackBtn && VisualBack}
      </div>
    );
  }
}

export default VisualDetail;
