/*
 * @Author: Fus
 * @Date:   2019-09-09 14:19:17
 * @Desc: APP档案
 */
import { Component } from 'react';
import { Form } from 'antd';
import { connect } from 'dva';
import { CMessage } from '@/components/common/BasicWidgets';
import { BaseContext } from '../../constants/global';
import DefaultFrame from '../Frames/DefaultFrame/DefaultFrame';
import FooterButton from '../common/FooterButton/FooterButton';
import CreateTree from '../common/CreateTree/CreateTree';
import TabContainer from './TabContainer/TabContainer';
import { getAppGroupTree, insertOrUpdateAppGroup, insertOrUpdateApp, getAppList } from '@/services/appLibrary';
import { getNodeDataFromTreeData, setNewActionType } from '@/utils/common';
import styles from './AppLibrary.less';

@connect(state => ({
  functionData: state.tabs.activeTabData.functionData,
}))
class AppConfig extends Component {
  static contextType = BaseContext;
  state = {
    treeData: [], // 树数据
    activeTreeNodeDetail: {}, // 当前选中的树节点信息
    activeDetail: {}, // 根据树节点信息获取的该节点具体详情
    actionType: '', // 操作类型
    bundleFrameTypeList: [], // 框架类型列表
    activeTabKey: 'basicProps', // 右侧主内容tabkey
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
    getAppGroupTree({ keywords }).then((treeData = {}) => {
      keywords && this.treeRef && this.treeRef.setSearchExpandKeys(treeData);
      this.setState({ treeData });
      if (resData) {
        this.tabContainerRef.groupForm.props.form.resetFields();
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
  // 获取APP列表
  fetchAppList = () => {
    const { activeTreeNodeDetail } = this.state;
    this.setLoadingStatus('getDetail', true);
    getAppList({ groupId: activeTreeNodeDetail.id }).then((res = []) => {
      this.setLoadingStatus('getDetail', false);
      this.setState({ appList: res || [] });
    }, err => this.setLoadingStatus('getDetail', false));
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
    const { form } = this.tabContainerRef.groupForm.props;
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
        form.resetFields();
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
          api: insertOrUpdateAppGroup,
          params: {
            ...values,
            rootId: id,
            rootpath: rootpath ? `${rootpath}/${id}` : `/${id}`,
          },
        };
      case 'editGroup':
        return { // 修改组
          api: insertOrUpdateAppGroup,
          params: {
            ...activeDetail,
            ...values,
          },
        };
      case 'addElement':
        return { // 新增用户设计组
          api: insertOrUpdateApp,
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
          api: insertOrUpdateApp,
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
  // 点击树节点获取详情后
  handleAfterGetDetail = () => {
    this.fetchAppList();
    this.setState({ activeTabKey: 'basicProps' });
  };
  // 清空表单
  resetDetailForm = () => {
    this.tabContainerRef && this.tabContainerRef.groupForm && this.tabContainerRef.groupForm.props.form.resetFields();
  };

  render() {
    const { activeDetail, loadingStatus, treeData, tableColList, activeTreeNodeDetail, actionType, bundleFrameTypeList, appList, activeTabKey } = this.state;
    // const { form } = this.tabContainerRef.groupForm.props;
    const { functionData } = this.props;
    const isInitialData = !!((+activeTreeNodeDetail.initialData) && actionType !== 'addGroup');
    const contentContainerProps = {
      // form,
      functionData,
      activeDetail,
      activeTreeNodeDetail,
      actionType,
      isInitialData,
      bundleFrameTypeList,
      appList,
      activeTabKey,
      loading: loadingStatus.getDetail,
      setPageConfigState: this.setPageConfigState,
      updateFrameState: this.updateFrameState,
      fetchAppList: this.fetchAppList,
      ref: ref => this.tabContainerRef = ref,
    };
    // 按钮配置
    const btnConfigs = [{
      type: 'primary',
      onClick: this.handleSubmit,
      loading: loadingStatus.saveBtn,
    }];
    const createTreeConfig = {
      functionData,
      dataType: 'appLibrary',
      treeData,
      // form,
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
      handleAfterGetDetail: this.handleAfterGetDetail,
      setGetDetailLoading: loading => this.setLoadingStatus('getDetail', loading),
      ref: ref => this.treeRef = ref,
    };
    const sider = (
      <CreateTree {...createTreeConfig} />
    );
    const { canmodify, canadd, candelete } = functionData.attributes;
    const isInitlPage = (treeData.length && actionType && JSON.stringify(activeTreeNodeDetail) !== '{}');
    const content = isInitlPage ? (
      <Form className={styles.form}>
        <TabContainer {...contentContainerProps} />
      </Form>
    ) : null;
    let footer = null;
    // const footer = (isInitlPage && !isInitialData) ? <FooterButton btnConfigs={btnConfigs}/> : null;
    if (isInitlPage && !isInitialData) {
      if (canmodify && actionType.indexOf('edit') > -1) {
        footer = <FooterButton btnConfigs={btnConfigs}/>;
      }
      if (canadd && actionType.indexOf('add') > -1) {
        footer = <FooterButton btnConfigs={btnConfigs}/>;
      }
    }
    return (
      <DefaultFrame
        sider={sider}
        content={content}
        footer={footer}
        config={{
          contentPadding: false,
          handleSearch: keywords => this.setState({ keywords }, () => this.fetchTree()),
        }}
      />
    );
  }
}

export default AppConfig;
