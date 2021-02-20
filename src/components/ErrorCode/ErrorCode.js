/**
 *@author tjf
 *@2019/11/4 0014
 *@Description
 *状态管理
 */
import { Component, Fragment } from 'react';
import { Form, message } from 'antd';
import { connect } from 'dva';
import { CSearch } from '../common/BasicWidgets/index';
import DefaultFrame from '../Frames/DefaultFrame/DefaultFrame';
import { BaseContext } from '../../constants/global';
import FooterButton from '../common/FooterButton/FooterButton';
import CreateTree from '../common/CreateTree/CreateTree';
import DetailContent from './component/DetailContent';

import {
  getErrorCodeTree,
  addErrorCodeGroup,
  updateErrorCodeGroup,
  addErrorCodeRelations,
  updateErrorCodeRelations,
  getErrorCodeIList,
  getErrorCodeIIList,
  getErrorCodeIIIList,
  getTreeDataByAsync,
} from '@/services/errorCode';
import styles from '@/components/ErrorCode/errorCode.less';
import { getUserGroup } from '@/services/userManager';

@connect(state => ({
  functionData: state.tabs.activeTabData.functionData,
  userInfo: state.user.userInfo,
}))
class ErrorCode extends Component {
  static contextType = BaseContext;
  state = {
    treeData: [], // 树数据
    activeTreeNodeDetail: {}, // 当前选中的树节点信息
    activeDetail: {}, // 根据树节点信息获取的该节点具体详情
    actionType: '', // 操作类型
    defaultframeId: '', // 功能库id
    keywords: '', // 关键字
    loadingStatus: { // loading状态
      saveBtn: false, // 保存按钮
      getDetail: false, // 点击树节点获取详情
      getTree: false, // 获取树数据
    },
    visibleErrorCodeI: false,
    visibleErrorCodeII: false,
    visibleErrorCodeIII: false,
    errorCodeIDetail: {}, // 故障现象列表
    errorCodeIIDetail: {}, // 故障原因列表
    errorCodeIIIDetail: {}, // 故障措施列表
    relationTableName: '',
  };

  componentDidMount() {
    this.fetchTree();
    this.fetchErrorCodeI();
    this.fetchErrorCodeII();
    this.fetchErrorCodeIII();
  }

  // 获取树数据
  fetchTree = (isLoad = false) => {
    this.setLoadingStatus('getTree', true);
    const { keywords } = this.state;
    let api = keywords ? getErrorCodeTree : getTreeDataByAsync;
    let params = keywords ? { keywords } : { nodeId: 'G0', rootPath: '' };
    api(params).then(treeData => {
      (isLoad || keywords) && this.treeRef && this.treeRef.setSearchExpandKeys(treeData);
      this.setState({
        treeData,
      });
      this.setLoadingStatus('getTree', false);
    }, err => this.setLoadingStatus('getTree', false));
  };
  // 异步加载
  loadMoreData = (treeNode, needFetch) => {
    const { treeData, keywords } = this.state;
    return new Promise(resolve => {
      const { props } = treeNode;
      if (!needFetch) {
        resolve();
        return;
      }
      const { isGroup, id, rootpath, rootId, type, errorcodeGroupId, groupId } = treeNode.props.nodeData;
      let params = {};
      if (isGroup && rootId === 0) {
        params = { nodeId: 'G1', rootPath: rootpath };
      } else if (isGroup && rootId) {
        params = { nodeId: `G${id}`, rootPath: rootpath, errorcodeGroupId: id };
      } else if (type === 'ERRORCODEI') {
        params = { nodeId: `A${id}`, rootPath: rootpath, errorcodeGroupId };
      } else if (type === 'ERRORCODEII') {
        params = { nodeId: `B${id}`, rootPath: rootpath, errorcodeGroupId };
      } else if (type === 'ERRORCODEIII') {
        params = { nodeId: `C${id}`, rootPath: rootpath, errorcodeGroupId };
      }
      getTreeDataByAsync(params).then((res = []) => {
        let newRes = res.map((item, index) => {
          return {
            ...item,
            nodeKey: item.nodeKey + index + item.errorcodeGroupId + item.groupId,
          };
        });
        treeNode.props.nodeData.children = newRes;
        let state = {
          treeData: [...this.state.treeData],
        };
        if (isGroup) state.errorcodeGroupId = id;

        this.setState(state);
        resolve();
      });
    });
  };
  // 获取故障现象列表
  fetchErrorCodeI = (keywords) => {
    const { userInfo } = this.props;
    const token = userInfo.token;
    getErrorCodeIList({ token, keywords }).then(errorCodeIDetail => {
      this.setState({
        errorCodeIDetail,
      });
    });
  };
  // 获取故障原因列表
  fetchErrorCodeII = (keywords) => {
    const { userInfo } = this.props;
    const token = userInfo.token;
    getErrorCodeIIList({ token, keywords }).then(errorCodeIIDetail => {
      this.setState({
        errorCodeIIDetail,
      });
    });
  };
  // 获取故障措施列表
  fetchErrorCodeIII = (keywords) => {
    const { userInfo } = this.props;
    const token = userInfo.token;
    getErrorCodeIIIList({ token, keywords }).then(errorCodeIIIDetail => {
      this.setState({
        errorCodeIIIDetail,
      });
    });
  };
  // 根据操作类型获取对应接口配置
  getQueryConfig = (values) => {
    const { actionType, activeDetail, activeTreeNodeDetail } = this.state;
    const { id, pureId, isGroup, groupId, rootpath } = activeTreeNodeDetail;
    // 保存元素时需要处理的参数
    // 新建组下元素传rootId=0, groupId=上层纯id
    // 新建元素下元素传rootId=上层纯id，grouptId=上层纯groupId
    switch (actionType) {
      case 'addGroup':
        return { // 新增组
          api: addErrorCodeGroup,
          params: {
            ...values,
            rootId: id,
            rootpath: rootpath ? `${rootpath}/${id}` : `/${id}`,
          },
        };
      case 'editGroup':
        return {
          api: updateErrorCodeGroup,
          params: {
            ...values,
            rootpath: rootpath ? `${rootpath}/${id}` : `/${id}`,
          },
        };
      case 'editElement':
        return { // 修改元素
          api: updateErrorCodeRelations,
          params: {
            ...values,
            id: id,
          },
        };
      case 'ERRORCODEI':
        return { // 关联故障现象
          api: addErrorCodeRelations,
          params: {
            ...values,
            id: id,
          },
        };
      case 'ERRORCODEII':
        return { // 修改元素
          api: updateErrorCodeRelations,
          params: {
            ...values,
            id: id,
          },
        };
      case 'ERRORCODEIII':
        return { // 修改元素
          api: updateErrorCodeRelations,
          params: {
            ...values,
            id: id,
          },
        };
      default:
        return {
          api: addErrorCodeGroup,
          params: values,
        };
    }
  };

  // 更新状态
  updateFrameState = (itemObj) => {
    this.setState({ ...itemObj });
  };
  // 关闭关联故障弹窗
  hideModal = (e) => {
    this.setState({
      visibleErrorCodeI: false,
      visibleErrorCodeII: false,
      visibleErrorCodeIII: false,
    });
    this.fetchErrorCodeI();
    this.fetchErrorCodeII();
    this.fetchErrorCodeIII();
  };
  // 更新颜色
  updateColor = (detail) => {
    this.setState({ activeDetail: { ...detail } });
  };
  // 设置功能库id
  setDefaultframeId = (defaultframeId) => {
    this.setState({
      defaultframeId: defaultframeId,
    });
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
  // 点击保存
  onSubmit = () => {
    this.props.form.validateFields((errs, values) => {
      if (errs) return;
      this.setLoadingStatus('saveBtn', true);
      this.handleSave(values);
    });
  };
  // 清空表单
  resetDetailForm = () => {
    this.props.form.resetFields();
  };
  // 保存
  handleSave = (values) => {
    const { langLib } = this.context;
    const { api, params } = this.getQueryConfig(values);
    api(params).then(res => {
      message.success(langLib['message.save.success']);
      this.setLoadingStatus('saveBtn', false);
      this.fetchTree(true);
    }, err => this.setLoadingStatus('saveBtn', false));
  };
  // 关联关系
  handleSaveRelation = (params) => {
    const { langLib } = this.context;
    addErrorCodeRelations(params).then(res => {
      message.success(langLib['message.save.success']);
      this.fetchTree(true);
      this.setState({
        visibleErrorCodeI: false,
        visibleErrorCodeII: false,
        visibleErrorCodeIII: false,
        actionType: '',
      });
      this.fetchErrorCodeI();
      this.fetchErrorCodeII();
      this.fetchErrorCodeIII();
    });
  };

  render() {
    const { activeDetail, activeTreeNodeDetail, actionType, loadingStatus, treeData, tableList, elementTypeList, tableColList, visibleErrorCodeI, visibleErrorCodeII, visibleErrorCodeIII, errorCodeIDetail, errorCodeIIDetail, errorCodeIIIDetail, relationTableName, errorcodeGroupId } = this.state;
    const { form, functionData } = this.props;
    const { canmodify, canadd, candelete } = functionData.attributes;
    const isInitialData = !!((+activeTreeNodeDetail.initialData) && actionType !== 'addGroup');
    const detailContentProps = {
      errorcodeGroupId,
      form,
      tableList,
      elementTypeList,
      tableColList,
      activeDetail,
      activeTreeNodeDetail,
      actionType,
      isInitialData,
      loading: loadingStatus.getDetail,
      updateFrameState: this.updateFrameState,
      setDefaultframeId: this.setDefaultframeId,
      updateColor: this.updateColor,
      treeData,
      visibleErrorCodeI,
      visibleErrorCodeII,
      visibleErrorCodeIII,
      errorCodeIDetail,
      errorCodeIIDetail,
      errorCodeIIIDetail,
      hideModal: this.hideModal,
      relationTableName,
      handleSaveRelation: this.handleSaveRelation,
      fetchErrorCodeIII: this.fetchErrorCodeIII,
      fetchErrorCodeII: this.fetchErrorCodeII,
      fetchErrorCodeI: this.fetchErrorCodeI,
    };
    // 按钮配置
    const btnConfigs = [{
      type: 'primary',
      onClick: this.onSubmit,
      loading: loadingStatus.saveBtn,
    }];
    const createTreeConfig = {
      functionData,
      dataType: 'ErrorCode',
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
      resetDetailForm: this.resetDetailForm,
      setLoadingStatus: this.setLoadingStatus,
      updateFrameState: this.updateFrameState,
      isErrorCode: true,
      loadData: this.loadMoreData,
      setGetDetailLoading: loading => this.setLoadingStatus('getDetail', loading),
      relationTableName,
      ref: ref => this.treeRef = ref,
    };
    const sider = (
      <CreateTree {...createTreeConfig} />
    );
    const { isGroup } = activeTreeNodeDetail;
    const isInitlPage = (treeData.length && actionType);
    const content = isInitlPage ? (
      <Form className={styles.contentWrap}>
        <DetailContent {...detailContentProps} />
      </Form>
    ) : null;
    // const footer = (isInitlPage && !isInitialData && isGroup) ? <FooterButton btnConfigs={btnConfigs}/> : null;
    let footer = null;
    if (isInitlPage && !isInitialData && isGroup) {
      if (isInitlPage.indexOf('add') > -1 && canadd) {
        footer = <FooterButton btnConfigs={btnConfigs}/>;
      }
      if (isInitlPage.indexOf('edit') > -1 && canmodify) {
        footer = <FooterButton btnConfigs={btnConfigs}/>;
      }
    }
    return (
      <DefaultFrame
        sider={sider}
        content={content}
        footer={footer}
        config={{
          handleSearch: keywords => this.setState({ keywords }, () => this.fetchTree(true)),
        }}
      />
    );
  }
}

export default Form.create()(ErrorCode);
