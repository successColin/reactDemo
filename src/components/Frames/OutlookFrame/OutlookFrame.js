import { Component } from 'react';
// import { Pagination } from 'antd';
// import { FormattedMessage } from 'react-intl';
import { getPageConfig } from '@/services/frame';
import { connect } from 'dva';
import { CMessage, CSpin } from '@/components/common/BasicWidgets';
import ContentContainer from './ContentContainer/ContentContainer';
// import Gantt from './Gantt/Gantt';
// import OutlookState from './OutlookState/OutlookState';
import styles from './OutlookFrame.less';

@connect(state => ({
  functionData: state.tabs.activeTabData.functionData,
  userInfo: state.user.userInfo,
  tabs: state.tabs,
  user: state.user,
}))
class OutlookFrame extends Component {
  state = {
    // treeKeyWords: '', // 关键字搜索
    // pageSize: 10, // 默认分页10
    // pageNum: 1, // 默认第一页
    // count: 500, // 列表数量
    frameData: {}, // 框架信息
    tabList: [], // 面板列表
    elementMap: {}, // 控件map
    loadingStatus: { // 各loading状态
      page: false, // 界面配置
      // data: false, // 界面数据
      // list: false, // 列表数据
    },
    // pagination: {},
    // // triggerMap: {}, // 触发器数据
    // tabList: [], // 面板列表（全部的面板）
    // elementMap: {}, // 面板内元素map（内容以：{tabId: [元素列表]}形式）
  }
  componentDidMount() {
    this.fetchPageConfig();
  }
  // 获取框架的配置数据
  fetchPageConfig = () => {
    this.setLoadingStatus('page', true);
    const { functionData } = this.props;
    const { langLib } = this.context;
    getPageConfig({ functionId: functionData.id }).then(pageFrameData => {
      const { tabList, framePramDto, triggerMap, elementMap, advancedQueryMap, filterMap } = pageFrameData;
      if (!framePramDto || !tabList.length || JSON.stringify(elementMap) === '{}') {
        CMessage(langLib['message.error.noPageConfig'], 'error');
        this.setLoadingStatus('page', false);
        return;
      }
      /*
        后续增加判断逻辑，菜单管理
      */

      // 第一个面板取主面板>列表类型的第一个面板>第一个面板
      const mainTabInfo = tabList.find(item => item.mainTab === 1) || tabList.find(item => item.showType === 1) || tabList[0] || {};
      this.setState({
        frameData: framePramDto || {},
        tabList,
        elementMap,
        filterMap,
        advancedQueryMap,
        triggerMap,
        mainTabInfo,
      });
      this.setLoadingStatus('page', false);
    }, err => this.setLoadingStatus('page', false));
  };
  // 更新主区块loading状态
  setLoadingStatus = (type, loading) => {
    const { loadingStatus } = this.state;
    this.setState({
      loadingStatus: {
        ...loadingStatus,
        [type]: loading,
      },
    });
  };
  // 分页切页
  // changePage = (page, pageSize) => {
  //   this.setState({
  //     pageNum: page,
  //     pageSize,
  //   }, () => {
  //     // this.getList();
  //   });
  // };
  render() {
    const { loadingStatus, mainTabInfo, frameData, tabList, elementMap, filterMap, advancedQueryMap, triggerMap } = this.state;
    const { functionData, userInfo, tabs, user } = this.props;
    const contentProps = {
      functionData,
      userInfo,
      frameData,
      filterMap,
      advancedQueryMap,
      triggerMap,
      tabList,
      elementMap,
      tabs,
      user,
      setFrameState: this.setFrameState,
      ref: ref => this.contentContainerRef = ref,
    };
    return (
      <CSpin spinning={loadingStatus.page}>
        <div className={`${styles.ganttContainer} ganttContainerSetColor`}>
          <ContentContainer
            {...contentProps}
            fromType="normal"
            tabInfo={mainTabInfo}
          />
        </div>
      </CSpin>
    );
  }
}

export default OutlookFrame;