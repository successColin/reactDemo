/*
 * @Author: Fus
 * @Date:   2019-08-27 11:31:45
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2020-04-09 11:20:19
 * @Desc: 框架的左侧树
 */
import { Component } from 'react';
import { Tree, Menu, Modal, TreeSelect } from 'antd';
import { connect } from 'dva';
import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';
import { BaseContext, TREE_RIGHT_MENU } from '@/constants/global';
import { CSearch, CSpin, CMessage } from '@/components/common/BasicWidgets';
import TreeFooter from '@/components/common/TreeFooter/TreeFooter';
import { deletePageTreeNode, getPageFullTree, switchNode } from '@/services/frame';
import { getDefaultConfirmProps } from '@/utils/common';
import styles from './LeftTree.less';

const { TreeNode } = Tree;


class LeftTree extends Component {
  static contextType = BaseContext
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
    originNode: {}, // 树节点（antd TreeNode对象）
    loadedKeys: [], // 已经异步加载过的节点
  }
  // 单个树节点获取数据
  onLoadData = originNode => {
    return new Promise(resolve => {
      const { loadedKeys } = this.state;
      const { treeKeyWords } = this.props;
      const { dataResponseType } = this.props.frameData;
      // 没有查看权限或已经获取过子级或搜索时 不再发异步请求
      if (!this.validViewPermission() || dataResponseType !== 3 || treeKeyWords) {
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
  }
  // 校验是否有查看权限
  validViewPermission = () => {
    const { langLib } = this.context;
    const { canview } = this.props.activeTabData.functionData.attributes;
    // 没有查看权限无法点开
    if (!canview) {
      CMessage(langLib['global.noViewPermission'], 'error');
      return false;
    }
    return true;
  }
  // 展开、折叠节点
  handleExpand = (e) => {
    const { nodeData } = e.props;
    const { setTreeNodeData, frameData, treeKeyWords } = this.props;
    const { expandedKeys } = this.state;
    const { isGroup, nodeKey } = nodeData;
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
    setTreeNodeData({
      originNode: e,
      treeNodeData: nodeData,
      actionType,
    });
  };
  // 点击获取树节点-编辑
  onSelectNode = (e) => {
    this.handleExpand(e.node);
  }
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
  }
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
          this.setState({ expandedKeys });
        });
      }
    });
  }
  // 清空
  handleChangeSearch = (e) => {
    const { value } = e.target;
    if (value) {
      // this.handleSearch(value);
    } else {
      this.props.setFrameState({ treeKeyWords: '' }, () => {
        this.props.doFetchTree(true, null, (treeData) => {
          // const { dataResponseType } = this.props.frameData;
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
  }
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
      if (dataResponseType === 1 || !dataResponseType || treeKeyWords) {
        isLeaf = !(children ? children.length : false);
      } else if (dataResponseType === 3 || !treeKeyWords) {
        isLeaf = !childCount;
      }
      // 节点名称格式
      const nodeName = (function () {
        switch (exint1) {
          case 1: return name;
          case 2: return `${keyCode}_${name}`;
          case 3: return `${name}_${keyCode}`;
          default: return name;
        }
      }());
      const nodeProps = {
        className: nodeCls,
        title: <span title={nodeName}>{nodeName}</span>,
        icon: <span className={nodeIconCls} />,
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
    });
  }
  setTreeState = (itemObj) => {
    this.setState(itemObj);
  }
  render() {
    const { langLib } = this.context;
    const { loading, treeData } = this.props;
    const { expandedKeys, loadedKeys } = this.state;
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
          <CSpin spinning={loading}>
            <Tree
              showIcon
              checkStrictly={false}
              expandedKeys={expandedKeys}
              blockNode={true}
              onSelect={(selectedKeys, e) => this.onSelectNode(e)}
              onExpand={(expandedKeys, { expanded, node }) => this.handleExpand(node)}
              loadData={this.onLoadData}
              loadedKeys={loadedKeys}
            >
              {this.loopNode(treeData)}
            </Tree>
          </CSpin>
        </div>
        {/* <TreeFooter /> */}
      </div>
    );
  }
}
export default LeftTree;
