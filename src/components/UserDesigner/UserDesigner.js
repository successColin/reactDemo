/*
 * @Author: Fus
 * @Date:   2019-08-26 09:00:50
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2019-12-13 10:51:30
 * @Desc: 用户设计组管理
 */
import { Component } from 'react';
import { Form } from 'antd';
import { connect } from 'dva';
import { CMessage } from '@/components/common/BasicWidgets';
import { BaseContext } from '../../constants/global';
import DefaultFrame from '../Frames/DefaultFrame/DefaultFrame';
import FooterButton from '../common/FooterButton/FooterButton';
import CreateTree from '../common/CreateTree/CreateTree';
import ContentContainer from './ContentContainer/ContentContainer';
import {
  getUserDesignerTree,
  insertUserDesigner,
  insertUserDesignerGroup,
  updateUserDesigner,
  updateUserDesignerGroup,
} from '@/services/userDesigner';
import { getNodeDataFromTreeData, setNewActionType } from '@/utils/common';

@connect(state => ({
  functionData: state.tabs.activeTabData.functionData,
}))
class UserDesigner extends Component {
  static contextType = BaseContext;
  state = {
    treeData: [], // 树数据
    activeTreeNodeDetail: {}, // 当前选中的树节点信息
    activeDetail: {}, // 根据树节点信息获取的该节点具体详情
    actionType: '', // 操作类型
    keywords: '', // 关键字
    loadingStatus: { // loading状态
      saveBtn: false, // 保存按钮
      getDetail: false, // 点击树节点获取详情
      getTree: false, // 获取树数据
    },
  };

  componentDidMount() {
    this.fetchTree();
  }

  // 获取树数据
  fetchTree = (resData) => {
    this.setLoadingStatus('getTree', true);
    const { keywords } = this.state;
    getUserDesignerTree({ keywords }).then(treeData => {
      this.setState({ treeData });
      keywords && this.treeRef && this.treeRef.setSearchExpandKeys(treeData);
      if (resData) {
        this.props.form.resetFields();
        const activeTreeNodeDetail = getNodeDataFromTreeData(resData.nodeKey, treeData);
        this.setState({
          activeDetail: resData,
          activeTreeNodeDetail,
          actionType: setNewActionType(this.state.actionType),
        });
      }
      this.setLoadingStatus('getTree', false);
    }, err => this.setLoadingStatus('getTree', false));
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
  // 重置
  resetDetailForm = () => {
    this.props.form.resetFields();
  };
  // 根据操作类型获取对应接口配置
  getQueryConfig = (values) => {
    const { actionType, activeDetail, activeTreeNodeDetail } = this.state;
    const { id, rootpath } = activeTreeNodeDetail;
    switch (actionType) {
      case 'addGroup':
        return { // 新增组
          api: insertUserDesignerGroup,
          params: {
            ...values,
            rootId: id,
            rootpath: rootpath ? `${rootpath}/${id}` : `/${id}`,
          },
        };
      case 'editGroup':
        return { // 修改组
          api: updateUserDesignerGroup,
          params: {
            ...activeDetail,
            ...values,
          },
        };
      case 'addElement':
        return { // 新增用户设计组
          api: insertUserDesigner,
          params: {
            ...activeDetail,
            ...values,
            groupId: id,
            rootId: 0,
            rootpath: `${rootpath}/${id}`,
          },
        };
      case 'editElement':
        return { // 修改用户设计组
          api: updateUserDesigner,
          params: {
            ...activeDetail,
            ...values,
            id,
          },
        };
      default:
        return {};
    }
  };

  render() {
    const { activeDetail, loadingStatus, treeData, tableColList, activeTreeNodeDetail, actionType } = this.state;
    const { form, functionData } = this.props;
    const { canmodify, canadd } = functionData.attributes;
    const isInitialData = !!((+activeTreeNodeDetail.initialData) && actionType !== 'addGroup');
    const contentContainerProps = {
      form,
      activeDetail,
      activeTreeNodeDetail,
      actionType,
      isInitialData,
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
      dataType: 'userDesigner',
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
      ref: ref => this.treeRef = ref,
      setGetDetailLoading: loading => this.setLoadingStatus('getDetail', loading),
    };
    const sider = (
      <CreateTree {...createTreeConfig} />
    );
    const isInitlPage = (treeData.length && actionType);
    const content = isInitlPage ? (
      <Form>
        <ContentContainer {...contentContainerProps} />
      </Form>
    ) : null;
    let footer = null;
    if (isInitlPage && !isInitialData) {
      if (isInitlPage.indexOf('add') > -1 && canadd) {
        footer = <FooterButton btnConfigs={btnConfigs}/>;
      }
      if (isInitlPage.indexOf('edit') > -1 && canmodify) {
        footer = <FooterButton btnConfigs={btnConfigs}/>;
      }
    }
    // const footer = (isInitlPage && !isInitialData) ? <FooterButton btnConfigs={btnConfigs}/> : null;
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

export default Form.create()(UserDesigner);
