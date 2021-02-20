/*
 * @Author: Fus
 * @Date:   2019-08-27 11:31:45
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2020-04-07 19:56:43
 * @Desc: 框架的左侧树
 */
import { Component } from 'react';
import { Tree, Menu, Modal, TreeSelect } from 'antd';
import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';
import { BaseContext, TREE_RIGHT_MENU } from '@/constants/global';
import { CSearch, CSpin, CMessage } from '@/components/common/BasicWidgets';
import TreeFooter from '@/components/common/TreeFooter/TreeFooter';
import { deletePageTreeNode, getPageFullTree, switchNode, getChildTreeData } from '@/services/frame';
import { getDefaultConfirmProps } from '@/utils/common';
import MoveTreeNode from './MoveTreeNode/MoveTreeNode';
import CreateModal from '@/components/common/CreateModal/CreateModal';
import styles from './LeftTree.less';
import ModalBox from '@/components/common/ReminderBox/ReminderBox';

const { TreeNode } = Tree;
const MenuItem = Menu.Item;
// 右键选项标识符
const rightItemName = 'rightItem';

class LeftTree extends Component {
  static contextType = BaseContext;
  // static getDerivedStateFromProps(props, state) {
  //   // 默认展开第一个节点
  //   if (props.treeData.length && state.expandedKeys.length === 0 && state.firstLoad) {
  //     return {
  //       expandedKeys: [props.treeData[0].nodeKey],
  //       firstLoad: false,
  //     };
  //   }
  //   return null;
  // }
  state = {
    expandedKeys: [], // 已展开的节点
    firstLoad: true, // 是否为第一次加载且默认展开第一个节点
    showRightClickMenu: false, // 是否显示右键菜单
    rightClickNodeTreeItem: {}, // 右键数据
    rightMenuList: null, // 右键菜单入口
    originNode: {}, // 树节点（antd TreeNode对象）
    visibleMoveNode: false, // 转移节点弹出框显示状态
    moveNodeLoading: false, // 转移中
    nodeMap: {}, // 所有点击树节点的节点信息
    loadedKeys: [], // 已经异步加载过的节点
    isSearchTree: false, // 是否处于搜索状态
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
  // 单个树节点获取数据
  onLoadData = originNode => {
    return new Promise(resolve => {
      const { loadedKeys } = this.state;
      const { treeKeyWords } = this.props;
      const { dataResponseType } = this.props.frameData;
      // 没有查看权限或已经获取过子级或搜索时 不再发异步请求
      if (!this.validViewPermission() || dataResponseType !== 3) {
        resolve();
        return;
      }
      // 树单节点返回时才异步调取
      if (dataResponseType === 3) {
        const { nodeKey } = originNode.props.nodeData;
        this.props.setFrameState({
          treeNodeData: originNode.props.nodeData,
          originNode: originNode,
        }, () => {
          this.props.fetchSingleTreeNode({ isRoot: false, callback: resolve });
          this.setState({
            loadedKeys: [...loadedKeys, nodeKey],
          });
        });
      }
    });
  };
  // 校验是否有查看权限
  validViewPermission = () => {
    const { langLib } = this.context;
    const { canview } = this.props.functionData.attributes;
    // 没有查看权限无法点开
    if (!canview) {
      CMessage(langLib['global.noViewPermission'], 'error');
      return false;
    }
    return true;
  };
  // 展开、折叠节点
  handleExpand = (e) => {
    const { nodeData } = e.props;
    const { setTreeNodeData, frameData, treeKeyWords } = this.props;
    const { expandedKeys, nodeMap } = this.state;
    const { isGroup, nodeKey } = nodeData;
    this.setState({
      nodeMap: {
        ...nodeMap,
        [nodeKey]: e,
      },
    });
    if (!this.validViewPermission()) return;
    // 点击即打开、关闭节点
    const activeExpandKeyId = nodeData.nodeKey;
    const activeExpandKeyIndex = expandedKeys.indexOf(activeExpandKeyId);
    let newExpandKeys = [...expandedKeys];
    if (activeExpandKeyIndex === -1) {
      newExpandKeys.push(activeExpandKeyId);
    } else {
      newExpandKeys.splice(activeExpandKeyIndex, 1);
    }
    this.setState({ expandedKeys: newExpandKeys });
    const actionType = isGroup ? 'editGroup' : 'editChild';
    const { dataResponseType } = frameData;
    // if ((!nodeData.children || !nodeData.children.length) && dataResponseType === 3 && !treeKeyWords) {
    //   this.props.setFrameState({
    //     treeNodeData: nodeData,
    //     originNode: expandedKeys,
    //     actionType,
    //   }, () => {
    //     this.props.fetchSingleTreeNode({ isRoot: false });
    //   });
    // }
    setTreeNodeData({
      originNode: e,
      treeNodeData: nodeData,
      actionType,
    });
  };
  // 点击获取树节点-编辑
  onSelectNode = (e) => {
    this.handleExpand(e.node);
    // 取消右键菜单显示
    this.setState({ showRightClickMenu: false });
  };
  // tree上右键事件
  onRightClick = e => {
    this.addBodyClickListen();
    const { nodeData } = e.node.props;
    const fullHeight = document.body.clientHeight;
    const rightMenuHeight = 160;
    const pageY = rightMenuHeight + e.event.pageY + 42 > fullHeight ? fullHeight - rightMenuHeight : e.event.pageY;
    this.setState({
      // originNode: e.node,
      showRightClickMenu: true,
      rightClickNodeTreeItem: {
        pageX: e.event.pageX + 10,
        pageY,
      },
    });
    const { isGroup } = nodeData;
    this.props.setTreeNodeData({
      treeNodeData: nodeData,
      originNode: e.node,
      actionType: isGroup ? 'editGroup' : 'editChild',
    });
  };
  // 获取右键菜单
  getNodeTreeRightClickMenu = () => {
    const { rightClickNodeTreeItem, rightMenuList, isSearchTree } = this.state;
    // const { activeTreeNode } = this.props;
    const { pageX, pageY } = rightClickNodeTreeItem;
    const tmpStyle = {
      left: `${pageX}px`,
      top: `${pageY}px`,
    };
    // const { isGroup } = activeTreeNode.props.nodeData;
    // console.log(activeTreeNode.props.nodeData, 'aaa rightMenuList');
    // const menuList = rightMenuList && (isGroup ? rightMenuList.groupMenuList : rightMenuList.dataMenuList) || null;
    const menu = (
      <div style={tmpStyle} className={styles.rightMenu}>
        <Menu>
          {/* {rightMenuList ? menuList : this.getOverlayMenu()} */}
          {this.getOverlayMenu()}
        </Menu>
      </div>
    );
    return this.state.showRightClickMenu && menu;
  };
  // 获取树的右键操作入口列表
  getOverlayMenu = () => {
    const { treeNodeData, treeKeyWords, frameData } = this.props;
    const { dataResponseType } = frameData;
    const { isSearchTree } = this.state;
    if (!treeNodeData) return null;
    const { functionData = {} } = this.props;
    const { canadd, canmodify, candelete } = functionData.attributes;
    const menuConfig = {};
    TREE_RIGHT_MENU.forEach(item => menuConfig[item.type] = (
      <MenuItem onClick={() => this.onClickMore(item.type)} key={`rightMenu-${item.type}`}>
        {<span className={rightItemName}><FormattedMessage id={item.id}/></span>}
      </MenuItem>
    ));
    const { isGroup, initialData } = treeNodeData;
    const { addGroup, delGroup, addChild, delChild, moveNode, loadChildren } = menuConfig;
    let groupMenuList = []; // 组节点右键
    let dataMenuList = []; // 非组节点右键
    if (canadd) { // 新增权限
      groupMenuList.push(addGroup, addChild);
      dataMenuList.push(addChild);
    }
    if (candelete && !+initialData) { // 删除权限
      groupMenuList.push(delGroup);
      dataMenuList.push(delChild);
    }
    if (canmodify) { // 修改权限
      groupMenuList.push(moveNode);
      dataMenuList.push(moveNode);
    }
    if (isSearchTree) {
      groupMenuList.push(loadChildren);
      dataMenuList.push(loadChildren);
      // 返回全树节点或搜索时
      // if (dataResponseType === 1 || treeKeyWords) {
      //   groupMenuList.push(loadChildren);
      // } else if (dataResponseType === 3 || !treeKeyWords) {
      //   dataMenuList.push(loadChildren);
      // }
    }
    // this.setState({
    //   rightMenuList: {
    //     groupMenuList,
    //     dataMenuList,
    //   },
    // });
    return isGroup ? groupMenuList : dataMenuList;
  };
  // 点击树的右键菜单操作
  onClickMore = (type) => {
    const { treeNodeData } = this.props;
    this.setState({ showRightClickMenu: false });
    // const { originNode } = this.state;
    const { setFrameState, setTreeNodeData } = this.props;
    switch (type) {
      case 'addGroup': { // 新增组
        setTreeNodeData({
          actionType: type,
          needFetchPageData: true,
        });
      }
        ;
        break;
      case 'delGroup': { // 删除组
        if (this.validHasChild()) {
          this.showConfirmDel();
        }
      }
        ;
        break;
      case 'delChild': { // 删除子级
        if (this.validHasChild()) {
          this.showConfirmDel();
        }
      }
        ;
        break;
      case 'addChild': { // 新增子级
        setTreeNodeData({
          actionType: type,
          needFetchPageData: true,
        });
      }
        ;
        break;
      case 'moveNode': { // 转移节点
        // this.handleMoveNode();
        this.setState({
          visibleMoveNode: true,
        });
      }
        ;
        break;
      case 'loadChildren': { // 加载子节点
        this.getChildTreeData(type);
        // this.setState({
        //   visibleMoveNode: true,
        // });
      }
        ;
        break;
      default:
        return;
    }
  };
  // 删除二次提醒
  showConfirmDel = () => {
    const { treeNodeData } = this.props;
    const { name } = treeNodeData;
    const { langLib } = this.context;
    const that = this;
    let { close } = ModalBox.confirm({
      ...getDefaultConfirmProps(langLib),
      title: langLib['confirm.del'](name),
      content: '',
      onOk() {
        that.onDelTreeNode();
        closeModal();
      },
      onCancel: () => closeModal(),
    });
    const closeModal = () => {
      close();
    };
    // Modal.confirm({
    //   className: 'customConfirmColor',
    //   ...getDefaultConfirmProps(langLib),
    //   title: langLib['confirm.del'](name),
    //   content: '',
    //   onOk() {
    //     return that.onDelTreeNode();
    //   },
    //   onCancel() {
    //   },
    // });
  };
  // 删除树节点
  onDelTreeNode = () => {
    const { langLib } = this.context;
    const { nodeMap, loadedKeys, expandedKeys } = this.state;
    const { doFetchTree, frameData, treeNodeData, setFrameState } = this.props;
    const { id, isGroup, pid } = treeNodeData;
    const { datasource1, datasource2 } = frameData;
    const tableName = isGroup ? frameData.datasource1 : frameData.datasource2;
    const params = {
      id,
      tableName,
      dataSource1: datasource1,
      dataSource2: datasource2,
    };
    deletePageTreeNode(params).then(res => {
      CMessage(langLib['message.del.success'], 'success');
      // 删除节点后默认请求父节点
      const newOriginNode = nodeMap[pid];
      if (!newOriginNode) {
        // 容错逻辑，若找不到父节点，默认获取根节点，且清空已加载的key
        doFetchTree(true);
        this.setState({ loadedKeys: [] });
        return;
      }
      const activeIndex = expandedKeys.indexOf(newOriginNode.props.nodeData.nodeKey);
      const newExpandedKeys = loadedKeys.splice(0, activeIndex + 1);
      this.setState({ loadedKeys: newExpandedKeys, expandedKeys: newExpandedKeys });
      setFrameState({
        originNode: newOriginNode,
        treeNodeData: newOriginNode.props.nodeData,
      }, () => {
        doFetchTree(!newOriginNode);
      });
    });
  };
  // 校验是否有子级，有则无法删除
  validHasChild = () => {
    const { treeNodeData } = this.props;
    const { children } = treeNodeData;
    const { langLib } = this.context;
    if (children && children.length) {
      CMessage(langLib['message.error.hasChild'], 'error');
      return false;
    }
    return true;
  };
  // 搜索结果所有节点打开
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
  // 设置树展开
  setNodeKey = (treeData) => {
    const expandedKeys = this.getSearchNodeKey(treeData);
    this.setState({
      expandedKeys,
      isSearchTree: treeData.length > 0 ? true : false,
    }, () => console.log(this.state.isSearchTree));
  };
  // 搜索
  handleSearch = (treeKeyWords) => {
    this.props.setFrameState({ treeKeyWords }, () => {
      if (treeKeyWords) {
        this.props.fetchFulTree((treeData) => {
          const expandedKeys = this.getSearchNodeKey(treeData);
          this.setState({
            expandedKeys,
            isSearchTree: treeData.length > 0 ? true : false,
          }, () => console.log(this.state.isSearchTree));
        });
      }
    });
  };

  // 修改搜索状态
  updateSearchStatus = () => {
    this.setState({ isSearchTree: false });
  };
  // 获取节点的子孙节点
  getChildTreeData = (type) => {
    const { langLib } = this.context;
    const { nodeMap, loadedKeys, expandedKeys } = this.state;
    const { doFetchTree, frameData, treeNodeData, setFrameState } = this.props;
    const { datasource1, datasource2, groupColumn, frameId } = frameData;
    const params = {
      groupDataSource: datasource1,
      dataSource: datasource2,
      mainColumn: groupColumn,
      frameId,
      nodeKey: treeNodeData.nodeKey,
      rootPath: treeNodeData.rootpath,
    };
    getChildTreeData(params).then(res => {
      let childData = treeNodeData;
      childData.children = res[0].children;
      this.props.setTreeNodeData({
        treeNodeData: childData,
        needFetchPageData: true,
        actionType: type,
      });
    });
  };
  // 清空
  handleChangeSearch = (e) => {
    const { value } = e.target;
    if (value) {
      // this.handleSearch(value);
    } else {
      this.props.setFrameState({ treeKeyWords: '' }, () => {
        this.props.doFetchTree(true, (treeData) => {
          const { dataResponseType } = this.props.frameData;
          // let expandedKeys = [];
          // if (dataResponseType === 1) {
          //   expandedKeys = [treeData[0].nodeKey];
          // } else if (dataResponseType === 3) {
          //   const { childList = [], groupList = [] } = treeData;
          //   let openNodeKey = {};
          //   if (groupList.length) {
          //     openNodeKey = groupList[0].nodeKey;
          //   } else if (childList.length) {
          //     openNodeKey = childList[0].nodeKey;
          //   }
          //   expandedKeys = [openNodeKey];
          // }
          this.setState({ expandedKeys: [], loadedKeys: [] });
        });
      });
    }
  };
  // 保存转移节点
  handleSaveModeNode = () => {
    const { langLib } = this.context;
    const { treeNodeData = {}, frameData = {} } = this.props;
    const { groupColumn } = frameData;
    const { groupId: oldGroupId, id, isGroup: oldIsGroup, type: oldType } = treeNodeData;
    const { selectedNodeData } = this.moveTreeNodeRef.state;
    const { groupId: newGroupId, id: newId, isGroup: newIsGroup, type: newType } = selectedNodeData;
    const isSameTableName = oldType === newType;
    let params = {
      groupColumn,
      oldGroupId,
      id,
      groupId: newIsGroup ? newId : newGroupId,
      rootId: newId,
      tableName: oldType,
    };
    if (isSameTableName) {
      if (oldIsGroup) {
        params = {
          ...params,
          groupColumn: '',
          groupId: '',
        };
      }
    } else {
      params = {
        ...params,
        rootId: 0,
      };
    }
    this.setState({ moveNodeLoading: true });
    switchNode(params).then(res => {
      CMessage(langLib['message.move.success']);
      this.setState({
        visibleMoveNode: false,
        moveNodeLoading: false,
        expandedKeys: [],
        loadedKeys: [],
      });
      this.props.doFetchTree(true);
    }, err => this.setState({ moveNodeLoading: false }));
  };
  // 遍历树
  loopNode = (data = []) => {
    const { treeNodeData = {}, frameData = {}, treeKeyWords } = this.props;
    const { dataResponseType, exint1 = 1 } = frameData;
    return data.map(item => {
      const { isGroup, rootpath, nodeKey, name, children, childCount, keyCode, iconName } = item;
      const level = rootpath && rootpath.match(/\//g).length || 1;
      // 节点样式
      const nodeCls = classNames({
        [styles.groupTit]: !!isGroup,
        [styles.eleTit]: !!!isGroup,
        [styles[`level-${level}`]]: true,
        'custom-tree-active-main': true,
        'custom-tree-active': treeNodeData.nodeKey === nodeKey || false,
      });
      const initIconName = isGroup ? 'file' : 'line-tree';
      // 节点前缀图标样式
      const nodeIconCls = classNames({
        [styles.elementIcon]: !!!isGroup,
        'iconfont': true,
        [`icon-${iconName || initIconName}`]: true,
        // 'icon-file': !!isGroup, // 组图标
        // 'icon-line-tree': !!!isGroup, // 非组图标
      });
      let isLeaf = false;
      // 返回全树节点或搜索时
      if (dataResponseType === 1 || treeKeyWords) {
        isLeaf = !(children ? children.length : false);
      } else if (dataResponseType === 3 || !treeKeyWords) {
        if (childCount) {
          isLeaf = !childCount;
        } else if (!childCount && children && children.length) {
          isLeaf = false;
        } else {
          isLeaf = true;
        }
      }
      // 节点名称格式
      const nodeName = (function() {
        switch (exint1) {
          case 1:
            return name;
          case 2:
            return `${keyCode}_${name}`;
          case 3:
            return `${name}_${keyCode}`;
          default:
            return name;
        }
      }());
      const nodeProps = {
        className: nodeCls,
        title: <span title={nodeName}>{nodeName}</span>,
        icon: <span className={nodeIconCls}/>,
        nodeData: item,
        checkable: !isGroup, // 只有非组时可以选择
        isLeaf,
      };
      if (children) {
        return (
          <TreeNode key={nodeKey} {...nodeProps}>
            {children && this.loopNode(children)}
          </TreeNode>
        );
      }
      return <TreeNode key={nodeKey} {...nodeProps} />;
      // return (
      //   <TreeNode
      //     className={nodeCls}
      //     title={name}
      //     key={nodeKey}
      //     icon={<span className={nodeIconCls}/>}
      //     nodeData={item}
      //   >
      //     {children && this.loopNode(children)}
      //   </TreeNode>
      // );
    });
  };
  setTreeState = (itemObj) => {
    this.setState(itemObj);
  };

  render() {
    const { langLib } = this.context;
    const { loading, treeData, treeNodeData = {}, treeKeyWords, frameData } = this.props;
    const { showRightClickMenu, expandedKeys, visibleMoveNode, moveTreeData, moveNodeLoading, loadedKeys } = this.state;
    return (
      <div className={styles.wrap}>
        <div className={styles.searchWrap}>
          <CSearch
            className={styles.search}
            placeholder={langLib['form.placeholder.keywords']}
            onSearch={this.handleSearch}
            onChange={e => this.handleChangeSearch(e)}
          />
        </div>
        <div className={styles.treeWrap}>
          {/* <CSpin spinning={loading}> */}
          <Tree
            showIcon
            checkStrictly={false}
            blockNode={true}
            expandedKeys={expandedKeys}
            onSelect={(selectedKeys, e) => this.onSelectNode(e)}
            onExpand={(expandedKeys, { expanded, node }) => this.handleExpand(node)}
            onRightClick={this.onRightClick}
            loadData={this.onLoadData}
            loadedKeys={loadedKeys}
          >
            {this.loopNode(treeData)}
          </Tree>
          {showRightClickMenu && this.getNodeTreeRightClickMenu()}
          {/* </CSpin> */}
        </div>
        <TreeFooter/>
        <CreateModal
          visible={visibleMoveNode}
          title={<FormattedMessage id="tree.more.moveTo" values={{ preNode: treeNodeData.name || '' }}/>}
          onOk={this.handleSaveModeNode}
          onCancel={() => this.setState({ visibleMoveNode: false })}
          confirmLoading={moveNodeLoading}
        >
          <MoveTreeNode
            visible={visibleMoveNode}
            frameData={frameData}
            leftTreeNodeData={treeNodeData}
            ref={ref => this.moveTreeNodeRef = ref}
          />
        </CreateModal>
      </div>
    );
  }
}

export default LeftTree;
