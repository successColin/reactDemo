import { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'dva';
import { Spin } from 'antd';
import VisualDetail from './VisualDetail/VisualDetail';
import VisualControl from './VisualControl/VisualControl';
import { getVisualGroupList } from '@/services/visualMap';
import VisualZoom from './VisualZoom/VisualZoom';
import imgSrc from '@/assets/visualMapUpImg.png';
import styles from './VisualMap.less';
import { getFullListPageConfig } from '@/services/fullListFrame';
import { CMessage } from '@/components/common/BasicWidgets';

const ownAddEventListener = (scope, type, handler, capture) => {
  scope.addEventListener(type, handler, capture);
  return () => {
    scope.removeEventListener(type, handler, capture);
  };
};

@connect(state => ({
  fullScreenState: state.visualmap.fullScreenState,
  isShowUpBackground: state.visualmap.isShowUpBackground,
  visualLoading: state.visualmap.visualLoading,
  functionData: state.tabs.activeTabData.functionData,
  userInfo: state.user.userInfo,
  relationTableName: state.visualmap.relationTableName,
}))

class VisualMap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tabList: [], // 面板
      elementMap: {},  // 控件
      initVisualMapGroupID: {},
      isInit: false
    };
  }

  componentDidMount() {
    this.fetchConfig();
    getVisualGroupList().then(datalist => {
      const item =  datalist.filter(item => item.sno === 1).length>0 ? datalist.filter(item => item.sno === 1)[0] :  datalist[0]
      this.setState({
        initVisualMapGroupID:{id: item.id, name: item.name},
        isInit: true,
      })
    }, err => this.setState({ isInit: true }));
  }

  fetchConfig = () => {
    const { langLib } = this.context;
    const { functionData } = this.props;
    getFullListPageConfig({ functionId: functionData.id }).then(res => {
      const { tabList, framePramDto, triggerMap, elementMap, filterMap, advancedQueryMap } = res;
      this.setState({
        tabList,
        elementMap,
      });
    }, err => {
    });
  };

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
    const { isShowUpBackground, fullScreenState, visualLoading, functionData, userInfo, relationTableName } = this.props;
    const { tabList, elementMap, initVisualMapGroupID, isInit } = this.state;
    const visualControlProps = {
      ownAddEventListener: ownAddEventListener,
      initVisualMapGroupID: initVisualMapGroupID,
    };

    const visualDetailProps = {
      setHoverInfo: this.setHoverInfo,
      ownAddEventListener: ownAddEventListener,
      tabList,
      elementMap,
      functionData,
      userInfo,
      initVisualMapGroupID,
    };

    const visualZoomProps = {};

    const UpBackground = (
      <div className="upBackground">
        <img src={imgSrc} alt=""/>
        <p>
          <FormattedMessage id="visual.no.layer"/>{/* lang: 暂无图层信息，请联系管理员配置 */}
        </p>
      </div>
    );

    return (
      <div className={`${styles.visualmap} ${fullScreenState ? styles.fullScreen : ''}`}>
        <div className="hoverInfo" ref="hoverInfo"></div>
        {!isShowUpBackground && UpBackground}
        {isInit && <VisualControl {...visualControlProps}/>}
        {isInit && <Spin spinning={visualLoading}>
          <VisualDetail {...visualDetailProps}/>
        </Spin>}
        <VisualZoom {...visualZoomProps}/>
      </div>
    );
  }
}

export default VisualMap;
