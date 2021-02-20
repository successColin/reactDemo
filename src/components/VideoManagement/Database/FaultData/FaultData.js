import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { Tabs, Card, Form } from 'antd';
import { BaseContext } from '@/constants/global';
import { CTextArea, CInput, SplitLine, CSearch } from '@/components/common/BasicWidgets';
import {
  getErrorCodeTree,
  addErrorCodeGroup,
  updateErrorCodeGroup,
  addErrorCodeRelations,
  updateErrorCodeRelations,
  getTreeDataByAsync,
} from '@/services/errorCode';
import CreateTree from '@/components/common/CreateTree/CreateTree';
import FormItems from '@/components/common/FormItems/FormItems';
import Styles from '../DeviceDetail/Tabs/detail.less';


class FaultData extends Component {
  static contextType = BaseContext;

  constructor() {
    super();
    this.state = {
      loading: false,
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
  }

  componentDidMount() {
    this.fetchTree();
  }

  // 获取树数据
  fetchTree = (isLoad = false) => {
    this.setLoadingStatus('getTree', true);
    const { keywords } = this.state;
    let api = keywords ? getErrorCodeTree : getTreeDataByAsync;
    let params = keywords ? { keywords } : { nodeId: 'G0', rootPath: '' };
    api(params).then(treeData => {
      (isLoad || keywords) && this.treeRef && this.treeRef.setSearchExpandKeys(treeData);
      this.setState({
        treeData,
      });
      this.setLoadingStatus('getTree', false);
    }, err => this.setLoadingStatus('getTree', false));
  };
  // 异步加载
  loadMoreData = (treeNode, needFetch) => {
    const { treeData, keywords } = this.state;
    this.setLoadingStatus('getTree', true);
    return new Promise(resolve => {
      const { props } = treeNode;
      if (!needFetch) {
        this.setLoadingStatus('getTree', false);
        resolve();
        return;
      }
      const { isGroup, id, rootpath, rootId, type } = treeNode.props.nodeData;
      let params = {};
      if (isGroup && rootId === 0) {
        params = { nodeId: 'G1', rootPath: rootpath };
      } else if (isGroup && rootId) {
        params = { nodeId: `G${id}`, rootPath: rootpath };
      } else if (type === 'ERRORCODEI') {
        params = { nodeId: `A${id}`, rootPath: rootpath };
      } else if (type === 'ERRORCODEII') {
        params = { nodeId: `B${id}`, rootPath: rootpath };
      } else if (type === 'ERRORCODEIII') {
        params = { nodeId: `C${id}`, rootPath: rootpath };
      }
      getTreeDataByAsync(params).then(res => {
        treeNode.props.nodeData.children = res;
        this.setState({
          treeData: [...this.state.treeData],
        });
        this.setLoadingStatus('getTree', false);
        resolve();
      });
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
  // 获取表单项配置
  getFormConfigs = () => {
    const {
      activeDetail = {},
      activeTreeNodeDetail = {},
      updateFrameState,
      treeData,
    } = this.state;
    const { isGroup, type } = activeTreeNodeDetail;
    const { basetype = 'select' } = activeDetail;
    const publicProps = {};
    const { colorCode } = activeDetail;
    // 基本信息
    let publicBasicConfig = [];
    if (type === 'ERRORCODEI') {
      publicBasicConfig = [
        {
          key: 'name',
          colSpan: 12,
          label: <FormattedMessage id="errorCodeI.name"/>,
          config: {
            initialValue: activeDetail.name || '',
          },
          component: <CInput disabled={true}/>,
        }, {
          key: 'keycode',
          colSpan: 12,
          label: <FormattedMessage id="errorCodeI.keycode"/>,
          config: {
            initialValue: activeDetail.keycode || '',
          },
          component: <CInput disabled={true}/>,
        }, {
          key: 'memo',
          label: <FormattedMessage id="global.memo"/>,
          config: {
            initialValue: activeDetail.memo || '',
          },
          colSpan: 24,
          component: <CTextArea/>,
        },
      ];
    } else if (type === 'ERRORCODEII') {
      publicBasicConfig = [
        {
          key: 'name',
          colSpan: 12,
          label: <FormattedMessage id="errorCodeII.name"/>,
          config: {
            initialValue: activeDetail.name || '',
          },
          component: <CInput disabled={true}/>,
        }, {
          key: 'keycode',
          colSpan: 12,
          label: <FormattedMessage id="errorCodeII.keycode"/>,
          config: {
            initialValue: activeDetail.keycode || '',
          },
          component: <CInput disabled={true}/>,
        }, {
          key: 'memo',
          label: <FormattedMessage id="global.memo"/>,
          config: {
            initialValue: activeDetail.memo || '',
          },
          colSpan: 24,
          component: <CTextArea/>,
        },
      ];
    } else if (type === 'ERRORCODEIII') {
      publicBasicConfig = [
        {
          key: 'name',
          colSpan: 12,
          label: <FormattedMessage id="errorCodeIII.name"/>,
          config: {
            initialValue: activeDetail.name || '',
          },
          component: <CInput disabled={true}/>,
        }, {
          key: 'keycode',
          colSpan: 12,
          label: <FormattedMessage id="errorCodeIII.keycode"/>,
          config: {
            initialValue: activeDetail.keycode || '',
          },
          component: <CInput disabled={true}/>,
        }, {
          key: 'memo',
          label: <FormattedMessage id="global.memo"/>,
          config: {
            initialValue: activeDetail.memo || '',
          },
          colSpan: 24,
          component: <CTextArea/>,
        },
      ];
    } else {
      publicBasicConfig = [
        {
          key: 'name',
          colSpan: 12,
          label: <FormattedMessage id="errorCode.name"/>,
          config: {
            initialValue: activeDetail.name || '',
          },
          component: <CInput/>,
        }, {
          key: 'keycode',
          colSpan: 12,
          label: <FormattedMessage id="errorCode.keycode"/>,
          config: {
            initialValue: activeDetail.keycode || '',
          },
          component: <CInput disabled={true}/>,
        }, { // 组织机构
          key: 'id',
          // label: <FormattedMessage id="user.form.userDesignerId"/>,
          colSpan: 12,
          config: {
            initialValue: activeDetail.id,
          },
          component: (
            <CInput style={{ 'display': 'none' }}/>
          ),
        }, {
          key: 'memo',
          label: <FormattedMessage id="global.memo"/>,
          config: {
            initialValue: activeDetail.memo || '',
          },
          colSpan: 24,
          component: <CTextArea/>,
        },
      ];
    }

    // 其他信息
    let propConfig = [];
    return [
      ...publicBasicConfig,
      ...propConfig,
    ];
  };
  // 更新状态
  updateFrameState = (itemObj) => {
    this.setState({ ...itemObj });
  };
  // 搜索
  searchDetails = (keywords) => {
    this.setState({ keywords }, () => {
      this.fetchTree(true);
    });
  };

  render() {
    const { loading, treeData, activeTreeNodeDetail, loadingStatus } = this.state;
    const { form } = this.props;
    const createTreeConfig = {
      className: Styles.treeSty,
      dataType: 'ErrorCode',
      needRightMenu: false,
      treeData,
      form,
      nodeConfig: {
        isMainTree: true,
        notGroupIcon: true,
      },
      activeTreeNodeDetail,
      needGetDetail: true,
      fetchTree: this.fetchTree,
      loading: loadingStatus.getTree,
      resetDetailForm: this.resetDetailForm,
      setLoadingStatus: this.setLoadingStatus,
      updateFrameState: this.updateFrameState,
      isErrorCode: true,
      loadData: this.loadMoreData,
      setGetDetailLoading: loading => this.setLoadingStatus('getDetail', loading),
      ref: ref => this.treeRef = ref,
    };
    return (
      <div className={Styles.detailWrap}>
        <div className={Styles.left}>
          <CSearch
            className={Styles.search}
            onSearch={e => this.searchDetails(e)}
            onChange={e => !e.target.value && this.searchDetails(e.target.value)}
          />
          <CreateTree {...createTreeConfig} />
        </div>
        <div className={Styles.right}>
          <FormItems
            formConfigs={this.getFormConfigs()}
            form={form}
            loading={loading}
          />
        </div>
      </div>
    );
  }
}

export default Form.create({})(FaultData);
;
