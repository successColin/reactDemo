/**
 *@author jwk
 *@2019/8/30 0030
 *@Description 导入模板配置
 */

import React, { Component } from 'react';
import { message, Form, Spin } from 'antd';
import { connect } from 'dva';
import DefaultFrame from '../Frames/DefaultFrame/DefaultFrame';
import { BaseContext } from '../../constants/global';
import FooterButton from '../common/FooterButton/FooterButton';
import CreateTree from '../common/CreateTree/CreateTree';
import CSpin from '@/components/common/BasicWidgets/Widgets/CSpin/CSpin';
import {
  getImportTree,
} from '@/services/templateFiles';
import DetailContent from './component/formDetial';
import TabConfigConent from './component/tabDetial';
import Styles from '@/components/TemplateFiles/TemplateFiles.less';
import { insertImportGroup, insertImport, updateImportGroup, updateImport, updateSno } from '@/services/templateFiles';

@connect(state => ({
  functionData: state.tabs.activeTabData.functionData,
}))
class TemplateFiles extends Component {
  static contextType = BaseContext;

  constructor(props) {
    super();
    this.state = {
      tabActive: 'base',
      treeData: [], // 树数据
      activeTreeNodeDetail: {}, // 当前选中的树节点信息
      activeDetail: {}, // 根据树节点信息获取的该节点具体详情
      actionType: '', // 操作类型
      keywords: '', // 关键字
      modolVisible: false, // 弹框状态
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

  fetchTree = () => {
    this.setLoadingStatus('getTree', true);
    const { keywords } = this.state;
    getImportTree({ keywords }).then(treeData => {
      keywords && this.treeRef && this.treeRef.setSearchExpandKeys(treeData);
      this.setState({
        treeData,
      });
      this.setLoadingStatus('getTree', false);
    }, err => this.setLoadingStatus('getTree', false));
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
      const { tabActive } = this.state;
      this.setLoadingStatus('saveBtn', true);
      if (tabActive === 'base') {
        this.handleSave(values);
      } else {
        this.doUpdateSno();
      }
    });
  };
  // 修改列表中的顺序
  doUpdateSno = () => {
    if (this.listBox) {
      const { langLib } = this.context;
      let { dataSource = [] } = this.listBox.state;
      let listData = dataSource.map((item, index) => {
          return {
            id: item.id,
            sno: index + 1,
          };
        },
      );
      updateSno({ dtoList: listData }).then(res => {
        message.success(langLib['message.save.success']);
        this.setLoadingStatus('saveBtn', false);
      }, err => this.setLoadingStatus('saveBtn', false));
    }
  };
  // 清空表单
  resetDetailForm = () => {
    this.props.form.resetFields();
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
          api: insertImportGroup,
          params: {
            ...values,
            rootId: id,
            rootpath: rootpath ? `${rootpath}/${id}` : `/${id}`,
          },
        };
      case 'editGroup':
        return {
          api: updateImportGroup,
          params: {
            ...activeDetail,
            ...values,
          },
        };
      case 'addElement':
        return { // 新增元素
          api: insertImport,
          params: {
            ...values,
            groupId: id,
            rootId: 0,
            rootpath: rootpath ? `${rootpath}/${id}` : `/${id}`,
          },
        };
      case 'editElement':
        return { // 修改元素
          api: updateImport,
          params: {
            ...values,
            id: id,
          },
        };
      default:
        return {
          api: insertImportGroup,
          params: values,
        };
    }
  };
  // 保存
  handleSave = (values) => {
    const { langLib } = this.context;
    const { api, params } = this.getQueryConfig(values);
    api(params).then(res => {
      message.success(langLib['message.save.success']);
      this.setLoadingStatus('saveBtn', false);
      const { actionType } = this.state;
      if (actionType === 'addElement' || actionType === 'addGroup') {
        this.resetDetailForm();
      }
      this.fetchTree();
    }, err => this.setLoadingStatus('saveBtn', false));
  };
  updateFrameState = (itemObj, callback) => {
    this.setState(itemObj, () => callback && callback());
    this.setState({
      tabActive: 'base',
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

  render() {
    const { activeDetail, activeTreeNodeDetail, actionType, loadingStatus, treeData, tabActive } = this.state;
    const { isGroup } = activeTreeNodeDetail;
    const { form, functionData } = this.props;
    const { canmodify, canadd } = functionData.attributes;
    const createTreeConfig = {
      functionData,
      dataType: 'template',
      form,
      treeData,
      nodeConfig: {
        isMainTree: true,
        notGroupIcon: true,
      },
      getDetailParams: (node) => {
        return {
          importmodelId: node.id,
        };
      },
      activeTreeNodeDetail,
      needGetDetail: true,
      needRightMenu: true,
      fetchTree: this.fetchTree,
      loading: loadingStatus.getTree,
      resetDetailForm: this.resetDetailForm,
      updateFrameState: this.updateFrameState,
      setLoadingStatus: this.setLoadingStatus,
      setGetDetailLoading: loading => this.setLoadingStatus('getDetail', loading),
      ref: ref => this.treeRef = ref,
    };
    const tabDefaultConfig = {
      functionData,
      className: Styles.TabColor,
      changeTab: this.changeTabs,
      tabsActive: tabActive,
      form,
      activeDetail,
      activeTreeNodeDetail,
      actionType,
      loading: loadingStatus.getDetail,
      updateFrameState: this.updateFrameState,
      ref: ref => this.listBox = ref,
    };
    // 按钮配置
    const btnConfigs = [{
      type: 'primary',
      onClick: this.onSubmit,
      loading: loadingStatus.saveBtn,
    }];
    const sider = (
      <CreateTree {...createTreeConfig} />
    );
    let content = !actionType || isGroup ?
      <CSpin spinning={loadingStatus.getDetail}><DetailContent {...tabDefaultConfig}/></CSpin> :
      <TabConfigConent {...tabDefaultConfig}/>;
    let footer = null;
    if (actionType === 'addGroup' && tabActive === 'base' && activeTreeNodeDetail.initialData === '1' || tabActive === 'tabname' || actionType && activeTreeNodeDetail.initialData !== '1' && tabActive === 'base') {
      if (actionType.indexOf('add') > -1 && canadd) {
        footer = <FooterButton btnConfigs={btnConfigs}/>;
      }
      if (actionType.indexOf('edit') > -1 && canmodify) {
        footer = <FooterButton btnConfigs={btnConfigs}/>;
      }
    } else {
      footer = null;
    }
    return (
      <DefaultFrame
        sider={sider}
        content={JSON.stringify(activeTreeNodeDetail) === '{}' ? null : content}
        footer={footer}
        config={{
          handleSearch: keywords => this.setState({ keywords }, () => this.fetchTree()),
        }}
      />
    );
  }
}

export default Form.create()(TemplateFiles);
