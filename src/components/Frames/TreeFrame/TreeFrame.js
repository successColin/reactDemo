/*
 * @Author: Fus
 * @Date:   2019-08-27 11:27:22
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2020-04-08 10:57:24
 * @Desc: 业务模型框架 - 左侧树结构框架
 */
import { Component } from 'react';
import { connect } from 'dva';
import { CMessage, CSpin } from '@/components/common/BasicWidgets';
import ResizableContainer from '@/components/common/ResizableContainer/ResizableContainer';
import LeftTree from './LeftTree/LeftTree';
import ContentContainer from './ContentContainer/ContentContainer';
import { getPageConfig, getPageFullTree, getPageSingleTreeNode } from '@/services/frame';
import { BaseContext } from '@/constants/global';
import styles from './TreeFrame.less';

@connect(state => ({
  functionData: state.tabs.activeTabData.functionData,
  userInfo: state.user.userInfo,
  tabs: state.tabs,
  user: state.user,
}))
class TreeFrame extends Component {
  static contextType = BaseContext;
  state = {
    treeKeyWords: '', // 树关键字搜索
    treeData: [], // 树数据
    actionType: '', // 树右键操作类型
    treeNodeData: {}, // 选中节点对象数据
    originNode: {}, // antd TreeNode对象
    tabInfo: {}, // 当前面板信息
    frameData: {}, // 框架数据
    triggerMap: {}, // 触发器数据
    advancedQueryMap: {}, // 过滤条件map
    elementMap: {}, // 面板内元素map（内容以：{tabId: [元素列表]}形式）
    originElementMap: {}, // 初始接口返回的元素map（用于触发器回置）
    tabList: [], // 面板列表（全部的面板）
    matchTabList: [], // 当前节点的面板列表（区分组和非组的面板）
    visiblePopupTab: false, // 关联弹出面板显示状态
    popupTabInfo: {}, // 关联弹出面板详情
    // listDataResult: {}, // 列表数据接口返回
    // fileRelationList: [], // 文件关联信息
    tabData: { // 面板内数据 (tabId对应数据的map)
      // [tabId]: {},
    },
    loadingStatus: { // 各loading状态
      tree: false, // 树
      page: false, // 界面配置
      data: false, // 界面数据
      list: false, // 列表数据
    },
    filePassList: {}  //图片参数的值
  };

  componentDidMount() {
    this.fetchPage();
  }

  // 获取面板配置
  fetchPage = () => {
    this.setLoadingStatus('page', true);
    const { functionData } = this.props;
    const { langLib } = this.context;
    getPageConfig({ functionId: functionData.id }).then(pageFrameData => {
      const { tabList, framePramDto, triggerMap, elementMap, advancedQueryMap, filterMap } = pageFrameData;
      const { datasource1, datasource2 } = framePramDto || {};
      // const isMultiTable = !!datasource1 && !!datasource2;
      if (!framePramDto || !tabList.length || JSON.stringify(elementMap) === '{}') {
        CMessage(langLib['message.error.noPageConfig'], 'error');
        this.setLoadingStatus('page', false);
        return;
      }
      this.setState({
        frameData: framePramDto || {},
        // pageFrameData,
        triggerMap,
        tabList,
        elementMap,
        filterMap,
        originElementMap: elementMap,
        // isMultiTable,
        advancedQueryMap,
      }, () => {
        const { tabs } = this.props;
        const { activeTabData } = tabs;
        const { fileData } = activeTabData;
        this.doFetchTree(true, '', fileData);
      });
      this.setLoadingStatus('page', false);
    }, err => this.setLoadingStatus('page', false));
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
  // 根据类型获取树节点数据
  doFetchTree = (isRoot, callback, fileData) => {
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
        break;
    }
  };
  // 获取树数据
  fetchFulTree = (callback, fileData) => {
    const { frameData, treeKeyWords } = this.state;
    const { tabs } = this.props;
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
    getPageFullTree(params).then(treeData => {
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
    let params = {
      id,
      group,
      groupDataSource: datasource1,
      dataSource: datasource2,
      mainColumn: groupColumn,
      frameId,
      rootPath,
    };

    isRoot && this.setLoadingStatus('tree', true);
    getPageSingleTreeNode(params).then(res => {
      const { groupList = [], childList = [], currentTreeData = {} } = res;
      if (isRoot) {
        const treeData = [...groupList, ...childList];
        const rootNodeData = treeData[0] || {};
        const expandedKeys = rootNodeData && [rootNodeData.nodeKey] || [];
        this.leftTreeRef && this.leftTreeRef.setState({ expandedKeys });
        this.setState({ treeData, treeNodeData: rootNodeData }, () => {
          this.setTreeNodeData({
            actionType: rootNodeData.isGroup ? 'editGroup' : 'editChild',
          });
        });
        this.setLoadingStatus('tree', false);
      } else {
        originNode.props.nodeData.children = [...groupList, ...childList];
        originNode.props.nodeData.name = currentTreeData.name;
        originNode.props.nodeData.childCount = currentTreeData.childCount;
        this.setState({ treeData: [...this.state.treeData] });
      }
      // 新增时，需要将当前父节点以下  以加载的节点清空
      if ((actionType === 'addGroup' || actionType === 'addChild') && this.leftTreeRef) {
        const { expandedKeys } = this.leftTreeRef.state;
        const activeIndex = expandedKeys.indexOf(treeNodeData.nodeKey);
        const newExpandedKeys = expandedKeys.splice(0, activeIndex + 1);
        this.leftTreeRef.setState({ expandedKeys: newExpandedKeys, loadedKeys: newExpandedKeys });
      }
      callback && callback(res);
    }, err => callback && callback());
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
    // const { form } = this.contentContainerRef && this.contentContainerRef.props || {};
    let checkBaseType = -1;
    // const checkBaseType = this.getTabBaseType(activeTreeNode);
    if (actionType === 'editGroup' || actionType === 'addGroup' || (actionType === 'loadChildren' && this.state.actionType === 'editGroup')) {
      checkBaseType = 3;
    } else if (actionType === 'editChild' || actionType === 'addChild' || (actionType === 'loadChildren' && this.state.actionType === 'editChild')) {
      checkBaseType = 1;
    }
    let matchTabList = this.state.matchTabList;
    let tabInfo = this.state.tabInfo;
    // 切换的节点表不同，需要切换至第一个面板
    // if (treeNodeData.type !== this.state.treeNodeData.type) {
    matchTabList = tabList.filter(item => item.visiabled === 1 && item.basetype === checkBaseType) || [];
    tabInfo = matchTabList.find(item => item.mainTab === 1) || matchTabList[0] || {};
    // }
    // form && form.resetFields();
    this.setState({
      originNode,
      treeNodeData,
      actionType,
      tabInfo,
      matchTabList,
      // elementMap: originElementMap,
      tabData: {},
      filePassList: {}
    }, () => {
      const { detailFormRef = {}, setContainerState, fetchTabDropDownData, getDefaultFormData } = this.contentContainerRef || {};
      const form = detailFormRef && detailFormRef.props && detailFormRef.props.form;
      form && form.resetFields();
      // 新增节点时，表单数据也要获取下拉数据
      // if ((actionType === 'addGroup' || actionType === 'addChild') && (tabInfo.showType === 2 || tabInfo.showType === 6)) {
      //   fetchTabDropDownData && fetchTabDropDownData();
      // }
      const frameContainerRef = this.contentContainerRef;
      const defaultFormData = getDefaultFormData && getDefaultFormData();
      setContainerState && setContainerState({
        formData: defaultFormData,
        elementMap: originElementMap,
        originFormData: defaultFormData,
        listQueryParams: {
          pageNum: 1,
          pageSize: 10,
        },
      }, () => {
        needFetchPageData && frameContainerRef && frameContainerRef.doFetchPageData();
      });
    });
  };
  // 关闭弹框
  handleClosePopup = () => {
    this.setState({ visiblePopupTab: false });
  };
  // 更新该组件内状态
  setFrameState = (itemObj, callback) => {
    this.setState(itemObj, () => callback && callback());
    console.log(itemObj)
  };

  render() {
    const { userInfo, functionData, tabs, user } = this.props;
    const { treeNodeData = {}, originNode, loadingStatus, treeData, matchTabList = [], tabData = {}, tabInfo = {}, actionType, frameData, tabDropDownList, triggerMap, elementMap, originElementMap, tabList, visiblePopupTab, popupTabInfo, popupBtn, listDataResult, treeKeyWords, originTabData, fileRelationList, pageFrameData, advancedQueryMap, filterMap, filePassList } = this.state;
    // 左侧树容器属性
    const leftTreeProps = {
      loading: loadingStatus.tree,
      treeData,
      treeNodeData,
      frameData,
      treeKeyWords,
      functionData,
      setFrameState: this.setFrameState,
      setTreeNodeData: this.setTreeNodeData,
      doFetchTree: this.doFetchTree,
      fetchFulTree: this.fetchFulTree,
      fetchSingleTreeNode: this.fetchSingleTreeNode,
      ref: ref => this.leftTreeRef = ref,
    };
    // 内容容器属性
    const contentProps = {
      tabs,
      user,
      userInfo,
      functionData,
      treeNodeData,
      frameData,
      doFetchTree: this.doFetchTree,
      advancedQueryMap,
      originTabData,
      tabInfo,
      elementMap,
      originElementMap,
      matchTabList,
      tabList,
      actionType,
      triggerMap,
      filterMap,
      setFrameState: this.setFrameState,
      ref: ref => this.contentContainerRef = ref,
      filePassList,
    };
    return (
      <CSpin spinning={loadingStatus.tree || loadingStatus.page}>
        <div className={styles.wrap}>
          <div className={styles.treeWrap}>
            <ResizableContainer>
              <LeftTree {...leftTreeProps} />
            </ResizableContainer>
          </div>
          <div className={styles.contentWrap}>
            {treeNodeData.id ? (
              <ContentContainer {...contentProps} />
            ) : ''}
          </div>
        </div>
      </CSpin>
    );
  }
}

export default TreeFrame;
