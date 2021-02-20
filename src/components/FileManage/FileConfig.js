import { Component, Fragment } from 'react';
import { Form, message } from 'antd';
import { connect } from 'dva';
import DefaultFrame from '../Frames/DefaultFrame/DefaultFrame';
import { BaseContext } from '../../constants/global';
import FooterButton from '../common/FooterButton/FooterButton';
import TreeFooter from '../common/TreeFooter/TreeFooter';
import CreateTree from '../common/CreateTree/CreateTree';
import DetailContent from './DetailContent/DetailContent';
import {
  getTree,
} from '../../services/fileManger';
import styles from './FileConfig.less';
import { addFileTreeNode, updateMenu } from '@/services/fileManger';
import { getFrameTypeList } from '@/services/menuManager';

@connect(state => ({
  functionData: state.tabs.activeTabData.functionData,
  user: state.user,
}))
class FileConfig extends Component {
  static contextType = BaseContext;
  state = {
    treeData: [], // 树数据
    activeTreeNodeDetail: {}, // 当前选中的树节点信息
    activeDetail: {}, // 根据树节点信息获取的该节点具体详情
    actionType: '', // 操作类型
    defaultframeId: '', // 功能库id
    optionList: [],
    keywords: '', // 关键字
    loadingStatus: { // loading状态
      saveBtn: false, // 保存按钮
      getDetail: false, // 点击树节点获取详情
      getTree: false, // 获取树数据
    },
  };

  componentDidMount() {
    this.fetchTree();
    this.getOptionList();
  }

  // 获取树数据
  fetchTree = () => {
    this.setLoadingStatus('getTree', true);
    const { keywords } = this.state;
    getTree({ keywords }).then(treeData => {
      keywords && this.treeRef && this.treeRef.setSearchExpandKeys(treeData);
      this.setState({
        treeData,
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
          api: addFileTreeNode,
          params: {
            ...values,
            rootId: id,
            defaultframeId: this.state.defaultframeId,
            rootpath: rootpath ? `${rootpath}/${id}` : `/${id}`,
          },
        };
      case 'addElement':
        return { // 新增元素
          api: addFileTreeNode,
          params: {
            ...values,
            defaultframeId: this.state.defaultframeId,
            rootId: id,
            rootpath: rootpath ? `${rootpath}/${id}` : `/${id}`,
          },
        };
      case 'editGroup':
        return { // 修改元素
          api: updateMenu,
          params: {
            ...values,
            defaultframeId: this.state.defaultframeId,
            id: id,
          },
        };
      case 'editElement':
        return { // 修改元素
          api: updateMenu,
          params: {
            ...values,
            defaultframeId: this.state.defaultframeId,
            id: id,
          },
        };
      default:
        return {
          api: addFileTreeNode,
          params: values,
        };
    }
  };

  // 更新状态
  updateFrameState = (itemObj, callback) => {
    this.setState({ ...itemObj }, () => {
      callback && callback();
    });
  };
  // 设置功能库id
  setDefaultframeId = (defaultframeId) => {
    this.setState({
      defaultframeId: defaultframeId,
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
    const { actionType, activeDetail } = this.state;
    let newParams = { ...params, name: activeDetail.name, namelanguageid: activeDetail.namelanguageid };
    api(newParams).then(res => {
      message.success(langLib['message.save.success']);
      this.setLoadingStatus('saveBtn', false);
      if (actionType === 'addElement' || actionType === 'addGroup') {
        this.resetDetailForm();
      }
      this.fetchTree();
    }, err => this.setLoadingStatus('saveBtn', false));
  };
  getOptionList = () => {
    getFrameTypeList({}).then((res) => {
      this.setState({
        optionList: res,
      });
    });
  };

  render() {
    const { activeDetail, activeTreeNodeDetail, actionType, loadingStatus, treeData, tableList, elementTypeList, tableColList, optionList } = this.state;
    const isInitialData = !!((+activeTreeNodeDetail.initialData) && actionType !== 'addGroup');
    const { form, functionData, user } = this.props;
    const { canmodify, canadd } = functionData.attributes;
    const detailContentProps = {
      form,
      user,
      tableList,
      elementTypeList,
      tableColList,
      activeDetail,
      activeTreeNodeDetail,
      actionType,
      isInitialData,
      loading: loadingStatus.getDetail,
      updateFrameState: this.updateFrameState,
      setDefaultframeId: this.setDefaultframeId,
      optionList,
    };
    // 按钮配置
    const btnConfigs = [{
      type: 'primary',
      onClick: this.onSubmit,
      loading: loadingStatus.saveBtn,
    }];
    const createTreeConfig = {
      functionData,
      dataType: 'menu',
      treeData,
      form,
      nodeConfig: {
        notGroupIcon: true,
        isMainTree: true,
      },
      needRightMenu: true,
      fetchTree: this.fetchTree,
      loading: loadingStatus.getTree,
      resetDetailForm: this.resetDetailForm,
      setLoadingStatus: this.setLoadingStatus,
      activeTreeNodeDetail,
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
        <DetailContent {...detailContentProps} />
      </Form>
    ) : null;
    let footer = null;
    if (isInitlPage) {
      if (canmodify && isInitlPage.indexOf('edit') > -1) {
        footer = <FooterButton btnConfigs={btnConfigs}/>;
      }
      if (canadd && isInitlPage.indexOf('add') > -1) {
        footer = <FooterButton btnConfigs={btnConfigs}/>;
      }
    } else {
      footer = null;
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

export default Form.create()(FileConfig);
