/*
 * @Author: Fus
 * @Date:   2019-08-10 14:09:13
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2020-02-24 14:19:52
 * @Desc: 框架界面配置
 */
import { Component, Fragment } from 'react';
import { Form, Modal } from 'antd';
import { connect } from 'dva';
import { FormattedMessage } from 'react-intl';
import { CMessage, SearchSelect } from '@/components/common/BasicWidgets';
import CreateModal from '@/components/common/CreateModal/CreateModal';
import DefaultFrame from '../Frames/DefaultFrame/DefaultFrame';
import { BaseContext } from '../../constants/global';
import CreateTree from '@/components/common/CreateTree/CreateTree';
import TabPaneConTainer from './TabPaneConTainer/TabPaneConTainer';
import SelectUserDesigner from './SelectUserDesigner/SelectUserDesigner';
import { getFunctionTree } from '@/services/function';
import styles from './FramePageConfig.less';
import CopyUserDesignerMenu from '../common/CopyUserDesignerMenu/CopyUserDesignerMenu';
import { getDefaultConfirmProps } from '@/utils/common';
import {
  copyUserDesignerData,
  deleteUserDesignerFunction,
  getFrameDetail,
  getThirdinterface,
} from '@/services/framePage';
import ModalBox from '@/components/common/ReminderBox/ReminderBox';

@connect(state => ({
  framePage: state.framePage,
  functionData: state.tabs.activeTabData.functionData,
}))
class FramePageConfig extends Component {
  static contextType = BaseContext;
  state = {
    treeData: [], // 树数据
    activeTabListKey: 'frameConfig', // 当前tabkey（frameConfig为框架配置，其他类型为面板配置）
    keywords: '', // 关键字
    visibleCopy: false, // 复制菜单弹框
    targetFunctionId: 0, // 目标菜单
    targetUserDesignerId: 0, // 目标用户组
    loadingStatus: { // loading状态
      saveBtn: false, // 保存按钮
      getDetail: false, // 点击树节点获取详情
      getTree: false, // 获取树数据
      copy: false, // 复制用户设计组数据
    },
  };

  componentDidMount() {
    this.fetchTree();
    this.getServers();
  }

  // 获取第三方接口，用在基本信息中
  getServers = () => {
    getThirdinterface({}).then(res => {
      const { dispatch } = this.context;
      dispatch({
        type: 'framePage/updateState',
        payload: {
          apiList: res || [],
        },
      });
    });
  };
  // 获取菜单树
  fetchTree = () => {
    this.setLoadingStatus('getTree', true);
    const { keywords } = this.state;
    getFunctionTree({ keywords }).then(treeData => {
      keywords && this.treeRef && this.treeRef.setSearchExpandKeys(treeData);
      this.setState({ treeData });
      this.setLoadingStatus('getTree', false);
    }, err => this.setLoadingStatus('getTree', false));
  };
  // 获取菜单面板数据
  fetchFrameDetail = () => {
    const { functionId, userDesignerId } = this.props.framePage;
    this.setLoadingStatus('getDetail', true);
    getFrameDetail({ functionId, userDesignerId, planned: 10 }).then(activeDetail => {
      this.setLoadingStatus('getDetail', false);
      this.updateMainData({
        activeDetail,
      });
    }, err => this.setLoadingStatus('getDetail', false));
  };
  // 点击菜单树前校验,需要选定设计组
  validBeforeGetDetail = () => {
    // 默认回至框架配置页
    this.setState({ activeTabListKey: 'frameConfig' });
    const { selectedUserDesignerDetail } = this.props.framePage;
    const { langLib } = this.context;
    if (!selectedUserDesignerDetail.id) {
      CMessage(langLib['message.noUserDesigner'], 'warn');
      return false;
    }
    return true;
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
  // 更新该组件状态
  setRootWrapState = (itemObj, callback) => {
    this.setState(itemObj, () => callback && callback());
  };
  // 将树节点获取的详情更新至store
  updateMainData = ({ activeDetail = {}, activeTreeNodeDetail = this.props.framePage.activeTreeNodeDetail }) => {
    const { dispatch } = this.context;
    const { frame, frameTypeDto = {}, tabList } = activeDetail;
    this.props.form.resetFields();
    dispatch({
      type: 'framePage/updateState',
      payload: {
        frame: frame || {},
        frameTypeDto,
        tabList: tabList || [],
        functionId: activeTreeNodeDetail.id,
        activeTreeNodeDetail,
      },
    });
  };
  // 点击右键复制
  handleClickCopy = () => {
    this.setState({ visibleCopy: true });
  };
  // 恢复默认
  handleResetDefault = () => {
    const { langLib } = this.context;
    const { functionId, userDesignerId } = this.props.framePage;
    const that = this;
    let { close } = ModalBox.confirm({
      ...getDefaultConfirmProps(langLib),
      title: langLib['confirm.resetDefault'],
      content: '',
      onOk() {
        deleteUserDesignerFunction({ functionId, userDesignerId }).then(res => {
          CMessage(langLib['message.success.reset']);
          that.fetchFrameDetail();
          closeModal();
        });
      },
      onCancel: () => closeModal(),
    });
    const closeModal = () => {
      close();
    };
    // Modal.confirm({
    //   className: 'customConfirmColor',
    //   ...getDefaultConfirmProps(langLib),
    //   title: langLib['confirm.resetDefault'],
    //   content: '',
    //   onOk() {
    //     deleteUserDesignerFunction({ functionId, userDesignerId }).then(res => {
    //       CMessage(langLib['message.success.reset']);
    //       that.fetchFrameDetail();
    //     });
    //   },
    //   onCancel() {
    //   },
    // });
  };
  // 保存复制确定
  handleSaveCopy = () => {
    const { framePage } = this.props;
    const { langLib } = this.context;
    const { targetFunctionId: functionId, targetUserDesignerId: userDesignerId } = this.state;
    const { functionId: oldFunctionId, userDesignerId: oldUserDesignerId } = framePage;
    const params = {
      oldUserDesignerId,
      oldFunctionId,
      functionId,
      userDesignerId,
    };
    if (!functionId) {
      CMessage(langLib['message.error.noTargetFunction'], 'error');
      return;
    } else if (!userDesignerId) {
      CMessage(langLib['message.error.noTargetUserDesigner'], 'error');
      return;
    }
    this.setLoadingStatus('copy', true);
    copyUserDesignerData(params).then(res => {
      CMessage(langLib['message.success.copy']);
      this.setState({ visibleCopy: false });
      this.setLoadingStatus('copy', false);
    }, err => this.setLoadingStatus('copy', false));
  };

  render() {
    const { loadingStatus, treeData, userDesignerTreeData, activeTabListKey, visibleCopy } = this.state;
    const { form, functionData } = this.props;
    const { selectedUserDesignerDetail, activeTreeNodeDetail } = this.props.framePage;
    const tabPaneContainerProps = {
      form,
      functionData,
      activeTabListKey,
      loading: loadingStatus.getDetail,
      updateFrameState: this.setRootWrapState,
    };
    const createTreeConfig = {
      functionData,
      dataType: 'frameConfig',
      treeData,
      form,
      nodeConfig: {
        notGroupIcon: 'line-tree',
        isMainTree: true,
      },
      activeTreeNodeDetail,
      needRightMenu: true,
      fetchTree: this.fetchTree,
      loading: loadingStatus.getTree,
      updateFrameState: this.updateMainData,
      setGetDetailLoading: loading => this.setLoadingStatus('getDetail', loading),
      validBeforeGetDetail: () => this.validBeforeGetDetail(),
      getDetailParams: data => ({
        functionId: data.id,
        userDesignerId: selectedUserDesignerDetail.id,
        planned: 10,
      }),
      handleCopyMenu: this.handleClickCopy,
      handleResetDefault: this.handleResetDefault,
      ref: ref => this.treeRef = ref,
    };
    const sider = (
      <CreateTree {...createTreeConfig} />
    );
    const isInitPage = activeTreeNodeDetail.id; // 需要点击树节点后才有右侧内容；
    const content = isInitPage && <TabPaneConTainer {...tabPaneContainerProps} />;
    // 应用到设计组
    const aboveTreeComponent = <SelectUserDesigner/>;
    return (
      <Fragment>
        <DefaultFrame
          aboveTreeComponent={aboveTreeComponent}
          contentClass={styles.contentWrap}
          config={{
            initTreeFooter: false,
            hasFooter: false,
            handleSearch: keywords => this.setState({ keywords }, () => this.fetchTree()),
          }}
          sider={sider}
          content={content}
          footer={false}
        />
        <CreateModal
          visible={visibleCopy}
          title={<FormattedMessage id="framePageConfig.copyMenu.title"/>}
          onCancel={() => this.setState({ visibleCopy: false })}
          onOk={this.handleSaveCopy}
          confirmLoading={loadingStatus.copy}
        >
          <CopyUserDesignerMenu
            fromType="PC"
            setRootWrapState={this.setRootWrapState}
          />
        </CreateModal>
      </Fragment>
    );
  }
}

export default Form.create()(FramePageConfig);
