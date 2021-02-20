/*
 * @Description: 知识库
 * @Author: tjf
 * @Date: 2019/8/14 15:14:19
 * @LastEditTime: 2020-05-29 15:04:28
 * @LastEditors: tjf
 */
import React, { Component } from 'react';
import { Form } from 'antd';
import { connect } from 'dva';
import DefaultFrame from '../Frames/DefaultFrame/DefaultFrame';
import { BaseContext } from '../../constants/global';
import CreateTree from '../common/CreateTree/CreateTree';
import { CMessage } from '@/components/common/BasicWidgets';
import FileConfigDetial from './component/fileDetial';
import { getNodeDataFromTreeData, setNewActionType } from '@/utils/common';

import {
  getFilesTree,
  createFileGroup,
  getFilesDetails,
  updateFileGroup,
} from '@/services/knowledgeBase';
import styles from '@/components/knowledgeBase/knowledgeBase.less';

@connect(state => ({
  functionData: state.tabs.activeTabData.functionData,
  userInfo: state.user.userInfo,
  tabs: state.tabs,
}))
class knowledgeBaseConfig extends Component {
  static contextType = BaseContext;

  constructor(props) {
    super(props);
    this.state = {
      tabActive: 'base', // 激活的面板
      treeData: [], // 树数据
      activeTreeNodeDetail: {}, // 当前选中的树节点信息
      activeDetail: {}, // 根据树节点信息获取的该节点具体详情
      editActiveDetail: {}, // 根据树节点信息获取的该节点具体详情
      actionType: '', // 操作类型
      loadingStatus: { // loading状态
        saveBtn: false, // 保存按钮
        getDetail: false, // 点击树节点获取详情
        getTree: false, // 获取树数据
      },
      visible: false,
      groupId: '',
      rootId: '',
      keywords: '', // 关键字
    };
  }

  componentDidMount() {
    this.fetchTree();
  }

  // 获取树数据
  fetchTree = (keywords, key) => {
    this.setLoadingStatus('getTree', true);
    let reqParams = { keywords: keywords };
    if (key) {
      reqParams = { nodeKey: key };
    }
    getFilesTree(reqParams).then(treeData => {
      if (!treeData.length) return;
      this.initData();
      let nodeKey = treeData[0].nodeKey;
      if (reqParams.nodeKey) {
        nodeKey = reqParams.nodeKey;
      }
      const activeTreeNodeDetail = getNodeDataFromTreeData(nodeKey, treeData);
      this.setState({
        treeData,
        activeTreeNodeDetail,
        actionType: setNewActionType(this.state.actionType),
      });
      this.setLoadingStatus('getTree', false);
    }, err => this.setLoadingStatus('getTree', false));
  };
  // 更新状态
  updateFrameState = (itemObj) => {
    this.setState({
      ...itemObj,
      tabActive: 'base',
      rootId: itemObj.activeTreeNodeDetail.id,
      activeTreeNodeDetail: itemObj.activeTreeNodeDetail,
    });
  };
  // 关闭新建文件夹弹窗
  hideModal = (e) => {
    this.setState({
      visible: false,
      editActiveDetail: {},
    });
  };
  // 编辑文件夹弹窗
  showModalEdit = (item) => {
    this.setState({
      visible: true,
      editActiveDetail: item,
    });
  };
  // 确认新建文件夹
  addFileGroupFunction = (e, param) => {
    const { langLib } = this.context;
    const { activeTreeNodeDetail } = this.state;
    createFileGroup(param).then(res => {
      this.fetchTree('', activeTreeNodeDetail.nodeKey);
      this.setState({
        visible: false,
        editActiveDetail: {},
      });
      CMessage(langLib['message.save.success'], 'success');
    }, err => this.setLoadingStatus('getTree', false));
  };
  // 修改文件夹
  editFileGroupFunction = (e, param) => {
    const { langLib } = this.context;
    const { activeTreeNodeDetail } = this.state;
    updateFileGroup(param).then(res => {
      this.fetchTree('', activeTreeNodeDetail.nodeKey);
      getFilesDetails({ groupId: activeTreeNodeDetail.id }).then(activeDetail => {
        this.updateFrameState({
          activeTreeNodeDetail,
          activeDetail,
          actionType: 'editGroup',
        });
      });
      this.setState({
        visible: false,
        editActiveDetail: {},
      });
      CMessage(langLib['message.save.success'], 'success');
    }, err => this.setLoadingStatus('getTree', false));
  };
  // 更新loading状态
  setLoadingStatus = (type, loading) => {
    const { loadingStatus } = this.state;
    this.setState({
      loadingStatus: {
        ...loadingStatus,
        [type]: loading,
      },
    });
  };
  //
  undateFileDetails = (data) => {
    this.setState({
      activeDetail: data,
    });
    // this.fetchTree('', this.state.activeTreeNodeDetail.nodeKey);
  };
  // 清空表单
  resetDetailForm = () => {
    this.props.form.resetFields();
  };
  //
  initData = () => {
    const param = { groupId: 1 };
    getFilesDetails(param).then(activeDetail => {
      this.setState({
        activeDetail,
      });
    });
  };
  // 列表搜索
  searchFiles = (name) => {
    const param = {
      name: name,
      groupId: this.state.groupId || 1,
    };
    getFilesDetails(param).then(activeDetail => {
      this.setState({
        activeDetail,
      });
    });
  };

  render() {
    const { activeDetail, activeTreeNodeDetail, actionType, loadingStatus, treeData } = this.state;
    const { form, functionData } = this.props;
    // 按钮配置
    const btnConfigs = [{
      type: 'primary',
      onClick: this.onSubmit,
      loading: loadingStatus.saveBtn,
    }];
    const createTreeConfig = {
      dataType: 'fileGroup',
      treeData,
      form,
      nodeConfig: {
        isMainTree: true,
        notGroupIcon: true,
      },
      activeTreeNodeDetail,
      needGetDetail: true,
      needRightMenu: true,
      fetchTree: this.fetchTree,
      loading: loadingStatus.getTree,
      setLoadingStatus: this.setLoadingStatus,
      updateFrameState: this.updateFrameState,
      resetDetailForm: this.resetDetailForm,
      type: 'fileGroup', // 类型是角色
      setGetDetailLoading: loading => this.setLoadingStatus('getDetail', loading),
      functionData,
    };
    const sider = (
      <CreateTree {...createTreeConfig} />
    );
    const tabDefaultConfig = {
      className: styles.roleTab,
      activeDetail,
      tabsActive: this.state.tabActive,
      changeTab: this.changeTabs,
      actionType,
      loading: loadingStatus.getDetail, // 点击树节点获取详情
      updateFrameState: this.updateFrameState,
      form,
      visible: this.state.visible,
      hideModal: this.hideModal,
      addFileGroupFunction: this.addFileGroupFunction,
      groupId: this.state.groupId,
      rootId: this.state.rootId,
      activeTreeNodeDetail,
      treeData,
      fetchTree: this.fetchTree,
      undateFileDetails: this.undateFileDetails,
      showModalEdit: this.showModalEdit,
      editActiveDetail: this.state.editActiveDetail,
      editFileGroupFunction: this.editFileGroupFunction,
      setLoadingStatus: this.setLoadingStatus,
      searchFiles: this.searchFiles,
      functionData,
    };
    const tabs = <FileConfigDetial tabDefaultConfig={tabDefaultConfig}/>;
    ;
    // if (JSON.stringify(activeTreeNodeDetail) === '{}') {
    //   // tabs = null;
    //   tabs = <FileConfigDetial tabDefaultConfig={tabDefaultConfig}/>;
    // } else {
    //   tabs = <FileConfigDetial tabDefaultConfig={tabDefaultConfig}/>;
    // }
    const footer = null;
    return (
      <DefaultFrame
        sider={sider}
        content={tabs}
        footer={footer}
        config={{
          handleSearch: keywords => this.setState({ keywords }, () => this.fetchTree(keywords)),
        }}
      />
    );
  }
}

const knowledgeBase = Form.create({})(knowledgeBaseConfig);
export default knowledgeBase;
