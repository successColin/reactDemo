/*
 * @Author: Fus
 * @Date:   2019-08-26 09:00:50
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2019-12-13 15:55:39
 * @Desc: 移动端bundle管理
 */
import { Component } from 'react';
import { Form } from 'antd';
import { connect } from 'dva';
import { CMessage } from '@/components/common/BasicWidgets';
import { BaseContext } from '../../constants/global';
import DefaultFrame from '../Frames/DefaultFrame/DefaultFrame';
import FooterButton from '../common/FooterButton/FooterButton';
import CreateTree from '../common/CreateTree/CreateTree';
import GroupForm from './GroupForm/GroupForm';
import BundleDetail from './BundleDetail/BundleDetail';
import {
  getBundleLibraryJsonTree,
  insertOrUpdateBundle,
  insertOrUpdateBundleGroup,
  getFrameBundleTypeList,
} from '@/services/bundleConfig';
import { getNodeDataFromTreeData, setNewActionType } from '@/utils/common';

@connect(state => ({
  functionData: state.tabs.activeTabData.functionData,
}))
class BundleConfig extends Component {
  static contextType = BaseContext;
  state = {
    treeData: [], // 树数据
    activeTreeNodeDetail: {}, // 当前选中的树节点信息
    activeDetail: {}, // 根据树节点信息获取的该节点具体详情
    actionType: '', // 操作类型
    bundleFrameTypeList: [], // 框架类型列表
    keywords: '', // 关键字
    loadingStatus: { // loading状态
      saveBtn: false, // 保存按钮
      getDetail: false, // 点击树节点获取详情
      getTree: false, // 获取树数据
    },
  };

  componentDidMount() {
    this.fetchTree();
    this.fetchFrameList();
  }

  // 获取树数据
  fetchTree = (resData) => {
    this.setLoadingStatus('getTree', true);
    const { keywords } = this.state;
    getBundleLibraryJsonTree({ keywords }).then((treeData = {}) => {
      keywords && this.treeRef && this.treeRef.setSearchExpandKeys(treeData);
      this.setState({ treeData });
      if (resData) {
        const activeTreeNodeDetail = getNodeDataFromTreeData(resData.nodeKey, treeData);
        this.setState({
          activeDetail: resData,
          // activeTreeNodeDetail,
          actionType: setNewActionType(this.state.actionType),
        });
        this.props.form.resetFields();
      }
      this.setLoadingStatus('getTree', false);
    }, err => this.setLoadingStatus('getTree', false));
  };
  // 获取框架类型
  fetchFrameList = () => {
    getFrameBundleTypeList({}).then(bundleFrameTypeList => this.setState({ bundleFrameTypeList }));
  };
  updateFrameState = (itemObj, callback) => {
    this.setState(itemObj, () => callback && callback());
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
  handleSubmit = () => {
    const { form } = this.props;
    const { langLib } = this.context;
    const { activeDetail = {}, activeTreeNodeDetail = {}, actionType } = this.state;
    form.validateFields((errs, values) => {
      if (errs) return false;
      const { api, params } = this.getQueryConfig(values);
      console.log('aaa submit', params);
      this.setLoadingStatus('saveBtn', true);
      api(params).then(res => {
        CMessage(langLib['message.save.success'], 'success');
        this.setLoadingStatus('saveBtn', false);
        actionType === 'editGroup' && this.setState({ activeDetail: res });
        this.props.form.resetFields();
        this.fetchTree(res);
      }, err => this.setLoadingStatus('saveBtn', false));
    });
  };
  // 根据操作类型获取对应接口配置
  getQueryConfig = (values) => {
    const { actionType, activeDetail, activeTreeNodeDetail } = this.state;
    const { id, rootpath } = activeTreeNodeDetail;
    switch (actionType) {
      case 'addGroup':
        return { // 新增组
          api: insertOrUpdateBundleGroup,
          params: {
            ...values,
            rootId: id,
            rootpath: rootpath ? `${rootpath}/${id}` : `/${id}`,
          },
        };
      case 'editGroup':
        return { // 修改组
          api: insertOrUpdateBundleGroup,
          params: {
            ...activeDetail,
            ...values,
          },
        };
      case 'addElement':
        return { // 新增bundle
          api: insertOrUpdateBundle,
          params: {
            ...activeDetail,
            ...values,
            groupId: id,
            rootId: 0,
            rootpath: `${rootpath}/${id}`,
            name: activeDetail.name,
          },
        };
      case 'editElement':
        return { // 修改bundle
          api: insertOrUpdateBundle,
          params: {
            ...activeDetail,
            ...values,
            id,
            name: activeDetail.name,
          },
        };
      default:
        return {};
    }
  };
  // 清空表单
  resetDetailForm = () => {
    this.props.form.resetFields();
  };

  render() {
    const { activeDetail, loadingStatus, treeData, tableColList, activeTreeNodeDetail, actionType, bundleFrameTypeList } = this.state;
    const { form, functionData } = this.props;
    const { canmodify, canadd } = functionData.attributes;
    const isInitialData = !!((+activeTreeNodeDetail.initialData) && actionType !== 'addGroup');
    const contentContainerProps = {
      form,
      activeDetail,
      activeTreeNodeDetail,
      actionType,
      isInitialData,
      bundleFrameTypeList,
      loading: loadingStatus.getDetail,
      setPageConfigState: this.setPageConfigState,
      updateFrameState: this.updateFrameState,
    };
    // 按钮配置
    const btnConfigs = [{
      type: 'primary',
      onClick: this.handleSubmit,
      loading: loadingStatus.saveBtn,
    }];
    const createTreeConfig = {
      functionData,
      dataType: 'bundleConfig',
      treeData,
      form,
      nodeConfig: {
        notGroupIcon: 'line-tree',
        isMainTree: true,
      },
      activeTreeNodeDetail,
      needRightMenu: true,
      fetchTree: this.fetchTree,
      loading: loadingStatus.getTree,
      resetDetailForm: this.resetDetailForm,
      setLoadingStatus: this.setLoadingStatus,
      updateFrameState: this.updateFrameState,
      setGetDetailLoading: loading => this.setLoadingStatus('getDetail', loading),
      ref: ref => this.treeRef = ref,
    };
    const sider = (
      <CreateTree {...createTreeConfig} />
    );
    const isInitlPage = (treeData.length && actionType);
    const content = isInitlPage ? (
      <Form>
        {(actionType === 'editGroup' || actionType === 'addGroup') ? (
          <GroupForm {...contentContainerProps} />
        ) : (
          <BundleDetail {...contentContainerProps} />
        )}
      </Form>
    ) : null;
    // const footer = (isInitlPage && !isInitialData) ? <FooterButton btnConfigs={btnConfigs}/> : null;
    let footer = null;
    if (isInitlPage && !isInitialData) {
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
          handleSearch: keywords => this.setState({ keywords }, () => this.fetchTree()),
        }}
      />
    );
  }
}

export default Form.create()(BundleConfig);
