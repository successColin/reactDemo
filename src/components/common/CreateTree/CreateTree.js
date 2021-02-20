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
  state = {
    //  activeTreeNodeKey: '', // 当前树节点id
    rightClickNodeTreeItem: {}, // 右键数据
    showRightClickMenu: false, // 是否显示右键菜单
    expandedKeys: [], // 展开的节点
    checkedKeys: [], // 通过复选框选中的节点
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
    if (dataType === 'role') {
      const { canadd, candelete } = functionData.attributes;
      if (isGroup && treeNode.id === 1) {
      } else if (isGroup && (treeNode.id === 3 || treeNode.id === 2)) {
        menuList = !!canadd ? [addGroup, addElement] : [];
      } else if (isGroup && treeNode.rootpath) {
        if (!!canadd && !!candelete) {
          menuList = [addGroup, delGroup, addElement];
        } else if (!!canadd && !candelete) {
          menuList = [addGroup, addElement];
        } else if (!canadd && !!candelete) {
          menuList = [delGroup];
        } else {
          menuList = [];
        }
      } else {
        menuList = !!candelete ? [delElement] : [];
      }
    } else if (dataType === 'global') {
      const { canadd, candelete } = functionData.attributes;
      if (id === 1 || id === 2 || groupId === 2 || id === 3 || groupId === 3) {
        menuList = [];
      } else if (id === 4) {
        menuList = canadd ? [addGroup, addElement] : [];
      } else {
        if (isGroup) { // 组
          if (candelete && canadd) {
            menuList = [addGroup, delGroup, addElement];
          } else if (candelete && !canadd) {
            menuList = [delGroup];
          } else if (!candelete && canadd) {
            menuList = [addGroup, addElement];
          } else {
            menuList = [];
          }
        } else { // 元素
          if (candelete) {
            menuList = [delElement];
          } else {
            menuList = [];
          }
        }
      }

    } else if (dataType === 'appLibrary') { // app档案只有分组
      if (functionData) {
        const { candelete, canadd } = functionData.attributes;
        if (candelete && canadd) {
          menuList = [addGroup, delGroup];
        } else if (candelete && !canadd) {
          menuList = [delGroup];
        } else if (!candelete && canadd) {
          menuList = [addGroup];
        } else {
          menuList = [];
        }
        if (isInitialData) {
          if (canadd) {
            menuList = [addGroup];
          } else {
            menuList = [];
          }
        }
      } else {
        menuList = [addGroup, delGroup];
        if (isInitialData) menuList = [addGroup];
      }
    } else if (dataType === 'fileGroup') { // 知识库
      if (functionData.attributes.candelete === 1) {
        menuList.push(delGroup);
      }
      if (functionData.attributes.canadd === 1) {
        menuList.push(addGroup);
      }
      // menuList = [addGroup, delGroup];
      if (isInitialData) {
        if (functionData.attributes.canadd === 1) {
          menuList = [addGroup];
        } else {
          menuList = [];
        }
      }
    } else if (dataType === 'org') { // 组织档案
      if (!functionData) {
        if (isGroup) {
          if (isInitialData) {
            menuList = [addGroup];
          } else {
            menuList = [addGroup, delGroup, addElement];
          }
        } else {
          menuList = [addElement, delElement];
        }
      } else {
        if (isGroup) {
          if (isInitialData && functionData.attributes.canadd) {
            menuList = [addGroup];
          } else if (functionData.attributes.canadd && functionData.attributes.candelete) {
            menuList = [addGroup, delGroup, addElement];
          } else if (!functionData.attributes.canadd && functionData.attributes.candelete) {
            menuList = [delGroup];
          } else if (functionData.attributes.canadd && !functionData.attributes.candelete) {
            menuList = [addGroup, addElement];
          }
        } else {
          if (functionData.attributes.canadd && functionData.attributes.candelete) {
            menuList = [addElement, delElement];
          } else if (!functionData.attributes.canadd && functionData.attributes.candelete) {
            menuList = [delElement];
          } else if (functionData.attributes.canadd && !functionData.attributes.candelete) {
            menuList = [addElement];
          }
        }
      }
    } else if (dataType === 'ErrorCode') { // 故障档案
      if (functionData) {
        const { canadd, canmodify, candelete } = functionData.attributes;
        if (isGroup) {
          if (canadd && candelete) {
            menuList = [addGroup, delGroup, addErrorCodeI];
          } else if (canadd && !candelete) {
            menuList = [addGroup, addErrorCodeI];
          } else if (!canadd && candelete) {
            menuList = [delGroup];
          } else if (!canadd && !candelete) {
            menuList = [];
          }
        } else {
          if (type === 'ERRORCODEI') {
            if (canadd && candelete) {
              menuList = [delElement, addErrorCodeII];
            } else if (!canadd && candelete) {
              menuList = [delElement];
            } else if (canadd && !candelete) {
              menuList = [addErrorCodeII];
            } else {
              menuList = [];
            }
          } else if (type === 'ERRORCODEII') {
            if (canadd && candelete) {
              menuList = [delElement, addErrorCodeIII];
            } else if (!canadd && candelete) {
              menuList = [delElement];
            } else if (canadd && !candelete) {
              menuList = [addErrorCodeIII];
            } else {
              menuList = [];
            }
          } else if (type === 'ERRORCODEIII') {
            if (candelete) {
              menuList = [delElement];
            } else {
              menuList = [];
            }
          }
        }
      } else {
        if (isGroup) {
          menuList = [addGroup, delGroup, addErrorCodeI];
        } else {
          if (type === 'ERRORCODEI') {
            menuList = [delElement, addErrorCodeII];
          } else if (type === 'ERRORCODEII') {
            menuList = [delElement, addErrorCodeIII];
          } else if (type === 'ERRORCODEIII') {
            menuList = [delElement];
          }
        }
      }
    } else if (dataType === 'frameConfig') { // 配置界面
      if (functionData) {
        const { canadd, canmodify, candelete } = functionData.attributes;
        if (!isGroup) {
          if (canmodify && candelete) {
            menuList = [copyUserDesignerMenu, resetDefault];
          } else if (canmodify && !candelete) {
            menuList = [copyUserDesignerMenu];
          } else if (!canmodify && candelete) {
            menuList = [resetDefault];
          } else {
            menuList = [];
          }
        } else {
          menuList = [];
        }
      } else {
        if (!isGroup) {
          menuList = [copyUserDesignerMenu, resetDefault];
        } else {
          menuList = [];
        }
      }
    } else if (dataType === 'languageGroup') {
      if (functionData) {
        const { canadd, canmodify, candelete } = functionData.attributes;
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
    } else {
      if (isInitialData) {
        if (dataType === 'userDesigner' && !isGroup) { // 用户设计组默认项不允许操作
          menuList = [];
        } else {
          if (!functionData) {
            menuList = [addGroup];
          } else {
            if (dataType === 'menu') {
              menuList = functionData.attributes.canadd ? [addElement] : [];
            } else {
              menuList = functionData.attributes.canadd ? [addGroup] : [];
            }
          }
        }
      } else {
        if (isGroup) { // 组
          menuList = [];
          if (!functionData) {
            menuList = [addGroup, addElement, delGroup];
          } else {
            if (functionData.attributes.canadd) {
              menuList = [addGroup, addElement];
            }
            if (functionData.attributes.candelete) {
              menuList.push(delGroup);
            }
          }

        } else { // 元素
          if (dataType === 'element' || dataType === 'menu') {
            if (!functionData) {
              menuList = [addElement, delElement];
            } else {
              if (functionData.attributes.candelete && functionData.attributes.canadd) {
                menuList = [addElement, delElement];
              } else if (functionData.attributes.candelete && !functionData.attributes.canadd) {
                menuList = [delElement];
              } else if (!functionData.attributes.candelete && functionData.attributes.canadd) {
                menuList = [addElement];
              }
            }
          } else {
            if (!functionData) {
              menuList = [delElement];
            } else {
              if (functionData.attributes.candelete) {
                menuList = [delElement];
              }
            }

          }
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
        if (dataType === 'fileGroup') {
          this.props.updateFrameState({
            activeTreeNodeDetail: treeNode,
            actionType: type,
            visible: true,
          });
        } else {
          this.props.updateFrameState({
            activeDetail: {},
            activeTreeNodeDetail: treeNode,
            actionType: type,
            visible: dataType !== 'languageGroup' && true,
          });
        }

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
      case 'addErrorCodeI': { // 关联故障现象
        this.props.updateFrameState({
          // activeDetail: {},
          activeTreeNodeDetail: treeNode,
          actionType: type,
          visibleErrorCodeI: true,
          relationTableName: 'ERRORCODEI',
        });
        this.props.form && this.props.form.resetFields();
      }
        ;
        break;
      case 'addErrorCodeII': { // 关联故障原因
        this.props.updateFrameState({
          // activeDetail: {},
          activeTreeNodeDetail: treeNode,
          actionType: type,
          visibleErrorCodeII: true,
          relationTableName: 'ERRORCODEII',
        });
        this.props.form && this.props.form.resetFields();
      }
        ;
        break;
      case 'addErrorCodeIII': { // 关联故障措施
        this.props.updateFrameState({
          // activeDetail: {},
          activeTreeNodeDetail: treeNode,
          actionType: type,
          visibleErrorCodeIII: true,
          relationTableName: 'ERRORCODEIII',
        });
        this.props.form && this.props.form.resetFields();
      }
        ;
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

    } else if (dataType === 'ErrorCode') {
      if (treeNode.isGroup) {
        params = {
          id: treeNode.id,
        };
      } else {
        params = {
          'mainTableId': parseInt(treeNode.groupNodeId.split('-')[0]),
          'mainTableName': treeNode.groupNodeId.split('-')[1],
          'relationTableId': treeNode.id,
          'relationTableName': treeNode.type,
          'errorcodeGroupId': treeNode.errorcodeGroupId,
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
      this.setState({ expandedKeys: [] });
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
    const { expandedKeys } = this.state;
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
    loadData && loadData(orgNode, true);
    // 设置树的当前节点
    this.setState({
      expandedKeys: newExpandKeys,
      //  activeTreeNodeDetail: node,
    });
  };
  // 点击获取树节点-编辑
  onSelectNode = (e, hideRightMenu = true, needExpand = true) => {
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
    if (dataType === 'fileGroup') {
      reqParams = getDetailParams(activeTreeNodeDetail) || { groupId: reqId };
    }
    if (dataType === 'languageGroup') {
      reqParams = reqParams.id;
    }
    if (getDetail) { // 点击节点走接口(不是树节点的接口，是获取该节点详情的接口)
      setGetDetailLoading(true);
      getDetail(reqParams).then((activeDetail = {}) => {
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
    const { needCheckRoot = false } = this.props;
    if (needCheckRoot && nodeData.rootpath === '/') {

    } else if (nodeData.isGroup) {
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
      case 'ErrorCode':
        return { // 故障档案
          getDetail: isGroup ? getErrorCodeGroupDetial : this.checkErrorCodeType(type),
          del: isGroup ? deleteErrorCodeGroup : deleteErrorCodeRelations,
        };
      case 'languageGroup':
        return {
          getDetail: isGroup ? getLangaugeGroupDetial : getLanguageTypeDetial,
          del: isGroup ? deleteLanguageGroup : doLanguageTypeDelete,
        };
      default:
        return {};
    }
  };
  checkErrorCodeType = (type) => {
    switch (type) {
      case 'ERRORCODEI':
        return getErrorCodeI;
      case 'ERRORCODEII':
        return getErrorCodeII;
      case 'ERRORCODEIII':
        return getErrorCodeIII;
      case 'ERRORCODEGROUP':
        return getErrorCodeGroupDetial;
      default:
        return getErrorCodeRelations;
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
  // 搜索结果所有节点打开 (在框架层调用)
  getSearchNodeKey = (treeData) => {
    const expandedKeys = [];
    const loopGetNodeKey = dataList => {
      dataList.forEach(item => {
        if (item.children && item.children.length) {
          expandedKeys.push(item.nodeKey);
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
    this.setState({ expandedKeys });
  };
  // 故障档案图标
  getErrorCodeIcon = (type) => {
    let typeText = '';
    switch (type) {
      case 'ERRORCODEI':
        typeText = '现';
        break;
      case 'ERRORCODEII':
        typeText = '因';
        break;
      case 'ERRORCODEIII':
        typeText = '措';
        break;
      default:
        break;
    }
    return typeText && <span className="errorCodeIcon">{typeText}</span>;
  };
  // 遍历树节点
  loopNode = (data = []) => {
    return data.length && data.map((item, index) => {
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
      const { nodeConfig = {}, treeStyle, checkable, activeTreeNodeDetail, loadData = false, needCheckRoot = false } = this.props;
      const realNodeConfig = { ...initProps.nodeConfig, ...nodeConfig };
      const { childShowIcon, hasRightIcon, rightIconToward, notGroupIcon, isMainTree, renderTitle } = realNodeConfig;
      const level = rootpath && rootpath.match(/\//g).length || 1;
      let showCheckbox = false;
      if (needCheckRoot && rootpath === '/') {
        showCheckbox = true;
      } else {
        showCheckbox = checkable && !isGroup;
      }
      // 节点前缀图标样式
      const nodeIconCls = classNames({
        [styles.elementIcon]: !!!isGroup,
        'iconfont': true, // 全局图标库
        'icon-file': needCheckRoot && rootpath === '/' ? false : !!isGroup, // 组图标
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
      // 故障档案树结构图标
      const errorCodeIcon = this.getErrorCodeIcon(type);
      // 显示标题
      const nodeTitle = (
        <Fragment>
          {errorCodeIcon}
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
    const { treeData, loading, needRightMenu, defaultExpandAll, treeStyle, checkable, className, loadData = false } = this.props;
    const { showRightClickMenu, expandedKeys, checkedKeys } = this.state;
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
