/*
 * @Author: Fus
 * @Date:   2019-08-07 13:36:59
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2019-12-13 15:18:56
 * @Desc: 界面配置（预设界面）
 */
import { Component, Fragment } from 'react';
import { Form, message } from 'antd';
import DefaultFrame from '../Frames/DefaultFrame/DefaultFrame';
import { connect } from 'dva';
import { BaseContext } from '../../constants/global';
import FooterButton from '../common/FooterButton/FooterButton';
import CreateTree from '../common/CreateTree/CreateTree';
import ContentContainer from './ContentContainer/ContentContainer';
import { CMessage } from '@/components/common/BasicWidgets';
import { getTabTree, insertTabGroup, updateTabGroup, insertTab, updateTab } from '@/services/pageConfig';
import { getNodeDataFromTreeData, setNewActionType } from '@/utils/common';
import styles from './PageConfig.less';

@connect(state => ({
  functionData: state.tabs.activeTabData.functionData,
}))
class PageConfig extends Component {
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
    getTabTree({ keywords }).then(treeData => {
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
        this.fetchTree({
          ...res,
          elementList: res.elementList || [],
        });
      }, err => this.setLoadingStatus('saveBtn', false));
    });
  };
  // 根据操作类型获取对应接口配置
  getQueryConfig = (values) => {
    const { actionType, activeDetail, activeTreeNodeDetail } = this.state;
    const { id, isGroup, groupId, rootpath } = activeTreeNodeDetail;
    // 保存面板时需要处理的参数
    // 新建组下面板传rootId=0, groupId=上层纯id
    // 新建面板下面板传rootId=上层纯id，grouptId=上层纯groupId
    switch (actionType) {
      case 'addGroup':
        return { // 新增组
          api: insertTabGroup,
          params: {
            ...values,
            rootId: id,
            rootpath: rootpath ? `${rootpath}/${id}` : `/${id}`,
          },
        };
      case 'editGroup':
        return { // 修改组
          api: updateTabGroup,
          params: {
            ...activeDetail,
            ...values,
          },
        };
      case 'addElement':
        return { // 新增面板
          api: insertTab,
          params: {
            ...activeDetail,
            ...values,
            planned: 1, // 1预设界面  10-配置界面
            groupId: isGroup ? id : groupId,
            rootId: isGroup ? 0 : id,
            rootpath: `${rootpath}/${id}`,
          },
        };
      case 'editElement':
        return { // 修改面板
          api: updateTab,
          params: {
            ...activeDetail,
            ...values,
            id,
          },
        };
      default:
        return {
          api: updateTabGroup,
          params: values,
        };
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
      dataType: 'tab',
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
      <Form className={styles.contentWrap}>
        <ContentContainer {...contentContainerProps} />
      </Form>
    ) : null;
    // const footer = (isInitlPage && !isInitialData) ? <FooterButton btnConfigs={btnConfigs}/> : null;
    let footer = null;
    if (isInitlPage && !isInitialData) {
      if (canadd && isInitlPage.indexOf('add') > -1) {
        footer = <FooterButton btnConfigs={btnConfigs}/>;
      }
      if (canmodify && isInitlPage.indexOf('edit') > -1) {
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

export default Form.create()(PageConfig);
