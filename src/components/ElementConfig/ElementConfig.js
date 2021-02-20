/*
 * @Author: Fus
 * @Date:   2019-06-19 08:46:41
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2019-12-13 09:51:58
 * @Desc: 元素配置
 */
import { Component, Fragment } from 'react';
import { Form } from 'antd';
import { connect } from 'dva';
import { CSearch, CMessage } from '../common/BasicWidgets/index';
import DefaultFrame from '../Frames/DefaultFrame/DefaultFrame';
import { BaseContext } from '../../constants/global';
import FooterButton from '../common/FooterButton/FooterButton';
import TreeFooter from '../common/TreeFooter/TreeFooter';
import CreateTree from '../common/CreateTree/CreateTree';
import DetailContent from './DetailContent/DetailContent';
import {
  getTree as getElementTree,
  doAddGroup,
  doEditGroup,
  doAddElement,
  doEditElement,
} from '../../services/element';
import { getNodeDataFromTreeData, setNewActionType } from '@/utils/common';
import styles from './ElementConfig.less';


// 获取elementType的值
function getElementTypeValue(formData) {
  const { isAPP, isPC } = formData;
  let result = 1;
  if (isAPP && isPC) {
    result = 11;
  } else if (isPC) {
    result = 1;
  } else if (isAPP) {
    result = 10;
  }
  return result;
}

@connect(state => ({
  functionData: state.tabs.activeTabData.functionData,
}))
class ElementConfig extends Component {
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
    const { keywords } = this.state;
    this.setLoadingStatus('getTree', true);
    getElementTree({ keywords }).then(treeData => {
      this.setState({ treeData });
      keywords && this.treeRef && this.treeRef.setSearchExpandKeys(treeData);
      this.props.form.resetFields();
      // if (resData) {
      //   this.props.form.resetFields();
      //   const activeTreeNodeDetail = getNodeDataFromTreeData(resData.nodeKey, treeData);
      //   console.log(this.state.actionType, setNewActionType(this.state.actionType), activeTreeNodeDetail, 'aaaa');
      //   this.setState({
      //     activeDetail: resData,
      //     activeTreeNodeDetail,
      //     actionType: setNewActionType(this.state.actionType),
      //   });
      // }
      this.setLoadingStatus('getTree', false);
    }, err => this.setLoadingStatus('getTree', false));
  };
  // 根据操作类型获取对应接口配置
  getQueryConfig = (values) => {
    const { actionType, activeDetail, activeTreeNodeDetail } = this.state;
    const { id, isGroup, groupId, rootpath } = activeTreeNodeDetail;
    const { elementModelValueId = '' } = activeDetail;
    const pubParams = {
      elementType: getElementTypeValue(values),
    };
    // 保存元素时需要处理的参数
    // 新建组下元素传rootId=0, groupId=上层纯id
    // 新建元素下元素传rootId=上层纯id，grouptId=上层纯groupId
    const elementOtherParam = {
      basetype: +values.basetype,
      elementProperty: '', // @TODO: pc样式和app样式拼成一个字符串
    };
    switch (actionType) {
      case 'addGroup':
        return { // 新增组
          api: doAddGroup,
          params: {
            ...values,
            ...pubParams,
            rootId: id,
            rootpath: rootpath ? `${rootpath}/${id}` : `/${id}`,
          },
        };
      case 'editGroup':
        return { // 修改组
          api: doEditGroup,
          params: {
            ...activeDetail,
            ...values,
            ...pubParams,
          },
        };
      case 'addElement':
        return { // 新增元素
          api: doAddElement,
          params: {
            ...values,
            ...pubParams,
            ...elementOtherParam,
            groupId: isGroup ? id : groupId,
            rootId: isGroup ? 0 : id,
            rootpath: `${rootpath}/${id}`,
          },
        };
      case 'editElement':
        return { // 修改元素
          api: doEditElement,
          params: {
            ...values,
            ...pubParams,
            ...elementOtherParam,
            elementModelValueId,
            id,
          },
        };
      default:
        return {
          api: doAddGroup,
          params: values,
        };
    }
  };
  // 更新状态
  updateFrameState = (itemObj) => {
    this.setState({ ...itemObj });
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
      CMessage(langLib['message.save.success'], 'success');
      this.setLoadingStatus('saveBtn', false);
      this.fetchTree(res);
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
    };
    // 按钮配置
    const btnConfigs = [{
      type: 'primary',
      onClick: this.onSubmit,
      loading: loadingStatus.saveBtn,
    }];
    const createTreeConfig = {
      functionData,
      dataType: 'element',
      treeData,
      form,
      activeTreeNodeDetail,
      needRightMenu: true,
      fetchTree: this.fetchTree,
      loading: loadingStatus.getTree,
      resetDetailForm: this.resetDetailForm,
      setLoadingStatus: this.setLoadingStatus,
      updateFrameState: this.updateFrameState,
      nodeConfig: { isMainTree: true },
      ref: ref => this.treeRef = ref,
      setGetDetailLoading: loading => this.setLoadingStatus('getDetail', loading),
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

export default Form.create()(ElementConfig);
