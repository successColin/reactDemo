import { Component, Fragment } from 'react';
import { Form, message } from 'antd';
import { connect } from 'dva';
import { CSearch } from '../common/BasicWidgets/index';
import DefaultFrame from '../Frames/DefaultFrame/DefaultFrame';
import { BaseContext } from '../../constants/global';
import FooterButton from '../common/FooterButton/FooterButton';
import CreateTree from '../common/CreateTree/CreateTree';
import DetailContent from './DetailContent/DetailContent';
import {
  getOrgTree,
  addOrgGroup,
  updateOrgGroup,
  updateOrg,
  addOrg,
} from '../../services/organizationFile';
import {
  fileRelationBusiness,
} from '@/services/fileManger';
import styles from './OrganizationFile.less';
import { getNodeDataFromTreeData, setNewActionType } from '@/utils/common';
import { getUserGroup } from '@/services/userManager';

@connect(state => ({
  functionData: state.tabs.activeTabData.functionData,
  userInfo: state.user.userInfo,
}))
class OrganizationFile extends Component {
  static contextType = BaseContext;

  constructor(props) {
    super(props);
    this.state = {
      treeData: [], // 树数据
      activeTreeNodeDetail: {}, // 当前选中的树节点信息
      activeDetail: {}, // 根据树节点信息获取的该节点具体详情
      actionType: '', // 操作类型
      defaultframeId: '', // 功能库id
      keywords: '', // 关键字
      loadingStatus: { // loading状态
        saveBtn: false, // 保存按钮
        getDetail: false, // 点击树节点获取详情
        getTree: false, // 获取树数据
      },
      fileRelationList: [], // 绑定的图片
    };
  }

  // state = {
  //   treeData: [], // 树数据
  //   activeTreeNodeDetail: {}, // 当前选中的树节点信息
  //   activeDetail: {}, // 根据树节点信息获取的该节点具体详情
  //   actionType: '', // 操作类型
  //   defaultframeId: '', // 功能库id
  //   loadingStatus: { // loading状态
  //     saveBtn: false, // 保存按钮
  //     getDetail: false, // 点击树节点获取详情
  //     getTree: false, // 获取树数据
  //   },
  //   fileRelationList: [], // 绑定的图片
  // };

  componentDidMount() {
    this.fetchTree();
  }

  // 获取树数据
  fetchTree = (resData) => {
    this.setLoadingStatus('getTree', true);
    const { keywords } = this.state;
    let params = keywords ? { keywords } : { groupId: 0, rootpath: '' };
    getOrgTree(params).then(treeData => {
      // keywords && this.treeRef && this.treeRef.setSearchExpandKeys(treeData);
      !keywords && this.treeRef && this.treeRef.setSearchExpandKeys([]);
      this.setState({
        treeData,
      });
      if (resData) {
        this.props.form.resetFields();
        const activeTreeNodeDetail = getNodeDataFromTreeData(resData.nodeKey, treeData);
        this.setState({
          activeDetail: resData,
          activeTreeNodeDetail,
          // actionType: '',
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
    console.log(pureId, id, rootpath, actionType, activeTreeNodeDetail, activeDetail);
    // 保存元素时需要处理的参数
    // 新建组下元素传rootId=0, groupId=上层纯id
    // 新建元素下元素传rootId=上层纯id，grouptId=上层纯groupId
    switch (actionType) {
      case 'addGroup':
        return { // 新增组
          api: addOrgGroup,
          params: {
            ...values,
            rootId: id,
            rootpath: rootpath ? `${rootpath}/${id}` : `/${id}`,
          },
        };
      case 'editGroup':
        return {
          api: updateOrgGroup,
          params: {
            ...activeDetail,
            ...values,
          },
        };
      case 'addElement':
        return { // 新增元素
          api: addOrg,
          params: {
            ...values,
            groupId: id,
            rootId: isGroup ? 0 : id,
            rootpath: rootpath ? `${rootpath}/${id}` : `/${id}`,
          },
        };
      case 'editElement':
        return { // 修改元素
          api: updateOrg,
          params: {
            ...values,
            id: id,
          },
        };
      default:
        return {
          api: addOrgGroup,
          params: values,
        };
    }
  };

  // 更新状态
  updateFrameState = (itemObj) => {
    this.setState({
      ...itemObj,
      fileRelationList: [],
    });
  };
  // 设置功能库id
  setDefaultframeId = (defaultframeId) => {
    this.setState({
      defaultframeId: defaultframeId,
    });
  };

  // 上传图片后更新
  updatePicpath = (pics) => {
    this.setState({
      fileRelationList: pics,
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
  // 绑定图片
  BindingImage = (id) => {
    const { activeDetail = {}, fileRelationList } = this.state;
    const { userInfo } = this.props;
    let fileString = [];
    for (let i = 0; i < fileRelationList.length; i++) {
      let file = {
        'mainId': fileRelationList[i],
        'relationTableName': 'organization',
        'relationId': id,
        'basetype': 2,
      };
      fileString.push(file);
    }
    if (fileString.length == 0) return;
    fileString = JSON.stringify(fileString);
    let param = {
      'token': userInfo.token,
      fileString: fileString,
    };
    fileRelationBusiness(param).then(res => {
    }, err => this.setLoadingStatus('', false));
  };
  // 保存
  handleSave = (values) => {
    const { langLib } = this.context;
    const { fileRelationList } = this.state;
    const { api, params } = this.getQueryConfig(values);
    api(params).then(res => {
      message.success(langLib['message.save.success']);
      this.setLoadingStatus('saveBtn', false);
      this.fetchTree(res);
      this.BindingImage(res.id);
      this.setState({
        fileRelationList: [],
        actionType: '',
      });
    }, err => this.setLoadingStatus('saveBtn', false));
  };
  // 更新该组件内状态
  setFrameState = (itemObj, callback) => {
    this.setState(itemObj, () => callback && callback());
  };
  // 清空表单
  resetDetailForm = () => {
    this.props.form.resetFields();
  };
  // 异步加载树
  loadMoreData = (treeNode) => {
    const { treeData, keywords } = this.state;
    return new Promise(resolve => {
      const { props } = treeNode;
      if (treeNode.props.children || keywords) {
        resolve();
        return;
      }
      const { isGroup, id, rootpath } = treeNode.props.nodeData;
      let params = isGroup ? { groupId: id, rootpath } : { rootId: id, rootpath };
      getOrgTree(params).then(res => {
        treeNode.props.nodeData.children = res;
        this.setState({
          treeData: [...this.state.treeData],
        });
        resolve();
      });
    });
  };

  render() {
    const { activeDetail, activeTreeNodeDetail, actionType, loadingStatus, treeData, tableList, elementTypeList, tableColList, fileRelationList } = this.state;
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
      setDefaultframeId: this.setDefaultframeId,
      fileRelationList: fileRelationList,
      updatePicpath: this.updatePicpath,
      setFrameState: this.setFrameState,
    };
    // 按钮配置
    const btnConfigs = [{
      type: 'primary',
      onClick: this.onSubmit,
      loading: loadingStatus.saveBtn,
    }];
    const createTreeConfig = {
      functionData,
      dataType: 'org',
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
      loadData: this.loadMoreData,
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

export default Form.create()(OrganizationFile);
