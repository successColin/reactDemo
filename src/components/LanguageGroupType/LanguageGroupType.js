import { Component } from 'react';
import { Form, message } from 'antd';
import { connect } from 'dva';
import DefaultFrame from '../Frames/DefaultFrame/DefaultFrame';
import { BaseContext } from '../../constants/global';
import { FormattedMessage } from 'react-intl';
import LanguageList from './LanguageList/LanguageList';
import CreateModal from '@/components/common/CreateModal/CreateModal';
import FooterButton from '../common/FooterButton/FooterButton';
import CreateTree from '../common/CreateTree/CreateTree';
import AsyncTree from './AsyncTree/CreateTree';
import ContentTree from './ContentTree/ContentTree';
import DetailContent from './DetailContent/DetailContent';
import {
  getLanguageGroupTree,
  languageGroupInsertOrUpdate,
  getLanguageTypeTree,
  languageTypeAction,
  langaugeTypeSwitch,
  getLanguagePath,
} from '@/services/languageGroupType';
import { getNodeDataFromTreeData, setNewActionType } from '@/utils/common';
import styles from './LanguageGroupType.less';

@connect(state => ({
  functionData: state.tabs.activeTabData.functionData,
}))
class LanguageManager extends Component {
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
    visible: false,
    selected: [], // 选中的节点
    expandedKeys: [], // 树上展开的节点
    path: [],
    elementNode: {},
  };

  componentDidMount() {
    const { isAsyncTree, templateId: id } = this.props;
    if (isAsyncTree && id) {
      getLanguagePath({ id }).then(res => {
        this.fetchTree('', res, (treeData) => {
          this.trggerRenderList();
        });
      });
    } else {
      this.fetchTree();
    }
  }

  trggerRenderList = () => {
    const { path, treeData } = this.state;
    path.forEach(item => {
      this.getParaentsGroup(item, treeData);
    });
  };
  // 获取到数据然后拼装
  getParaentsGroup = (key, nodeList) => {
    let that = this;
    const { treeData, expandedKeys, path } = this.state;
    for (let item of nodeList) {
      if (item.nodeKey === key) {
        const { isGroup, id, rootpath, rootId } = item;
        let params = isGroup ? { groupId: id, rootpath } : { rootId: id, rootpath };
        getLanguageTypeTree(params).then(list => {
          item.children = list;
          const { templateId } = that.props;
          let elementNode = list.find(item => item.id === id);
          // console.log(elementNode);
          path.splice(path.findIndex(itemKey => itemKey === key), 1);
          that.setState({
            treeData: [...treeData],
            path,
            expandedKeys: [...expandedKeys, item.nodeKey],
            // elementNode,
          }, () => {
            this.trggerRenderList();
          });
        });
      } else if (Array.isArray(item.children) && item.children.length) {
        this.getParaentsGroup(key, item.children);
      }
    }
  };

  // 根据字段返回对应的模板id
  returnFieldLanguageId = (key) => {
    let languageId = '';
    let fieldName = null;
    if (key === 'placeholderText') {
      fieldName = 'placeholderTextLanguageId';
    } else if (key === 'tooltipText') {
      fieldName = 'tooltipTextLanguageId';
    } else if (key === 'displayName') {
      fieldName = 'displayLanguageId';
    }
    return fieldName;
  };

  // 获取树数据
  fetchTree = (resData, path, callback) => {
    this.setLoadingStatus('getTree', true);
    const { keywords } = this.state;
    let params = keywords ? { keywords } : { groupId: 0, rootpath: '' };
    getLanguageTypeTree(params).then(treeData => {
      // keywords && this.treeRef && this.treeRef.setSearchExpandKeys(treeData);
      !keywords && this.treeRef && this.treeRef.setSearchExpandKeys([]);
      this.setState({
        treeData,
        activeDetail: {},
        activeTreeNodeDetail: {},
        actionType: '',
        path,
      });
      if (callback) {
        callback(treeData);
      }
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
    // 保存元素时需要处理的参数
    // 新建组下元素传rootId=0, groupId=上层纯id
    // 新建元素下元素传rootId=上层纯id，grouptId=上层纯groupId
    switch (actionType) {
      case 'addGroup':
        return { // 新增组
          api: languageGroupInsertOrUpdate,
          params: {
            ...values,
            rootId: id,
            rootpath: rootpath ? `${rootpath}/${id}` : `/${id}`,
          },
        };
      case 'editGroup':
        return {
          api: languageGroupInsertOrUpdate,
          params: {
            ...activeDetail,
            ...values,
          },
        };
      default:
        return {
          api: languageGroupInsertOrUpdate,
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
      const { actionType } = this.state;
      if (actionType === 'addElement' || actionType === 'editElement') {
        this.languageList && this.insertOrUpdate();
        return;
      }
      this.handleSave(values);
    });
  };
  // 点击选择
  onChoose = () => {
    const { chooseCallbackFun, updateState } = this.props;
    const { activeDetail, activeTreeNodeDetail } = this.state;
    const { isGroup } = activeTreeNodeDetail;
    if (isGroup) {
      const { langLib } = this.context;
      message.error(langLib['message.err.templateId']);
    } else {
      if (updateState) {
        updateState({
          loading: true,
        }, () => {
          chooseCallbackFun(activeDetail);
        });
      } else {
        chooseCallbackFun(activeDetail);
      }
    }
  };
  // 新增模板中的语言
  insertOrUpdate = () => {
    const { state } = this.languageList;
    const { langLib } = this.context;
    const { activeTreeNodeDetail, activeDetail, actionType } = this.state;

    let params = {
        groupId: actionType === 'addElement' ? activeTreeNodeDetail.id : activeTreeNodeDetail.groupId,
        rootId: 0,
        id: activeDetail.id || '',
        name: state.name,
        list: state.list,
      }
    ;
    languageTypeAction(params).then(res => {
      this.setLoadingStatus('saveBtn', false);
      this.fetchTree();
      message.success(langLib['message.save.success']);
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
      this.fetchTree(res);
    }, err => this.setLoadingStatus('saveBtn', false));
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
      const { isGroup, id, rootpath, rootId } = treeNode.props.nodeData;
      let params = isGroup ? { groupId: id, rootpath } : { rootId: id, rootpath };
      getLanguageTypeTree(params).then(res => {
        treeNode.props.nodeData.children = res;
        this.setState({
          treeData: [...this.state.treeData],
        });
        resolve();
      });
    });
  };
  // 切换节点
  handleSwitch = () => {
    const { selected, activeDetail, activeTreeNodeDetail } = this.state;
    const { langLib } = this.context;
    if (!selected.length || JSON.stringify(activeDetail) === '{}') return;
    const { isGroup } = activeTreeNodeDetail;
    let params = {
      id: !isGroup ? activeDetail.id : '',
      languagesTemplateGroupId: isGroup ? activeTreeNodeDetail.id : '',
      switchGroupId: selected[0].id,
      switchRootId: isGroup ? selected[0].id : 0,
    };
    langaugeTypeSwitch(params).then(res => {
      message.success(langLib['message.save.success']);
      this.fetchTree();
      this.setState({ visible: false, selected: [] });
    });
  };

  render() {
    const { elementNode, visible, activeDetail, activeTreeNodeDetail, actionType, loadingStatus, treeData, tableList, elementTypeList, tableColList, expandedKeys } = this.state;
    const { form, type, isAsyncTree = false, functionData } = this.props;
    const { canmodify, canadd, candelete } = functionData.attributes;
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
    if (type === 'addChooseBtn') {
      btnConfigs.unshift({
        type: 'primary',
        text: 'global.chooseName',
        loading: this.props.loading || false,
        onClick: this.onChoose,
      });
    }
    const createTreeConfig = {
      ...this.props,
      functionData,
      dataType: 'languageGroup',
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
      returnFieldLanguageId: this.returnFieldLanguageId,
      loading: loadingStatus.getTree,
      resetDetailForm: this.resetDetailForm,
      setLoadingStatus: this.setLoadingStatus,
      updateFrameState: this.updateFrameState,
      setGetDetailLoading: loading => this.setLoadingStatus('getDetail', loading),
      loadData: this.loadMoreData,
      ref: ref => this.treeRef = ref,
      expandedKeys,
      elementNode,
    };
    const sider = (
      isAsyncTree ? <AsyncTree {...createTreeConfig}/> : <CreateTree {...createTreeConfig} />
    );
    const isInitlPage = (treeData.length && actionType);
    const languageListProps = {
        actionType,
        functionData,
        activeTreeNodeDetail,
        activeDetail,
        ref: ref => this.languageList = ref,
      }
    ;
    let content = '';
    if (isInitlPage && (actionType === 'addGroup' || actionType === 'editGroup')) {
      content = (<Form className={styles.contentWrap}>
        <DetailContent {...detailContentProps} />
      </Form>);
    } else if (isInitlPage && (actionType === 'addElement' || actionType === 'editElement')) {
      content = (<LanguageList {...languageListProps}/>);
    } else {
      content = null;
    }
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
    const ModalProps = {
      title: <FormattedMessage id="tree.more.moveNode"/>,
      visible,
      onCancel: () => {
        this.setState({ visible: false, selected: [] });
      },
      onOk: () => {
        this.handleSwitch();
      },
    };
    return (
      <div className={styles.box}>
        <DefaultFrame
          sider={sider}
          content={content}
          footer={footer}
          config={{
            handleSearch: keywords => this.setState({ keywords }, () => this.fetchTree()),
          }}
        />
        <CreateModal {...ModalProps}>
          <ContentTree
            updateFrameState={this.updateFrameState}
            type='languageGroup'
          />
        </CreateModal>
      </div>
    );
  }
}

export default Form.create()(LanguageManager);
