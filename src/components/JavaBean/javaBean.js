/**
 *@author jwk
 *@2019/9/19 0014
 *@Description
 * 实体管理左侧列表优化成树形结构
 */
import React, { Component } from 'react';
import { message, Form } from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import DefaultFrame from '../Frames/DefaultFrame/DefaultFrame';
import Ctab from './component/index';
import { BaseContext } from '../../constants/global';
import FooterButton from '../common/FooterButton/FooterButton';
import CreateTree from '../common/CreateTree/CreateTree';
import { CSpin, CMessage } from '@/components/common/BasicWidgets';
import { getNodeDataFromTreeData, setNewActionType } from '@/utils/common';
import FormConfigDetial from './component/formDetial';
import {
  delJavaBean,
  delJavaBeanFiled,
  getJavaBeanList,
  updateGroup,
  insertGroup,
  insertJavaBean,
  updateJavaBean,
} from '@/services/javaBean.js';

import {
  insertUserGroup,
  insertUser,
  updateUser,
  updateUserGroup,
  getUserGroup,
  relationInsert,
} from '@/services/userManager';
import styles from './userConfig.less';

@connect(state => ({
  functionData: state.tabs.activeTabData.functionData,
}))
class houseMangerConfig extends Component {
  static contextType = BaseContext;

  constructor(props) {
    super(props);
    this.state = {
      tabActive: 'base', // 激活的面板
      treeData: [], // 树数据
      dataSourcePC: [], // 功能角色
      dataSourceApp: [], // 数据角色
      tree: [], // 功能角色树
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

  updateRoleState = (dataSourcePC, dataSourceApp, tree) => {
    this.setState({
      dataSourcePC,
      dataSourceApp,
      tree,
    });
  };

  // 获取树数据
  fetchTree = () => {
    this.setLoadingStatus('getTree', true);
    const { keywords } = this.state;
    const reqParams = { keywords };
    getJavaBeanList(reqParams).then(treeData => {
      // const activeTreeNodeDetail = getNodeDataFromTreeData(treeData.nodeKey, treeData);
      keywords && this.treeRef && this.treeRef.setSearchExpandKeys(treeData);
      this.setState({
        treeData,
        // activeTreeNodeDetail,
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
          api: insertGroup,
          params: {
            ...values,
            // rootId: pureId,
            rootId: id,
            rootpath: rootpath ? `${rootpath}/${id}` : `/${id}`,
          },
        };
      case 'editGroup':
        return { // 修改组
          api: updateGroup,
          params: {
            ...activeDetail,
            ...values,
          },
        };
      case 'addElement':
        return { // 新增元素
          api: insertJavaBean,
          params: {
            ...values,
            // groupId: isGroup ? pureId : +(groupId.split('-')[0]),
            groupId: isGroup ? id : +(groupId.split('-')[0]),
            // rootId: isGroup ? 0 : pureId,
            rootId: isGroup ? 0 : id,
            rootpath: `${rootpath ? rootpath : ''}/${id}`,
          },
        };
      case 'editElement':
        return { // 修改元素
          api: updateJavaBean,
          params: {
            ...activeDetail,
            ...values,
            oldTableName: activeDetail.tableName,
          },
        };
      default:
        return {
          api: insertGroup,
          params: values,
        };
    }
  };
  // 更新状态
  updateFrameState = (itemObj) => {
    this.setState({ ...itemObj });
    this.setState({ tabActive: 'base' });
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
  // 切换tab
  changeTabs = (active) => {
    this.setState({
      tabActive: active,
    });
  };
  // 保存
  handleSave = (values) => {
    const { langLib } = this.context;
    const { tabActive, dataSourceApp, dataSourcePC, activeTreeNodeDetail, actionType } = this.state;
    const { api, params } = this.getQueryConfig(values);
    // const time = params.startDate ? moment(params.startDate).format('YYYY-MM-DD HH:mm:ss') : '';
    // params.startDate = time;
    if (tabActive === 'role') {
      let arr = [...dataSourceApp, ...dataSourcePC];
      const data = arr.map((item) => {
        return { mainId: activeTreeNodeDetail.id, relationId: item.id };
      });
      let params = {
        mainId: activeTreeNodeDetail.id,
        pramDtoList: data,
      };
      relationInsert(params).then(res => {
        message.success(langLib['message.save.success']);
        this.setLoadingStatus('saveBtn', false);
      });
    } else {
      api(params).then(res => {
        message.success(langLib['message.save.success']);
        this.setLoadingStatus('saveBtn', false);
        if (actionType === 'addElement' || actionType === 'addGroup') {
          this.resetDetailForm();
        }
        this.fetchTree();
      }, err => this.setLoadingStatus('saveBtn', false));
    }
  };
  getDetailParams = (obj) => {
    if (obj.isGroup) {
      return '';
    } else {
      return { tableName: obj.name };
    }
  };

  render() {
    const { tabActive, activeDetail, activeTreeNodeDetail, actionType, loadingStatus, treeData, tableList, elementTypeList, tableColList } = this.state;
    const { form, functionData } = this.props;
    const { canmodify, canadd } = functionData.attributes;
    // 按钮配置
    const btnConfigs = [{
      type: 'primary',
      onClick: this.onSubmit,
      loading: loadingStatus.saveBtn,
    }];
    const createTreeConfig = {
      functionData,
      dataType: 'java',
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
      setGetDetailLoading: loading => this.setLoadingStatus('getDetail', loading),
      ref: ref => this.treeRef = ref,
    };
    const sider = (
      <CreateTree {...createTreeConfig} />
    );
    const tabDefaultConfig = {
      className: styles.userTab,
      activeDetail: activeDetail,
      activeTreeNodeDetail: activeTreeNodeDetail,
      tabsActive: tabActive,
      changeTab: this.changeTabs,
      actionType: actionType,
      loading: loadingStatus.getDetail, // 点击树节点获取详情
      updateFrameState: this.updateFrameState,
      form: form,
      updateRoleState: this.updateRoleState,
    };
    const tabs = (JSON.stringify(activeTreeNodeDetail) !== '{}' && !activeTreeNodeDetail.isGroup) ?
      <Ctab tabDefaultConfig={tabDefaultConfig}/> :
      <FormConfigDetial tabDefaultConfig={tabDefaultConfig}/>;
    let footer;
    if (JSON.stringify(activeTreeNodeDetail) === '{}') {
      footer = null;
    } else if (actionType && tabActive === 'base' || tabActive === 'base' && activeTreeNodeDetail.initialData !== '1') {
      if (canadd && actionType.indexOf('add') > -1) {
        footer = <FooterButton btnConfigs={btnConfigs}/>;
      } else if (canmodify && actionType.indexOf('edit') > -1) {
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
        content={JSON.stringify(activeTreeNodeDetail) !== '{}' ? tabs : null}
        footer={footer}
        config={{
          handleSearch: keywords => this.setState({ keywords }, () => this.fetchTree()),
        }}
      />
    );
  }
}

const houseConfig = Form.create({})(houseMangerConfig);
export default houseConfig;
