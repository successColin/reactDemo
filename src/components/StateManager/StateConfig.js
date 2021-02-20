/**
 *@author tjf
 *@2019/11/4 0014
 *@Description
 *状态管理
 */
import { Component } from 'react';
import { Form, message } from 'antd';
import { connect } from 'dva';
import DefaultFrame from '../Frames/DefaultFrame/DefaultFrame';
import { BaseContext } from '../../constants/global';
import FooterButton from '../common/FooterButton/FooterButton';
import CreateTree from '../common/CreateTree/CreateTree';
import DetailContent from './component/DetailContent';
import { getNodeDataFromTreeData, setNewActionType } from '@/utils/common';

import {
  getStateTree,
  addState,
  updateState,
  addStateGroup,
  updateStateGroup,
} from '@/services/stateManager';
import styles from '@/components/StateManager/stateConfig.less';

@connect(state => ({
  functionData: state.tabs.activeTabData.functionData,
}))
class StateManager extends Component {
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
  };

  componentDidMount() {
    this.fetchTree();
  }

  // 获取树数据
  fetchTree = (resData) => {
    this.setLoadingStatus('getTree', true);
    const { keywords } = this.state;
    getStateTree({ keywords }).then(treeData => {
      keywords && this.treeRef && this.treeRef.setSearchExpandKeys(treeData);
      this.setState({
        treeData,
      });
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
  // 根据操作类型获取对应接口配置
  getQueryConfig = (values) => {
    const { actionType, activeDetail, activeTreeNodeDetail } = this.state;
    const { id, pureId, isGroup, groupId, rootpath } = activeTreeNodeDetail;
    console.log(pureId, id, rootpath, actionType, activeTreeNodeDetail, activeDetail);
    // 保存元素时需要处理的参数
    // 新建组下元素传rootId=0, groupId=上层纯id
    // 新建元素下元素传rootId=上层纯id，grouptId=上层纯groupId
    switch (actionType) {
      case 'addGroup':
        return { // 新增组
          api: addStateGroup,
          params: {
            ...values,
            rootId: id,
            rootpath: rootpath ? `${rootpath}/${id}` : `/${id}`,
          },
        };
      case 'editGroup':
        return {
          api: updateStateGroup,
          params: {
            ...activeDetail,
            ...values,
          },
        };
      case 'addElement':
        return { // 新增元素
          api: addState,
          params: {
            ...values,
            planned: 0,
            groupId: id,
            rootId: 0,
            rootpath: rootpath ? `${rootpath}/${id}` : `/${id}`,
          },
        };
      case 'editElement':
        return { // 修改元素
          api: updateState,
          params: {
            ...values,
            id: id,
          },
        };
      default:
        return {
          api: addStateGroup,
          params: values,
        };
    }
  };

  // 更新状态
  updateFrameState = (itemObj) => {
    this.setState({ ...itemObj });
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
      this.setState({
        actionType: '',
      }, () => {
        this.fetchTree(res);
      });
    }, err => this.setLoadingStatus('saveBtn', false));
  };

  render() {
    const { activeDetail, activeTreeNodeDetail, actionType, loadingStatus, treeData, tableList, elementTypeList, tableColList } = this.state;
    const { form, functionData } = this.props;
    const { canmodify, canadd } = functionData.attributes;
    const isInitialData = !!((+activeTreeNodeDetail.initialData) && actionType !== 'addGroup');
    const detailContentProps = {
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
    };
    // 按钮配置
    const btnConfigs = [{
      type: 'primary',
      onClick: this.onSubmit,
      loading: loadingStatus.saveBtn,
    }];
    const createTreeConfig = {
      dataType: 'state',
      treeData,
      form,
      nodeConfig: {
        isMainTree: true,
        notGroupIcon: true,
      },
      functionData,
      activeTreeNodeDetail,
      needGetDetail: true,
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
      <Form className={styles.contentWrap}>
        <DetailContent {...detailContentProps} />
      </Form>
    ) : null;
    let footer = null;
    if (isInitlPage && !isInitialData) {
      if (canmodify && isInitlPage.indexOf('edit') > -1) {
        footer = <FooterButton btnConfigs={btnConfigs}/>;
      }
      ;
      if (canadd && isInitlPage.indexOf('add') > -1) {
        footer = <FooterButton btnConfigs={btnConfigs}/>;
      }
      ;
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

export default Form.create()(StateManager);
