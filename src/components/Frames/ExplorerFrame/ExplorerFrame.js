/*
 * @Author: Fus
 * @Date:   2019-11-11 14:42:55
 * @Desc: 资源管理器框架
 */
import { Component } from 'react';
import { connect } from 'dva';
import ResizableContainer from '@/components/common/ResizableContainer/ResizableContainer';
import { CMessage, CSpin } from '@/components/common/BasicWidgets';
import { getExplorerFullTree, getExplorerSingleTreeNode, getExplorerPageConfig } from '@/services/explorerFrame';
import LeftTree from './LeftTree/LeftTree';
import ContentContainer from './ContentContainer/ContentContainer';
import { BaseContext } from '@/constants/global';
import styles from './ExplorerFrame.less';

@connect(state => ({
  functionData: state.tabs.activeTabData.functionData,
  userInfo: state.user.userInfo,
  tabs: state.tabs,
  activeTabData: state.tabs.activeTabData,
  user: state.user,
}))
class ExplorerFrame extends Component {
  static contextType = BaseContext;
  state = {
    treeKeyWords: '', // 树关键字搜索
    treeData: [], // 树数据
    frameData: {}, // 框架信息
    tabList: [], // 面板列表
    elementMap: {}, // 控件map
    loadingStatus: {
      tree: false,
      config: false,
    },
  };

  componentDidMount() {
    this.fetchPage();
  }

  // 获取框架的配置数据
  fetchPage = () => {
    this.setLoadingStatus('config', true);
    const { functionData } = this.props;
    const { langLib } = this.context;
    getExplorerPageConfig({ functionId: functionData.id }).then(pageFrameData => {
      const { tabList = [], framePramDto = {}, elementMap, filterMap = {}, advancedQueryMap = {}, triggerMap = {} } = pageFrameData;
      if (!framePramDto || !tabList.length || JSON.stringify(elementMap) === '{}') {
        CMessage(langLib['message.error.noPageConfig'], 'error');
        this.setLoadingStatus('config', false);
        return;
      }
      const mainTabInfo = tabList.find(item => item.basetype === 6 && item.mainTab === 1) || {};
      this.setState({
        frameData: framePramDto || {},
        tabList,
        elementMap,
        filterMap,
        advancedQueryMap,
        triggerMap,
        mainTabInfo,
      }, () => {
        const { tabs } = this.props;
        const { activeTabData } = tabs;
        const { fileData } = activeTabData;
        this.doFetchTree(true, '', '', fileData);
      });
      this.setLoadingStatus('config', false);
    }, err => this.setLoadingStatus('config', false));
  };
  // 根据类型获取树节点数据
  doFetchTree = (isRoot, originNode, callback, fileData) => {
    const { dataResponseType } = this.state.frameData;
    if (fileData && JSON.stringify(fileData) !== '{}') {
      delete fileData.jumpTag;
      let keyArr = Object.keys(fileData) || []; // 获取到key数组，有多个只取第一个
      const globalValue = fileData[keyArr[0]] || {};
      if (globalValue.value && globalValue.tableName) {
        this.fetchFulTree((treeData) => {
          this.leftTreeRef && this.leftTreeRef.setNodeKey(treeData);
          const lastTreeNode = this.getLastTreeNode(treeData) || {};
          const { isGroup } = lastTreeNode;
          const actionType = isGroup ? 'editGroup' : 'editChild';
          this.setTreeNodeData({
            treeNodeData: lastTreeNode,
            actionType,
          });
        }, fileData);
        return;
      }
    }
    switch (dataResponseType) {
      case 1:
        this.fetchFulTree(callback);
        break;
      case 3:
        this.fetchSingleTreeNode({ isRoot, callback });
        break;
      default:
        this.fetchFulTree(callback);
        break;
    }
  };
  // 获取树的最后一个节点
  getLastTreeNode = (treeData) => {
    let lastTreeNode = {};
    const loopGetNodeKey = dataList => {
      dataList.forEach(item => {
        if (item.children && Array.isArray(item.children) && item.children.length) {
          loopGetNodeKey(item.children);
        } else {
          lastTreeNode = { ...item };
        }
      });
    };
    loopGetNodeKey(treeData);
    return lastTreeNode;
  };
  // 获取树数据
  fetchFulTree = (callback, fileData) => {
    const { frameData, treeKeyWords } = this.state;
    const { datasource1, datasource2, groupColumn, id: frameId } = frameData;
    this.setLoadingStatus('tree', true);
    let params = {
      id: 0,
      dataSource: datasource2,
      groupDataSource: datasource1,
      mainColumn: groupColumn,
      keyWords: treeKeyWords,
      frameId,
    };
    if (fileData && JSON.stringify(fileData) !== '{}') {
      delete fileData.jumpTag;
      let keyArr = Object.keys(fileData); // 获取到key数组，有多个只取第一个
      const globalValue = fileData[keyArr[0]];
      params.globalMap = {
        static_id: globalValue.value,
        static_tableName: globalValue.tableName,
      };
    }
    getExplorerFullTree(params).then(treeData => {
      this.setState({ treeData });
      this.setLoadingStatus('tree', false);
      callback && callback(treeData);
    }, err => this.setLoadingStatus('tree', false));
  };
  // 获取单条树数据
  fetchSingleTreeNode = ({ isRoot = false, callback }) => {
    const { frameData, originNode, treeNodeData, actionType, treeKeyWords } = this.state;
    const { datasource1, datasource2, groupColumn, id: frameId } = frameData;
    let group = 1;
    if (!isRoot) group = +treeNodeData.isGroup;
    const id = isRoot ? 0 : treeNodeData.id;
    let rootPath = '';
    if (originNode && originNode.props) {
      rootPath = treeNodeData.rootpath;
    }
    const params = {
      id,
      group,
      groupDataSource: datasource1,
      dataSource: datasource2,
      mainColumn: groupColumn,
      frameId,
      rootPath,
    };
    getExplorerSingleTreeNode(params).then(res => {
      const { groupList = [], childList = [], currentTreeData = {} } = res;
      if (isRoot) {
        this.setState({ treeData: [...groupList, ...childList] });
      } else {
        originNode.props.nodeData.children = [...groupList, ...childList];
        originNode.props.nodeData.name = currentTreeData.name;
        originNode.props.nodeData.childCount = currentTreeData.childCount;
        this.setState({ treeData: [...this.state.treeData] });
      }
      callback && callback(res);
    }, err => callback && callback());
  };
  /**
   * 修改选中节点，同时设置当前面板
   * @param treeNodeData 当前树节点
   * @param originNode 树节点 reactnode
   * @param needFetchPageData 是否需要重新获取数据
   */
  setTreeNodeData = ({
                       originNode = this.state.originNode,
                       treeNodeData = this.state.treeNodeData,
                       needFetchPageData = true,
                       actionType,
                     }) => {
    const { tabList, originElementMap } = this.state;
    let checkBaseType = -1;
    if (actionType === 'editGroup' || actionType === 'addGroup') {
      checkBaseType = 3;
    } else if (actionType === 'editChild' || actionType === 'addChild') {
      checkBaseType = 1;
    }
    let matchTabList = this.state.matchTabList;
    let tabInfo = this.state.tabInfo;
    // 切换的节点表不同，需要切换至第一个面板
    // if (treeNodeData.type !== this.state.treeNodeData.type) {
    matchTabList = tabList.filter(item => item.basetype === checkBaseType) || [];
    tabInfo = matchTabList.find(item => item.mainTab === 1) || matchTabList[0] || {};
    // }
    // form && form.resetFields();
    this.setState({
      originNode,
      treeNodeData,
      // actionType,
      // tabInfo,
      // matchTabList,
      // elementMap: originElementMap,
      // tabData: {},
      // fileRelationList: [],
    }, () => {
      needFetchPageData && this.contentContainerRef.doFetchPageData();
    });
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
  setFrameState = (itemObj, callback) => {
    this.setState(itemObj, () => callback && callback());
  };

  render() {
    const { loadingStatus, treeData, treeKeyWords, treeNodeData, mainTabInfo, frameData, tabList, elementMap, filterMap, advancedQueryMap, triggerMap } = this.state;
    const { functionData, userInfo, tabs, user, activeTabData } = this.props;
    // 左侧树容器属性
    const leftTreeProps = {
      loading: loadingStatus.tree,
      activeTabData,
      frameData,
      treeData,
      treeNodeData,
      treeKeyWords,
      setFrameState: this.setFrameState,
      setTreeNodeData: this.setTreeNodeData,
      doFetchTree: this.doFetchTree,
      fetchFulTree: this.fetchFulTree,
      fetchSingleTreeNode: this.fetchSingleTreeNode,
      ref: ref => this.leftTreeRef = ref,
    };
    const contentProps = {
      functionData,
      userInfo,
      frameData,
      filterMap,
      advancedQueryMap,
      triggerMap,
      tabList,
      elementMap,
      treeNodeData,
      tabs,
      user,
      setFrameState: this.setFrameState,
      ref: ref => this.contentContainerRef = ref,
    };
    return (
      <CSpin spinning={loadingStatus.tree || loadingStatus.config}>
        <div className={styles.wrap}>
          <div className={styles.treeWrap}>
            <ResizableContainer>
              <LeftTree {...leftTreeProps} />
            </ResizableContainer>
          </div>
          <div className={styles.contentWrap}>
            <ContentContainer
              {...contentProps}
              fromType="normal"
              tabInfo={mainTabInfo}
            />
          </div>
        </div>
      </CSpin>
    );
  }
}

export default ExplorerFrame;
