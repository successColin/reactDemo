/*
 * @Author: Fus
 * @Date:   2019-06-18 18:49:17
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2019-11-19 09:54:30
 * @Desc: 通用 创建树组件
 */
import { Component, Fragment } from 'react';
import { Tree, Menu, Modal, message } from 'antd';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';
import { BaseContext } from '@/constants/global';
import { getDefaultConfirmProps } from '@/utils/common';
import { CSpin, CMessage } from '@/components/common/BasicWidgets';
import CreateModal from '@/components/common/CreateModal/CreateModal';
import {
  getTree as getElementTree,
  getGroupDetail as getElementGroupDetail,
  doDelGroup as delElementGroup,
  getElementDetail,
  doDelElement,
} from '@/services/element';
import { getIconList as getIconGroupDetail } from '@/services/icon';
import { getTabGroupDetail, deleteTabGroup, getTabDetail, deleteTab } from '@/services/pageConfig';
import {
  getUserDesignerDetail,
  getUserDesignerGroupDetail,
  deleteUserDesigner,
  deleteUserDesignerGroup,
} from '@/services/userDesigner';
import { getDetialById, delFileTreeNode } from '@/services/fileManger';
import { getStateGroupDetial, getStateDetial, deleteStateGroup, deleteState } from '@/services/stateManager';
import { getTypeGroupDetial, getTypeDetial, deleteTypeGroup, deleteType } from '@/services/typeManager';
import { getPriorityGroupDetial, getPriorityDetial, deletePriorityGroup, deletePriority } from '@/services/priorityManager';
import { getFilesDetails, deleteFileGroup } from '@/services/knowledgeBase';
import { getUserDetial, getUserGroupDetial, delUser, delUserGroup } from '@/services/userManager';
import {
  getMobileTabDetail,
  getMobileTabGroupDetail,
  deleteMobileTab,
  deleteMobileTabGroup,
} from '@/services/mobileConfig';
import { getRoleGroupDetial, getRoleDetial, delRoleGroupDetial, delRoleDetial } from '@/services/roleManger';
import { getOrgGroupDetial, getOrgDetial, deleteOrgGroup, deleteOrg } from '@/services/organizationFile';
import { getCodeGroupDetial, getCodeDetial, deleteCodeGroup, deleteCodeRule } from '@/services/codingSetting';
import { getImprotGroupDetial, getImportDetial, delImportGroup, deleteImport } from '@/services/templateFiles';
import { getBundleGroupDetail, getBundleDetail, deleteBundleGroup, deleteBundle } from '@/services/bundleConfig';
import {
  getGlobalCenterDetialById,
  getGlobalCenterGroup,
  deleteGlobalCenterGroup,
  deleteGlobalcenter,
} from '@/services/globalcenter';
import { deleteAppGroup, getAppGroupDetail } from '@/services/appLibrary';
import { getGroup, getJavaDetialById, deleteGroup, delJavaBean, getTableDetial } from '@/services/javaBean';
// import { getFrameDetail } from '@/services/function';
import { getFrameDetail } from '@/services/framePage';
import styles from './CreateTree.less';
import ModalBox from '@/components/common/ReminderBox/ReminderBox';

const { TreeNode } = Tree;
const { confirm } = Modal;
const MenuItem = Menu.Item;
// 右键选项标识符
const rightItemName = 'rightItem';
// 为避免点击‘新增’时会触发onSelect而发生数据覆盖
// let editType = 'edit';

// “更多”的操作列表
const overlayConfigs = [
  {
    type: 'addGroup',
    id: 'tree.more.addGroup',
  }, {
    type: 'delGroup',
    id: 'tree.more.delGroup',
  }, {
    type: 'addElement',
    id: 'tree.more.addChild',
  }, {
    type: 'delElement',
    id: 'global.del',
  }, {
    type: 'addFileGroup',
    id: 'tree.more.addGroup',
  }, {
    type: 'moveNode',
    id: 'tree.more.moveNode',
  },
];

/**
 * TODO: 树的搜索功能由前端实现
 */
// 默认传入属性
const initProps = {
  dataType: 'element', // 数据类型  element元素 tab面板 module组件库 userDesigner用户设计组
  activeTreeNodeDetail: {}, // 当前树节点信息
  treeStyle: 'default', // 树的风格，default默认风格（白底，黄色图标） dark（透明灰色底，蓝色图标，白色字）
  needRightMenu: false, // 是否需要右键菜单
  needGetDetail: true, // 是否需要点击走接口获取详情
  checkable: false, // 是否需要显示选择框
  defaultExpandAll: false, // 是否自动展开父节点
  treeMap: {}, // 当点击树节点不需要走接口获取时，从treeMap获取对应数据
  visibleMoveNode: false, // 转移节点弹窗是否显示
  setGetDetailLoading: () => {
  }, // 点击节点获取详情接口加载状态
  updateFrameState: () => {
  }, // 更新父容器函数
  handleAfterGetDetail: () => {
  }, // 点击获取详情后的回调
  getDetailParams: () => {
  }, // 获取详情的接口参数
  validBeforeGetDetail: () => {
    return true;
  }, // 点击详情前的校验
  nodeConfig: { // 树节点配置
    notGroupIcon: false, // 非组的节点前缀图标（false表示从数据层获取）
    isMainTree: false, // 是否是主树（用于样式区分，主树选中状态左侧有红色竖条，非主树选中无竖条）
    className: '',
    hasRightIcon: false, // 是否有右侧箭头图标
    rightIconToward: 'left', // 右侧箭头朝向
  },
};

class CreateTree extends Component {
  static contextType = BaseContext;
  static defaultProps = initProps;
  state = {
    //  activeTreeNodeKey: '', // 当前树节点id
    rightClickNodeTreeItem: {}, // 右键数据
    showRightClickMenu: false, // 是否显示右键菜单
    expandedKeys: [], // 展开的节点
    checkedKeys: [], // 通过复选框选中的节点
    moveNodeExpandedKeys: [], // 转移节点弹窗中展开的节点
    moveNodeCheckedKeys: [], // 转移节点弹窗中选择的节点
    loadingGetDetail: false, // 加载节点详情接口状态
  };
  listenClick = (e) => {
    // 避免与点击右键冲突
    if (e.target.parentElement.className === rightItemName || e.target.className === rightItemName) {
      this.removeBodyClickListen();
      return;
    } else if (this.state.showRightClickMenu) {
      this.setState({ showRightClickMenu: false });
    }
    this.removeBodyClickListen();
  };
  // body click事件监听   关闭右键菜单
  addBodyClickListen = () => {
    window.document.getElementsByTagName('body')[0].addEventListener('click', this.listenClick);
  };
  removeBodyClickListen = () => {
    window.document.getElementsByTagName('body')[0].removeEventListener('click', this.listenClick);
  };
  // 获取树的操作入口列表
  getOverlayMenu = (treeNode) => {
    if (!treeNode) return <Fragment/>;
    const { isGroup = false, initialData, rootpath, id, groupId } = treeNode;
    const menuConfig = {};
    overlayConfigs.forEach(item => menuConfig[item.type] = (
      <MenuItem onClick={() => this.onClickMore(item.type, treeNode)} key={`rightMenu-${item.type}`}>
        {<span className={rightItemName}><FormattedMessage id={item.id}/></span>}
      </MenuItem>
    ));
    const isInitialData = !!(+initialData);
    const {
      addGroup, delGroup, addElement, delElement, addFileGroup, moveNode,
    } = menuConfig;

    const { dataType } = this.props;
    let menuList = [];
    console.log(dataType === 'state');
    // 初始数据不允许删除修改
    if (dataType === 'role') { // 角色管理
      if (isGroup && treeNode.rootpath.split('/').length === 2) {
      } else if (isGroup && treeNode.rootpath.split('/').length === 3) {
        menuList = [addGroup, addElement];
      } else if (isGroup && treeNode.rootpath) {
        menuList = [addGroup, delGroup, addElement];
      } else {
        menuList = [delElement];
      }
    } else if (dataType === 'global') { // 全局配置中心
      if (id === 1 || id === 2 || groupId === 2 || id === 3 || groupId === 3) {
        menuList = [];
      } else if (id === 4) {
        menuList = [addGroup, addElement];
      } else {
        if (isGroup) { // 组
          menuList = [addGroup, delGroup, addElement];
        } else { // 元素
          menuList = [delElement];
        }
      }

    } else if (dataType === 'appLibrary') { // app档案只有分组
      menuList = [addGroup, delGroup];
      if (isInitialData) menuList = [addGroup];
    } else if (dataType === 'fileGroup') { // 知识库
      menuList = [addFileGroup, delGroup];
      if (isInitialData) menuList = [addFileGroup];
    } else if (dataType === 'org') { // 组织档案
      if (isGroup) {
        menuList = [addGroup, delGroup, addElement];
      } else {
        menuList = [addElement, delElement];
      }
    } else {
      if (isInitialData) { // 初始数据
        if (dataType === 'userDesigner' && !isGroup) { // 用户设计组默认项不允许操作
          menuList = [];
        } else {
          menuList = [addGroup];
        }
      } else {
        if (isGroup) { // 组
          menuList = [addGroup, delGroup, addElement, moveNode];
        } else { // 元素
          if (dataType === 'element' || dataType === 'menu') {
            menuList = [addElement, delElement, moveNode];
          } else {
            menuList = [delElement, moveNode];
          }
        }
      }
    }
    console.log(menuList);
    return menuList;
  };
  // 点击树上的【更多】操作
  onClickMore = (type, treeNode) => {
    this.setState({ showRightClickMenu: false });
    // editType = 'add';
    switch (type) {
      case 'addGroup': { // 新增组
        this.props.updateFrameState({
          activeDetail: {},
          activeTreeNodeDetail: treeNode,
          actionType: type,
          visible: true,
        });
        this.props.form && this.props.form.resetFields();
      }; break;
      case 'delGroup': { // 删除组
        if (this.validHasChild(treeNode)) {
          this.showConfirmDel(treeNode);
        }
      }; break;
      case 'delElement': { // 删除元素
        this.showConfirmDel(treeNode);
      }; break;
      case 'addElement': { // 新增子级
        this.props.updateFrameState({
          activeDetail: {},
          activeTreeNodeDetail: treeNode,
          actionType: type,
        });
        this.props.form && this.props.form.resetFields();
      }; break;
      case 'addFileGroup': { // 新增组
        this.props.updateFrameState({
          // activeDetail: {},
          activeTreeNodeDetail: treeNode,
          actionType: type,
          visible: true,
        });
      }; break;
      case 'moveNode': {
        this.setState({
          visibleMoveNode: true,
        });
      }; break;
      default: break;
    }
  };
  // 校验是否有子级，有则无法删除
  validHasChild = (treeNode) => {
    const { children } = treeNode;
    const { langLib } = this.context;
    if (children && children.length) {
      CMessage(langLib['message.error.hasChild'], 'error');
      return false;
    }
    return true;
  };
  // 删除二次提醒
  showConfirmDel = (treeNode) => {
    const { name } = treeNode;
    const { langLib } = this.context;
    const that = this;
    let { close } = ModalBox.confirm({
      ...getDefaultConfirmProps(langLib),
      className: 'customConfirmColor',
      title: langLib['confirm.del'](name),
      content: '',
      onOk() {
        that.onDelTreeNode(treeNode);
        closeModal();
      },
      onCancel: () => closeModal(),
    });
    const closeModal = () => {
      close();
    };
    // confirm({
    //   ...getDefaultConfirmProps(langLib),
    //   className: 'customConfirmColor',
    //   title: langLib['confirm.del'](name),
    //   content: '',
    //   onOk() {
    //     that.onDelTreeNode(treeNode);
    //   },
    //   onCancel() {
    //   },
    // });
  };
  // 删除树节点
  onDelTreeNode = (treeNode) => {
    const { langLib } = this.context;
    const { fetchTree, dataType } = this.props;
    const { id } = treeNode;
    const { del, delParams = {} } = this.getNodeOperatorApi(treeNode);
    // planned: 1, userDesignerId, functionId, bundleId,
    let params;
    if (dataType === 'java') {
      if (treeNode.isGroup) {
        params = {
          id: treeNode.id,
        };
      } else {
        params = {
          tableName: treeNode.name,
        };
      }

    } else {
      params = {
        id,
        ...delParams,
      };
    }

    del(params).then(res => {
      CMessage(langLib['message.del.success'], 'success');
      this.props.updateFrameState({
        activeDetail: {},
        activeTreeNodeDetail: {},
        actionType: '',
      });
      fetchTree();
    });
  };
  // 展开、折叠节点
  handleExpand = (node, treeType = 'normal') => {
    const { expandedKeys, moveNodeExpandedKeys } = this.state;
    const exKeysName = treeType === 'normal' ? 'expandedKeys' : 'moveNodeExpandedKeys';
    let newExpandKeys = treeType === 'normal' ? [...expandedKeys] : [...moveNodeExpandedKeys];
    // 点击即打开、关闭节点
    const activeExpandKeyId = node.nodeKey;
    const activeExpandKeyIndex = expandedKeys.indexOf(activeExpandKeyId);
    if (activeExpandKeyIndex === -1) {
      newExpandKeys.push(activeExpandKeyId);
    } else {
      newExpandKeys.splice(activeExpandKeyIndex, 1);
    }
    // 设置树的当前节点
    this.setState({
      [exKeysName]: newExpandKeys,
      //  activeTreeNodeDetail: node,
    });
  };
  // 点击获取树节点-编辑
  onSelectNode = ({
    e,
    hideRightMenu = true,
    needExpand = true,
  }) => {
    // 取消右键菜单显示
    hideRightMenu && this.setState({ showRightClickMenu: false });
    // 展开节点
    const { setLoadingStatus, resetDetailForm, updateFrameState, treeMap, setGetDetailLoading, getDetailParams, needGetDetail, validBeforeGetDetail, checkable, handleAfterGetDetail, dataType } = this.props;
    const { expandedKeys } = this.state;
    resetDetailForm && resetDetailForm();
    let reqId = '';
    let activeTreeNodeDetail = {};
    let isGroup = false;
    const { nodeData = {}, eventKey = '' } = e.node.props;
    isGroup = nodeData.isGroup;
    // 不用selectedKeys是为了避免重复点击取消选中
    reqId = eventKey.split('-')[0];
    activeTreeNodeDetail = nodeData;
    needExpand && this.handleExpand(activeTreeNodeDetail);
    // 设置复选框选中状态(只允许选中非组节点)
    if (checkable) {
      // 设置复选框选中状态(只允许选中非组节点)
      const isChecked = e.selected || e.checked;
      this.handleChecked(isChecked, e);
    }
    // 先更新当前节点为避免树active状态延迟
    updateFrameState({
      activeTreeNodeDetail,
      activeDetail: {},
      actionType: isGroup ? 'editGroup' : 'editElement',
      groupId: nodeData.id,
    });
    // 不需要点击获取详情，直接把treeNode返回父组件
    if (!needGetDetail) return;
    const { getDetail } = this.getNodeOperatorApi(activeTreeNodeDetail);
    if (!validBeforeGetDetail(activeTreeNodeDetail)) { // 点击获取详情前的校验
      return;
    }

    const reqParams = getDetailParams(activeTreeNodeDetail) || { id: reqId };
    if (getDetail) { // 点击节点走接口(不是树节点的接口，是获取该节点详情的接口)
      setGetDetailLoading(true);
      getDetail(reqParams).then(activeDetail => {
        setGetDetailLoading(false);
        updateFrameState({
          activeTreeNodeDetail,
          activeDetail,
          actionType: isGroup ? 'editGroup' : 'editElement',
        });
        handleAfterGetDetail && handleAfterGetDetail();
      }, err => setGetDetailLoading(false));
    } else { // 不用走找接口，从map中获取
      updateFrameState({
        activeTreeNodeDetail,
        activeDetail: treeMap[activeTreeNodeDetail.id],
        actionType: isGroup ? 'editGroup' : 'editElement',
      });
    }
  };
  // 选择树节点复选框
  handleChecked = (isChecked, e) => {
    const { node } = e;
    const { nodeData } = node.props;
    if (nodeData.isGroup) {
      // 只允许选择非组节点
      this.setState({ checkedKeys: [] });
      this.props.updateFrameState({
        activeTreeNodeDetail: nodeData,
        activeDetail: {},
      });
      return;
    }
    // @TODO: 目前只做了单选
    if (isChecked) {
      this.setState({ checkedKeys: [nodeData.nodeKey] });
    } else {
      this.setState({ checkedKeys: [] });
    }
    this.props.updateFrameState({
      activeTreeNodeDetail: nodeData,
      activeDetail: nodeData,
      actionType: nodeData.isGroup ? 'editGroup' : 'editElement',
    });
  };
  // 对树节点操作时的接口
  getNodeOperatorApi = (treeNode) => {
    const { dataType } = this.props;
    const { isGroup } = treeNode;
    switch (dataType) {
      case 'tab':
        return { // 面板
          getDetail: isGroup ? getTabGroupDetail : getTabDetail,
          del: isGroup ? deleteTabGroup : deleteTab,
        };
      case 'mobileTab':
        return { // 移动端面板
          getDetail: isGroup ? getMobileTabGroupDetail : getMobileTabDetail,
          del: isGroup ? deleteMobileTabGroup : deleteMobileTab,
          delParams: isGroup ? {} : {
            planned: 1,
          },
        };
      case 'bundleConfig':
        return { // bundle配置
          getDetail: isGroup ? getBundleGroupDetail : getBundleDetail,
          del: isGroup ? deleteBundleGroup : deleteBundle,
        };
      case 'appLibrary':
        return { // app档案
          getDetail: getAppGroupDetail,
          del: deleteAppGroup,
        };
      case 'element':
        return { // 元素
          getDetail: isGroup ? getElementGroupDetail : getElementDetail,
          del: isGroup ? delElementGroup : doDelElement,
        };
      case 'icon':
        return { // 图标库
          getDetail: getIconGroupDetail,
        };
      case 'userDesigner':
        return { // 用户设计组
          getDetail: isGroup ? getUserDesignerGroupDetail : getUserDesignerDetail,
          del: isGroup ? deleteUserDesignerGroup : deleteUserDesigner,
        };
      case 'menu':
        return { // 菜单管理
          getDetail: getDetialById,
          del: delFileTreeNode,
        };
      case 'java': // 实体管理
        return {
          getDetail: isGroup ? getGroup : getTableDetial,
          del: isGroup ? deleteGroup : delJavaBean,
        };
      case 'role':
        return { // 角色管理
          getDetail: isGroup ? getRoleGroupDetial : getRoleDetial,
          del: isGroup ? delRoleGroupDetial : delRoleDetial,
        };
      case 'users':
        return { // 用户管理
          getDetail: isGroup ? getUserGroupDetial : getUserDetial,
          del: isGroup ? delUserGroup : delUser,
        };
      case 'codeSetting':
        return { // 编码设置
          getDetail: isGroup ? getCodeGroupDetial : getCodeDetial,
          del: isGroup ? deleteCodeGroup : deleteCodeRule,
        };
      case 'template':
        return { // 模板配置
          getDetail: isGroup ? getImprotGroupDetial : getImportDetial,
          del: isGroup ? delImportGroup : deleteImport,
        };
      case 'frameConfig':
        return { // 框架配置
          getDetail: getFrameDetail,
        };
      case 'userDesignerTab':
        return { // 用户设计组面板
          getDetail: getTabDetail,
        };
      case 'global':
        return {
          getDetail: isGroup ? getGlobalCenterGroup : getGlobalCenterDetialById,
          del: isGroup ? deleteGlobalCenterGroup : deleteGlobalcenter,
        };
      case 'fileGroup':
        return { // 知识库
          getDetail: getFilesDetails,
          del: deleteFileGroup,
        };
      case 'state':
        return { // 状态管理
          getDetail: isGroup ? getStateGroupDetial : getStateDetial,
          del: isGroup ? deleteStateGroup : deleteState,
        };
      case 'type':
        return { // 类型管理
          getDetail: isGroup ? getTypeGroupDetial : getTypeDetial,
          del: isGroup ? deleteTypeGroup : deleteType,
        };
      case 'Priority':
        return { // 优先级管理
          getDetail: isGroup ? getPriorityGroupDetial : getPriorityDetial,
          del: isGroup ? deletePriorityGroup : deletePriority,
        };
      case 'org':
        return { // 组织档案
          getDetail: isGroup ? getOrgGroupDetial : getOrgDetial,
          del: isGroup ? deleteOrgGroup : deleteOrg,
        };
      default:
        return {};
    }
  };
  // tree列表上右键事件
  onRightClick = e => {
    const { nodeData } = e.node.props;
    this.addBodyClickListen();
    const fullHeight = document.body.clientHeight;
    const rightMenuHeight = 128;
    const pageY = rightMenuHeight + e.event.pageY + 42 > fullHeight ? fullHeight - rightMenuHeight : e.event.pageY;
    this.setState({
      activeTreeNodeKey: nodeData.nodeKey,
      showRightClickMenu: true,
      rightClickNodeTreeItem: {
        pageX: e.event.pageX + 10,
        pageY: pageY + 10,
        nodeData,
      },
    });
    this.onSelectNode({
      e,
      hideRightMenu: false,
      needExpand: false,
    });
    // this.props.updateFrameState({
    //   activeTreeNodeDetail: nodeData,
    // });
  };
  // 获取右键菜单
  getNodeTreeRightClickMenu = () => {
    const { rightClickNodeTreeItem } = this.state;
    const { pageX, pageY, nodeData } = rightClickNodeTreeItem;
    const tmpStyle = {
      left: `${pageX}px`,
      top: `${pageY}px`,
    };
    const menu = (
      <div style={tmpStyle} className={styles.rightMenu}>
        <Menu>
          {this.getOverlayMenu(nodeData)}
        </Menu>
      </div>
    );
    return this.state.showRightClickMenu ? menu : null;
  };
  // 关闭转移节点弹窗
  cancelMoveNodeModal = () => {
    this.setState({
      visibleMoveNode: false,

    });
  }
  // 遍历树节点
  loopNode = (data = [], treeType = 'normal') => {
    const { checkable, activeTreeNodeDetail, nodeConfig, treeStyle } = this.props;
    const realNodeConfig = { ...initProps, ...nodeConfig };
    const { hasRightIcon, rightIconToward, notGroupIcon, isMainTree } = realNodeConfig;
    // 右侧图标按钮样式
    const rightIconCls = classNames({
      'iconfont': true,
      [`icon-${rightIconToward}`]: true,
      [styles.rightIcon]: true,
    });
    return data.length && data.map(item => {
      const {
        isGroup,
        rootpath, // 显示层级结构 （// 第几层就是几个/ ）
        name,
        id,
        nodeKey,
        children = [],
        iconName = '',
      } = item;
      const level = rootpath && rootpath.match(/\//g).length || 1;
      const showCheckbox = treeType === 'normal' ? (checkable && !isGroup) : true;
      // 节点前缀图标样式
      const nodeIconCls = classNames({
        [styles.elementIcon]: !!!isGroup,
        'iconfont': true, // 全局图标库
        'icon-file': !!isGroup, // 组图标
        'icon-file-blue': !!isGroup && treeStyle === 'dark', // 在透明灰色浮层中的树上组图标
        'icon-line-tree': !!!isGroup && !!notGroupIcon, // 有自定义的非组图标
        [`icon-${iconName}`]: !!!isGroup && !!!notGroupIcon, // 需要从数据层获取的非组图标（元素图标）
      });
      // 节点样式
      const nodeCls = classNames({
        [styles.groupTit]: !!isGroup,
        [styles.eleTit]: !!!isGroup,
        [styles[`level-${level}`]]: true,
        [styles.line]: !!notGroupIcon,
        [styles.noIcon]: showCheckbox,
        'custom-tree-active': activeTreeNodeDetail.nodeKey === nodeKey,
        'custom-tree-active-main': isMainTree,
      });
      // 显示标题
      const nodeTitle = (
        <Fragment>
          <span>{name}</span>
          {hasRightIcon && <span className={rightIconCls}/>}
        </Fragment>
      );
      return (
        <TreeNode
          className={nodeCls}
          title={nodeTitle}
          key={nodeKey}
          icon={<span className={nodeIconCls}/>}
          nodeData={item}
          checkable={showCheckbox} // 设置需要选择框且不是组时可以选择
        >
          {children && this.loopNode(children)}
        </TreeNode>
      );
    });
  }

  render() {
    const { treeData, loading, needRightMenu, defaultExpandAll, nodeConfig, treeStyle, checkable } = this.props;
    const { showRightClickMenu, expandedKeys, checkedKeys, visibleMoveNode } = this.state;
    const treeWrapCls = classNames({
      [styles.treeWrap]: true,
      [styles[`style-${treeStyle}`]]: true,
    });
    return (
      <div className={styles.wrap}>
        <CSpin spinning={loading}>
          <Tree
            showIcon
            checkStrictly={false}
            checkable={checkable}
            expandedKeys={expandedKeys}
            checkedKeys={checkedKeys}
            defaultExpandAll={defaultExpandAll}
            className={treeWrapCls}
            blockNode={true}
            onSelect={(selectedKeys, e) => this.onSelectNode({ e })}
            onExpand={(expandedKeys, { expanded, node }) => this.handleExpand(node.props.nodeData)}
            onCheck={(checkedKeys, e) => this.onSelectNode({ e })}
            onRightClick={this.onRightClick}
          >
            {this.loopNode(treeData)}
          </Tree>
          {needRightMenu && showRightClickMenu && this.getNodeTreeRightClickMenu()}
        </CSpin>
        <CreateModal
          visible={visibleMoveNode}
          title={<FormattedMessage id="tree.more.moveNode" />}
          onCancel={this.cancelMoveNodeModal}
        >
          <Tree
            showIcon
            checkStrictly={false}
            checkable={true}
            expandedKeys={expandedKeys}
            checkedKeys={checkedKeys}
            defaultExpandAll={defaultExpandAll}
            className={treeWrapCls}
            blockNode={true}
            onSelect={(selectedKeys, e) => this.onSelectNode(e)}
            onExpand={(expandedKeys, { expanded, node }) => this.handleExpand(node.props.nodeData, 'moveNode')}
            // onCheck={(checkedKeys, e) => this.onSelectNode(e)}
          >
            {this.loopNode(treeData, 'moveNode')}
          </Tree>
        </CreateModal>
      </div>
    );
  }
}

export default CreateTree;
