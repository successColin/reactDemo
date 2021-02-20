/*
 * @Author: Fus
 * @Date:   2019-06-18 18:49:17
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2020-02-24 13:57:55
 * @Desc: 通用 创建树组件
 */
import { Component, Fragment } from 'react';
import { Tree, Menu, Modal, message } from 'antd';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';
import { BaseContext } from '@/constants/global';
import { getDefaultConfirmProps } from '@/utils/common';
import { CSpin, CMessage } from '@/components/common/BasicWidgets';
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
import {
  getPriorityGroupDetial,
  getPriorityDetial,
  deletePriorityGroup,
  deletePriority,
} from '@/services/priorityManager';
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
import {
  getErrorCodeGroupDetial,
  getErrorCodeRelations,
  deleteErrorCodeGroup,
  deleteErrorCodeRelations,
  getErrorCodeIList,
  getErrorCodeI,
  getErrorCodeII,
  getErrorCodeIII,
} from '@/services/errorCode';
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
import {
  getLangaugeGroupDetial,
  deleteLanguageGroup,
  doLanguageTypeDelete,
  getLanguageTypeDetial,
  getLanguagePath,
} from '@/services/languageGroupType';
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
    type: 'addErrorCodeI',
    id: 'errorCodeI.relation',
  }, {
    type: 'addErrorCodeII',
    id: 'errorCodeII.relation',
  }, {
    type: 'addErrorCodeIII',
    id: 'errorCodeIII.relation',
  }, {
    type: 'copyUserDesignerMenu',
    id: 'global.copy',
  }, {
    type: 'resetDefault',
    id: 'tree.more.resetDefault',
  }, {
    type: 'moveTreeNode',
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
    childShowIcon: true, // 是否显示图标
    notGroupIcon: false, // 非组的节点前缀图标（false表示从数据层获取）
    isMainTree: false, // 是否是主树（用于样式区分，主树选中状态左侧有红色竖条，非主树选中无竖条）
    className: '',
    hasRightIcon: false, // 是否有右侧箭头图标
    rightIconToward: 'left', // 右侧箭头朝向
    renderTitle: null, // 渲染节点名称
  },
};

class CreateTree extends Component {
  static contextType = BaseContext;
  static defaultProps = initProps;
  // static getDerivedStateFromProps(props, state) {

  // }
  constructor(props) {
    super();
    this.state = {
      //  activeTreeNodeKey: '', // 当前树节点id
      rightClickNodeTreeItem: {}, // 右键数据
      showRightClickMenu: false, // 是否显示右键菜单
      expandedKeys: [], // 展开的节点
      checkedKeys: [], // 通过复选框选中的节点
      loadingGetDetail: false, // 加载节点详情接口状态
    };
  }

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
    const { isGroup = false, initialData, rootpath, id, groupId, type } = treeNode;
    const menuConfig = {};
    overlayConfigs.forEach(item => menuConfig[item.type] = (
      <MenuItem onClick={() => this.onClickMore(item.type, treeNode)} key={`rightMenu-${item.type}`}>
        {<span className={rightItemName}><FormattedMessage id={item.id}/></span>}
      </MenuItem>
    ));
    const isInitialData = !!(+initialData);
    const {
      addGroup, delGroup, addElement, delElement, addErrorCodeI, addErrorCodeII, addErrorCodeIII, copyUserDesignerMenu, resetDefault, moveTreeNode,
    } = menuConfig;

    const { dataType, functionData } = this.props;
    let menuList = [];
    // 初始数据不允许删除修改
    if (dataType === 'languageGroup') {
      if (functionData) {
        const { canmodify, canadd, candelete } = functionData.attributes;
        if (isGroup && isInitialData) {
          if (canadd) {
            menuList = [addGroup];
          } else {
            menuList = [];
          }
        } else if (isGroup) {
          if (canadd && canmodify && candelete) {
            menuList = [addGroup, addElement, delGroup, moveTreeNode];
          } else if (canadd && canmodify && !candelete) {
            menuList = [addGroup, addElement, moveTreeNode];
          } else if (canadd && !canmodify && !candelete) {
            menuList = [addGroup, addElement];
          } else if (!canadd && !canmodify && !candelete) {
            menuList = [];
          } else if (canadd && !canmodify && candelete) {
            menuList = [addGroup, addElement, delGroup];
          } else if (!canadd && canmodify && candelete) {
            menuList = [delGroup, moveTreeNode];
          } else if (!canadd && !canmodify && candelete) {
            menuList = [delGroup];
          } else if (!canadd && canmodify && !candelete) {
            menuList = [moveTreeNode];
          }
        } else {
          if (candelete && canmodify) {
            menuList = [delElement, moveTreeNode];
          } else if (candelete && !canmodify) {
            menuList = [delElement];
          } else if (!candelete && canmodify) {
            menuList = [moveTreeNode];
          } else {
            menuList = [];
          }
        }
      } else {
        if (isGroup && isInitialData) {
          menuList = [addGroup];
        } else if (isGroup) {
          menuList = [addGroup, addElement, delGroup, moveTreeNode];
        } else {
          menuList = [delElement, moveTreeNode];
        }
      }
    }
    return menuList;
  };
  // 点击树上的【更多】操作
  onClickMore = (type, treeNode) => {
    this.setState({ showRightClickMenu: false });
    // editType = 'add';
    switch (type) {
      case 'addGroup': { // 新增组
        const { dataType } = this.props;
        this.props.updateFrameState({
          activeDetail: {},
          activeTreeNodeDetail: treeNode,
          actionType: type,
          visible: dataType !== 'languageGroup' && true,
        });
        this.props.form && this.props.form.resetFields();
      }
        break;
      case 'delGroup': { // 删除组
        if (this.validHasChild(treeNode)) {
          this.showConfirmDel(treeNode);
        }
      }
        break;
      case 'delElement': { // 删除元素
        this.showConfirmDel(treeNode);
      }
        break;
      case 'addElement': { // 新增子级
        this.props.updateFrameState({
          activeDetail: {},
          activeTreeNodeDetail: treeNode,
          actionType: type,
        });
        this.props.form && this.props.form.resetFields();
      }
        break;
      case 'copyUserDesignerMenu': {
        this.props.handleCopyMenu();
      }
        ;
        break;
      case 'resetDefault': {
        this.props.handleResetDefault();
      }
        ;
        break;
      case 'moveTreeNode': {
        this.props.updateFrameState({
          activeTreeNodeDetail: treeNode,
          actionType: type,
          visible: true,
        });
      }
        break;
      default:
        break;
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

    } else if (dataType === 'ErrorCode') {
      if (treeNode.isGroup) {
        params = {
          id: treeNode.id,
        };
      } else {
        params = {
          'mainTableId': parseInt(treeNode.pid.split('-')[0]),
          'mainTableName': treeNode.pid.split('-')[1],
          'relationTableId': treeNode.id,
          'relationTableName': treeNode.type,
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
  handleExpand = (node, orgNode) => {
    const { expandedKeys } = this.props;
    const { loadData = false } = this.props;
    // 点击即打开、关闭节点
    const activeExpandKeyId = node.nodeKey;
    const activeExpandKeyIndex = expandedKeys.indexOf(activeExpandKeyId);
    let newExpandKeys = [...expandedKeys];
    if (activeExpandKeyIndex === -1) {
      newExpandKeys.push(activeExpandKeyId);
    } else {
      newExpandKeys.splice(activeExpandKeyIndex, 1);
    }
    loadData && loadData(orgNode);
    // 设置树的当前节点
    // this.setState({
    //   expandedKeys: newExpandKeys,
    //   //  activeTreeNodeDetail: node,
    // });
    this.props.updateFrameState({
      expandedKeys: newExpandKeys,
    });
  };
  // 点击获取树节点-编辑
  onSelectNode = (e, hideRightMenu = true, needExpand = true) => {
    // 取消右键菜单显示
    hideRightMenu && this.setState({ showRightClickMenu: false });
    // 展开节点
    const { setLoadingStatus, resetDetailForm, updateFrameState, treeMap, setGetDetailLoading, getDetailParams, needGetDetail, validBeforeGetDetail, checkable, handleAfterGetDetail, dataType } = this.props;
    const { expandedKeys } = this.props;
    resetDetailForm && resetDetailForm();
    let reqId = '';
    let activeTreeNodeDetail = {};
    let isGroup = false;
    const { nodeData = {}, eventKey = '' } = e.node.props;
    isGroup = nodeData.isGroup;
    // 不用selectedKeys是为了避免重复点击取消选中
    reqId = eventKey.split('-')[0];
    activeTreeNodeDetail = nodeData;
    needExpand && this.handleExpand(activeTreeNodeDetail, e.node);
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

    let reqParams = getDetailParams(activeTreeNodeDetail) || { id: reqId };
    if (dataType === 'languageGroup') {
      reqParams = reqParams.id;
    }
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
    const { isGroup, type } = treeNode;
    switch (dataType) {
      case 'languageGroup':
        return {
          getDetail: isGroup ? getLangaugeGroupDetial : getLanguageTypeDetial,
          del: isGroup ? deleteLanguageGroup : doLanguageTypeDelete,
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
    this.onSelectNode(e, false, false);
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
  // 搜索结果所有节点打开 (在框架层调用)
  getSearchNodeKey = (treeData) => {
    const expandedKeys = [];
    const loopGetNodeKey = dataList => {
      dataList.forEach(item => {
        expandedKeys.push(item.nodeKey);
        if (item.children) {
          loopGetNodeKey(item.children);
        }
      });
    };
    loopGetNodeKey(treeData);
    return expandedKeys;
  };
  // 设置搜索后展开的节点
  setSearchExpandKeys = (treeData) => {
    const expandedKeys = this.getSearchNodeKey(treeData);
    // this.setState({ expandedKeys });
    this.props.updateFrameState({ expandedKeys });
  };

  // 遍历树节点
  loopNode = (data = []) => {
    return data.length && data.map(item => {
      const {
        isGroup,
        rootpath, // 显示层级结构 （// 第几层就是几个/ ）
        name,
        id,
        nodeKey,
        children = [],
        iconName = '',
        type,
      } = item;
      const { nodeConfig = {}, treeStyle, checkable, activeTreeNodeDetail, loadData = false } = this.props;
      const realNodeConfig = { ...initProps.nodeConfig, ...nodeConfig };
      const { childShowIcon, hasRightIcon, rightIconToward, notGroupIcon, isMainTree, renderTitle } = realNodeConfig;
      const level = rootpath && rootpath.match(/\//g).length || 1;
      const showCheckbox = checkable && !isGroup;
      // 节点前缀图标样式
      const nodeIconCls = classNames({
        [styles.elementIcon]: !!!isGroup,
        'iconfont': true, // 全局图标库
        'icon-file': !!isGroup, // 组图标
        'icon-file-blue': !!isGroup && treeStyle === 'dark', // 在透明灰色浮层中的树上组图标
        'icon-line-tree': !!!isGroup && !!notGroupIcon && childShowIcon, // 有自定义的非组图标
        [`icon-${iconName}`]: !!!isGroup && !!!notGroupIcon && childShowIcon, // 需要从数据层获取的非组图标（元素图标）
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
      // 右侧图标按钮样式
      const rightIconCls = classNames({
        'iconfont': true,
        [`icon-${rightIconToward}`]: true,
        [styles.rightIcon]: true,
      });
      // 显示标题
      const nodeTitle = (
        <Fragment>
          {renderTitle ? renderTitle(item) : <span>{name}</span>}
          {hasRightIcon && <span className={rightIconCls}/>}
        </Fragment>
      );
      const TreeNodeProps = loadData ? {
        isLeaf: loadData && item.childCount ? false : true,
      } : {};
      return (
        <TreeNode
          {...TreeNodeProps}
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
  };

  render() {
    const { expandedKeys, treeData, loading, needRightMenu, defaultExpandAll, treeStyle, checkable, className, loadData = false } = this.props;
    const { showRightClickMenu, checkedKeys } = this.state;
    const treeWrapCls = classNames({
      [styles.treeWrap]: true,
      [styles[`style-${treeStyle}`]]: true,
      [className]: className,
    });
    return (
      <div className={styles.wrap}>
        <CSpin spinning={loading}>
          <Tree
            loadData={loadData}
            showIcon
            checkStrictly={true}
            checkable={checkable}
            expandedKeys={expandedKeys}
            checkedKeys={checkedKeys}
            defaultExpandAll={defaultExpandAll}
            className={treeWrapCls}
            blockNode={true}
            onSelect={(selectedKeys, e) => this.onSelectNode(e)}
            onExpand={(expandedKeys, { expanded, node }) => this.handleExpand(node.props.nodeData, node)}
            onCheck={(checkedKeys, e) => this.onSelectNode(e)}
            onRightClick={this.onRightClick}
          >
            {this.loopNode(treeData)}
          </Tree>
          {needRightMenu && showRightClickMenu && this.getNodeTreeRightClickMenu()}
        </CSpin>
      </div>
    );
  }
}

export default CreateTree;
