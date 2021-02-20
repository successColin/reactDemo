/**
 *@author jwk
 *@2019/9/3 0030
 *@Description 导入模板配置
 */

import React, { Component } from 'react';
import { message, Form, Pagination, Spin } from 'antd';
import DefaultFrame from '../Frames/DefaultFrame/DefaultFrame';
import { BaseContext } from '../../constants/global';
import CreateTree from '../common/CreateTree/CreateTree';
import CSpin from '@/components/common/BasicWidgets/Widgets/CSpin/CSpin';
import {
  getImportTree,
} from '@/services/importTemplate';
import DetailContent from './component/formDetial';
import ImportDetial from './component/importDetial';
import Styles from '@/components/ImportTemplate/ImportTemplateFiles.less';


class TemplateFiles extends Component {
  static contextType = BaseContext;

  constructor(props) {
    super();
    this.state = {
      treeData: [], // 树数据
      activeTreeNodeDetail: {}, // 当前选中的树节点信息
      activeDetail: {}, // 根据树节点信息获取的该节点具体详情
      actionType: '', // 操作类型
      errorCount: 0, // 错误数据
      pageSize: 10,
      pageNum: 1,
      keywords: '', // 关键字
      loading: false, // 反馈错误
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

  updateFrameState = (itemObj, callback) => {
    this.setState(itemObj, () => callback && callback());
  };
  // 清空表单
  resetDetailForm = () => {
    this.props.form.resetFields();
  };
  changeErrCount = (num) => {
    this.setState({
      errorCount: num,
    });
  };
  changePage = (page, pageSize) => {
    this.setState({
      pageSize: pageSize,
      pageNum: page,
    });
  };


  render() {
    const { loading, activeDetail, activeTreeNodeDetail, actionType, loadingStatus, treeData, tabActive, errorCount, pageNum, pageSize } = this.state;
    const { isGroup } = activeTreeNodeDetail;
    const { form } = this.props;
    const createTreeConfig = {
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
      needRightMenu: false,
      fetchTree: this.fetchTree,
      loading: loadingStatus.getTree,
      resetDetailForm: this.resetDetailForm,
      updateFrameState: this.updateFrameState,
      setLoadingStatus: this.setLoadingStatus,
      setGetDetailLoading: loading => this.setLoadingStatus('getDetail', loading),
      ref: ref => this.treeRef = ref,
    };
    const tabDefaultConfig = {
      className: Styles.TabColor,
      changeTab: this.changeTabs,
      tabsActive: tabActive,
      form,
      activeDetail,
      activeTreeNodeDetail,
      actionType,
      loading: loadingStatus.getDetail,
      updateFrameState: this.updateFrameState,
    };
    const sider = (
      <CreateTree {...createTreeConfig} />
    );
    let content = JSON.stringify(activeDetail) === '{}' || activeDetail.initialdata === 1 || (activeDetail.rootId && !!!activeDetail.groupId) ?
      <CSpin spinning={loadingStatus.getDetail}><DetailContent {...tabDefaultConfig}/> </CSpin> : <ImportDetial
        activeDetail={activeDetail}
        pageSize={pageSize}
        pageNum={pageNum}
        loading={loading}
        changeNumber={this.changeErrCount}
      />;
    let footer = <Pagination hideOnSinglePage={true} className={Styles.paginSty} total={errorCount}
                             onChange={this.changePage}
    />;
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
