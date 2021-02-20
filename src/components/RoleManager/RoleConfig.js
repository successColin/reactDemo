/**
 *@author jwk
 *@2019/8/14 0014
 *@Description
 *角色管理》主要是用于配置角色权限
 */
import React, { Component } from 'react';
import { message, Form } from 'antd';
import DefaultFrame from '../Frames/DefaultFrame/DefaultFrame';
import Ctab from './component/index';
import { BaseContext } from '../../constants/global';
import FooterButton from '../common/FooterButton/FooterButton';
import CreateTree from '../common/CreateTree/CreateTree';
import { connect } from 'dva';
import { CSpin, CMessage } from '@/components/common/BasicWidgets';
import FormConfigDetial from './component/formDetial';
import { getNodeDataFromTreeData, setNewActionType } from '@/utils/common';

import {
  addRoleGroup,
  addRole,
  updateRoleTreeOfRole,
  updateRoleTreeOfGroup,
  getRoleTree,
  insertOrgData,
} from '@/services/roleManger';
import styles from '@/components/RoleManager/roleConfig.less';
import DetailContent from '@/components/ElementConfig/DetailContent/DetailContent';

@connect(state => ({
  functionData: state.tabs.activeTabData.functionData,
}))
class roleMangerConfig extends Component {
  static contextType = BaseContext;

  constructor(props) {
    super(props);
    this.state = {
      tabActive: 'base', // 激活的面板
      treeData: [], // 树数据
      selectOrgData: [], // 选中组织
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
  }

  componentDidMount() {
    this.fetchTree();
  }

  // 获取树数据
  fetchTree = () => {
    this.setLoadingStatus('getTree', true);
    const { keywords } = this.state;
    const reqParams = { keywords };
    getRoleTree(reqParams).then(treeData => {
      const activeTreeNodeDetail = getNodeDataFromTreeData(treeData.nodeKey, treeData);
      keywords && this.treeRef && this.treeRef.setSearchExpandKeys(treeData);
      this.setState({
        treeData,
        activeTreeNodeDetail,
        actionType: setNewActionType(this.state.actionType),
      });
      this.setLoadingStatus('getTree', false);
    }, err => this.setLoadingStatus('getTree', false));
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
          api: addRoleGroup,
          params: {
            ...values,
            // rootId: pureId,
            rootId: id,
            rootpath: rootpath ? `${rootpath}/${id}` : `/${id}`,
          },
        };
      case 'editGroup':
        return { // 修改组
          api: updateRoleTreeOfGroup,
          params: {
            ...activeDetail,
            ...values,
          },
        };
      case 'addElement':
        return { // 新增元素
          api: addRole,
          params: {
            ...values,
            // groupId: isGroup ? pureId : +(groupId.split('-')[0]),
            groupId: isGroup ? id : +(groupId.split('-')[0]),
            // rootId: isGroup ? 0 : pureId,
            rootId: isGroup ? 0 : id,
            rootpath: `${rootpath}/${id}`,
          },
        };
      case 'editElement':
        return { // 修改元素
          api: updateRoleTreeOfRole,
          params: {
            ...activeDetail,
            ...values,
          },
        };
      default:
        return {
          api: addRoleGroup,
          params: values,
        };
    }
  };
  // 更新状态
  updateFrameState = (itemObj) => {
    this.setState({
      ...itemObj,
      tabActive: 'base',
    });
  };
  // 更新选中组织
  updateOrgData = (data) => {
    this.setState({
      selectOrgData: data,
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
    const { langLib } = this.context;
    this.props.form.validateFields((errs, values) => {
      if (errs) return;
      const { tabActive, activeDetail, selectOrgData = [] } = this.state;
      this.setLoadingStatus('saveBtn', true);
      if (tabActive === 'data') {
        let arr = selectOrgData.map(item => {
          return {
            roleId: activeDetail.id,
            relationOrgId: item.orgId,
          };
        });
        let params = {
          orgsString: JSON.stringify(arr),
          roleId: activeDetail.id,
        };
        insertOrgData(params).then(res => {
          message.success(langLib['message.save.success']);
          this.setLoadingStatus('saveBtn', false);
        }, err => {
          this.setLoadingStatus('saveBtn', false);
        });

      } else {
        this.handleSave(values);
      }

    });
  };
  // 清空表单
  resetDetailForm = () => {
    this.props.form.resetFields();
  };
  // 切换tab
  changeTabs = (active) => {
    this.setState({
      tabActive: active,
    });
  };
  // 保存
  handleSave = (values) => {
    const { langLib } = this.context;
    const { api, params } = this.getQueryConfig(values);
    api(params).then(res => {
      message.success(langLib['message.save.success']);
      this.setLoadingStatus('saveBtn', false);
      this.fetchTree();
    }, err => this.setLoadingStatus('saveBtn', false));
  };

  render() {
    const { activeDetail, activeTreeNodeDetail, actionType, loadingStatus, treeData, tableList, elementTypeList, tableColList } = this.state;
    const { form, functionData } = this.props;
    const { canmodify, canadd } = functionData.attributes;
    const isInitialData = !!((+activeTreeNodeDetail.initialData) && actionType !== 'addGroup');
    // 按钮配置
    const btnConfigs = [{
      type: 'primary',
      onClick: this.onSubmit,
      loading: loadingStatus.saveBtn,
    }];
    const createTreeConfig = {
      functionData,
      dataType: 'role',
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
      type: 'role', // 类型是角色
      setGetDetailLoading: loading => this.setLoadingStatus('getDetail', loading),
      ref: ref => this.treeRef = ref,
    };
    const sider = (
      <CreateTree {...createTreeConfig} />
    );
    const tabDefaultConfig = {
      functionData,
      className: styles.roleTab,
      activeDetail: activeDetail,
      tabsActive: this.state.tabActive,
      changeTab: this.changeTabs,
      actionType: actionType,
      loading: loadingStatus.getDetail, // 点击树节点获取详情
      updateFrameState: this.updateFrameState,
      form: form,
      activeTreeNodeDetail: activeTreeNodeDetail,
      updateOrgData: this.updateOrgData,
    };

    const tabs = (!!activeTreeNodeDetail.initialData && !activeTreeNodeDetail.isGroup) ?
      <Ctab tabDefaultConfig={tabDefaultConfig}/> :
      <FormConfigDetial tabDefaultConfig={tabDefaultConfig}/>;
    let footer;
    // if (this.state.tabActive === 'base' || this.state.tabActive === 'data') {
    //   footer = <FooterButton btnConfigs={btnConfigs}/>;
    // } else {
    if (JSON.stringify(activeTreeNodeDetail) === '{}') {
      footer = null;
    } else if (actionType === 'editGroup' && (activeTreeNodeDetail.rootpath.split('/').length === 2 || activeTreeNodeDetail.rootpath.split('/').length === 3)) {
      footer = null;
    } else if (actionType !== 'editGroup' && (activeTreeNodeDetail.rootpath.split('/').length === 2 || activeTreeNodeDetail.rootpath.split('/').length === 3)) {
      if (canadd || canmodify) {
        footer = <FooterButton btnConfigs={btnConfigs}/>;
      }
    } else if (actionType && (this.state.tabActive === 'base' || this.state.tabActive === 'data')) {
      if (canadd) {
        footer = <FooterButton btnConfigs={btnConfigs}/>;
      }
      if (canmodify) {
        footer = <FooterButton btnConfigs={btnConfigs}/>;
      } else {
        footer = null;
      }
    } else {
      footer = null;
    }
    return (
      <DefaultFrame
        sider={sider}
        content={JSON.stringify(activeTreeNodeDetail) === '{}' ? null : tabs}
        footer={footer}
        config={{
          handleSearch: keywords => this.setState({ keywords }, () => this.fetchTree()),
        }}
      />
    );
  }
}

const roleManger = Form.create({})(roleMangerConfig);
export default roleManger;
