/**
 *@author jwk
 *@2019/8/14 0014
 *@Description
 *角色管理》主要是用于配置角色权限
 */
import React, { Component } from 'react';
import { message, Form, Modal } from 'antd';
import moment from 'moment';
import DefaultFrame from '../Frames/DefaultFrame/DefaultFrame';
import Ctab from './component/index';
import ModalBox from '@/components/common/ReminderBox/ReminderBox';
import { BaseContext } from '../../constants/global';
import FooterButton from '../common/FooterButton/FooterButton';
import CreateTree from '../common/CreateTree/CreateTree';
import { CSpin, CMessage } from '@/components/common/BasicWidgets';
import { connect } from 'dva';
import { getDefaultConfirmProps, getNodeDataFromTreeData, setNewActionType } from '@/utils/common';
import FormConfigDetial from './component/formDetial';
import {
  insertUserGroup,
  insertUser,
  updateUser,
  updateUserLock,
  updateUserGroup,
  getUserGroup,
  relationInsert,
  updateUserData,
  restPassword,
  copyRoleRelationUser,
} from '@/services/userManager';
import styles from './userConfig.less';

const { confirm } = Modal;

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
      selectOrgData: [], // 数据权限
      tree: [], // 功能角色树
      activeTreeNodeDetail: {}, // 当前选中的树节点信息
      activeDetail: {}, // 根据树节点信息获取的该节点具体详情
      actionType: '', // 操作类型
      keywords: '', // 关键字
      loadingStatus: { // loading状态
        saveBtn: false, // 保存按钮
        getDetail: false, // 点击树节点获取详情
        getTree: false, // 获取树数据
        unlock: false, // 密码解锁
        rest: false, // 密码重置
      },
      copyRoleSelect: [], // 复制角色左侧
      copyRoleData: {
        functionRole: 0,
        dataRole: 0,
        coverOrAppend: 0,
      },   // 复制角色右侧
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
    const reqParams = {};
    const { keywords } = this.state;
    let params = keywords ? { keywords } : { groupId: 0, rootpath: '' };
    getUserGroup(params).then(treeData => {
      const activeTreeNodeDetail = getNodeDataFromTreeData(treeData.nodeKey, treeData);
      keywords && this.treeRef && this.treeRef.setSearchExpandKeys(treeData);
      !keywords && this.treeRef && this.treeRef.setSearchExpandKeys([]);
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
          api: insertUserGroup,
          params: {
            ...values,
            // rootId: pureId,
            rootId: id,
            rootpath: rootpath ? `${rootpath}/${id}` : `/${id}`,
          },
        };
      case 'editGroup':
        return { // 修改组
          api: updateUserGroup,
          params: {
            ...activeDetail,
            ...values,
          },
        };
      case 'addElement':
        return { // 新增元素
          api: insertUser,
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
          api: updateUser,
          params: {
            ...activeDetail,
            ...values,
          },
        };
      default:
        return {
          api: insertUserGroup,
          params: values,
        };
    }
  };
  // 更新状态
  updateFrameState = (itemObj) => {
    this.setState({ ...itemObj });
    this.setState({
      tabActive: 'base',
      copyRoleData: {
        functionRole: 0,
        dataRole: 0,
        coverOrAppend: 0,
      },
    });
  };
  // 更新状态
  updateFrameState1 = (itemObj) => {
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
  // 重置密码
  restPassword = () => {
    const { langLib } = this.context;
    let { close } = ModalBox.confirm({
      ...getDefaultConfirmProps(langLib),
      title: langLib['confirm.rest.password'],
      onOk: () => {
        const { activeDetail } = this.state;
        const { id, account } = activeDetail;
        this.setLoadingStatus('rest', true);
        restPassword({ id, account }).then(res => {
          message.success(langLib['message.check.success']);
          this.setLoadingStatus('rest', false);
          closeModal();
        }, err => {
          this.setLoadingStatus('rest', false);
          closeModal();
        });
      },
      onCancel: () => closeModal(),
    });
    const closeModal = () => {
      close();
    };
  };
  // 密码解锁
  unlock = () => {
    const { langLib } = this.context;
    const that = this;
    let { close } = ModalBox.confirm({
      ...getDefaultConfirmProps(langLib),
      title: langLib['confirm.unlock.password'],
      content: '',
      onOk() {
        const { activeDetail } = that.state;
        const { id, account } = activeDetail;
        that.setLoadingStatus('unlock', true);
        updateUserLock({ id }).then(res => {
          message.success(langLib['message.check.success']);
          that.setLoadingStatus('unlock', false);
          closeModal();
        }, err => {
          closeModal();
          that.setLoadingStatus('unlock', false);
        });
      },
      onCancel: () => closeModal(),
    });
    const closeModal = () => {
      close();
    };
  };
  // 清空表单
  resetDetailForm = () => {
    this.props.form.resetFields();
  };
  // 切换tab
  changeTabs = (active, callback) => {
    this.setState({
      tabActive: active,
    }, () => {
      callback && callback();
    });
  };
  // 保存
  handleSave = (values) => {
    const { langLib } = this.context;
    const { tabActive, dataSourceApp, dataSourcePC, activeTreeNodeDetail, selectOrgData } = this.state;
    const { api, params } = this.getQueryConfig(values);
    const time = params.startDate ? moment(params.startDate).format('YYYY-MM-DD HH:mm:ss') : '';
    params.startDate = time;
    api(params).then(res => {
      message.success(langLib['message.save.success']);
      this.setLoadingStatus('saveBtn', false);
      this.fetchTree();
    }, err => this.setLoadingStatus('saveBtn', false));
  };
  // 关联角色&&关联组织保存&&复制角色保存
  handleSaveData = () => {
    const { langLib } = this.context;
    const {
      tabActive, dataSourceApp, dataSourcePC, activeTreeNodeDetail, selectOrgData, copyRoleSelect = [], // 复制角色左侧
      copyRoleData = {},
    } = this.state;
    this.setLoadingStatus('saveBtn', true);

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
    } else if (tabActive === 'data') {
      let arr = selectOrgData.map(item => {
        return {
          userId: activeTreeNodeDetail.id,
          relationOrgId: item.orgId,
        };
      });
      let params = {
        orgsString: JSON.stringify(arr),
        userId: activeTreeNodeDetail.id,
      };
      updateUserData(params).then(res => {
        message.success(langLib['message.save.success']);
        this.setLoadingStatus('saveBtn', false);
      }, err => {
        this.setLoadingStatus('saveBtn', false);
      });
    } else if (tabActive === 'copy') { // 复制角色左侧
      let userArr = copyRoleSelect.filter(item => (!item.isGroup && item.id !== activeTreeNodeDetail.id)) || [];
      let groupArr = copyRoleSelect.filter(item => item.isGroup) || [];
      if (!userArr.length && !groupArr.length) {
        CMessage(langLib['message.please.choose'], 'error');
        this.setLoadingStatus('saveBtn', false);
        return;
      }
      let params = {
        oldUserId: activeTreeNodeDetail.id,
        userIds: userArr.map(item => item.id).join(','),
        groupIds: groupArr.map(item => item.id).join(','),
        ...copyRoleData,
      };
      copyRoleRelationUser(params).then(res => {
        CMessage(langLib['message.save.success'], 'success');
        this.setLoadingStatus('saveBtn', false);
      }, err => {
        this.setLoadingStatus('saveBtn', false);
      });
    }
  };
  // 更新选中组织
  updateOrgData = (data) => {
    this.setState({
      selectOrgData: data,
    });
  };
  // 异步加载
  loadMoreData = (treeNode) => {
    const { treeData, keywords } = this.state;
    return new Promise(resolve => {
      const { props } = treeNode;
      if (keywords || treeNode.props.children) {
        resolve();
        return;
      }
      const { isGroup, id, rootpath } = treeNode.props.nodeData;
      let params = isGroup ? { groupId: id, rootpath } : { rootId: id, rootpath };
      getUserGroup(params).then(res => {
        treeNode.props.nodeData.children = res;
        this.setState({
          treeData: [...this.state.treeData],
        });
        resolve();
      });
    });
  };
  // 按钮显示
  returnFooterBtnConfig = () => {
    const { tabActive, activeTreeNodeDetail, loadingStatus } = this.state;
    let btnConfigs = [{
      type: 'primary',
      onClick: this.onSubmit,
      text: 'global.save',
      loading: loadingStatus.saveBtn,
    }];
    const { isGroup } = activeTreeNodeDetail;
    const passwordBtn = {
      type: 'default',
      onClick: this.restPassword,
      text: 'user.rest.password',
      loading: loadingStatus.rest,
    };
    const unlockBtn = {
      type: 'default',
      onClick: this.unlock,
      text: 'user.unlock.password',
      loading: loadingStatus.unlock,
    };
    if (tabActive === 'base' && !isGroup) {
      btnConfigs.push(passwordBtn, unlockBtn);
    } else if (tabActive !== 'base' && !isGroup) {
      btnConfigs = [{
        type: 'primary',
        onClick: this.handleSaveData,
        text: 'global.save',
        loading: loadingStatus.saveBtn,
      }];
    }
    return btnConfigs;
  };
  // 按钮权限控制
  buttonPermissions = () => {
    const { tabActive, activeTreeNodeDetail, actionType } = this.state;
    const { functionData } = this.props;
    const { canmodify, canadd } = functionData.attributes;
    let footer = null;
    let btnConfigs = this.returnFooterBtnConfig();
    if (JSON.stringify(activeTreeNodeDetail) === '{}') {
      footer = null;
    } else if (actionType && tabActive === 'base' || tabActive === 'base' && activeTreeNodeDetail.initialData !== '1' || tabActive === 'role' || tabActive === 'copy' || tabActive === 'data') {
      if (actionType && actionType.indexOf('edit') > -1) {
        footer = !!canmodify ? <FooterButton btnConfigs={btnConfigs}/> : null;
      }
      if (actionType && actionType.indexOf('add') > -1) {
        footer = !!canadd ? <FooterButton btnConfigs={btnConfigs}/> : null;
      }
    } else {
      footer = null;
    }
    return footer;
  };

  render() {
    const { tabActive, activeDetail, activeTreeNodeDetail, actionType, loadingStatus, treeData, tableList, elementTypeList, tableColList } = this.state;
    const { form, functionData } = this.props;
    // 按钮配置
    const createTreeConfig = {
      functionData,
      dataType: 'users',
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
      loadData: this.loadMoreData,
      setGetDetailLoading: loading => this.setLoadingStatus('getDetail', loading),
      ref: ref => this.treeRef = ref,
    };
    const sider = (
      <CreateTree {...createTreeConfig} />
    );
    const footer = this.buttonPermissions();
    const tabDefaultConfig = {
      functionData,
      className: styles.userTab,
      activeDetail: activeDetail,
      activeTreeNodeDetail: activeTreeNodeDetail,
      tabsActive: tabActive,
      changeTab: this.changeTabs,
      actionType: actionType,
      loading: loadingStatus.getDetail, // 点击树节点获取详情
      updateFrameState: this.updateFrameState,
      updateFrameState1: this.updateFrameState1,
      form: form,
      updateRoleState: this.updateRoleState,
      updateOrgData: this.updateOrgData,
    };
    const tabs = (JSON.stringify(activeTreeNodeDetail) !== '{}' && !activeTreeNodeDetail.isGroup) ?
      <Ctab tabDefaultConfig={tabDefaultConfig}/> :
      <FormConfigDetial tabDefaultConfig={tabDefaultConfig}/>;
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

const houseConfig = Form.create({})(houseMangerConfig);
export default houseConfig;
