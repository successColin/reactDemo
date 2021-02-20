/*
 * @Author: Fus
 * @Date:   2019-10-21 11:35:42
 * @Desc: 切换父节点
 */
import { Component } from 'react';
import { Tree } from 'antd';
import classNames from 'classnames';
import { getPageSingleTreeNode } from '@/services/frame';
import styles from './MoveTreeNode.less';

const { TreeNode } = Tree;

class MoveTreeNode extends Component {
  state = {
    selectedNodeData: {}, // 选中的节点
    expandedKeys: [], // 展开的节点
    treeData: [], // 树节点
    loadedKeys: [], // 已加载的数据
    treeNodeData: {}, // 选中节点对象数据
    originNode: {}, // antd TreeNode对象
  }
  componentDidMount() {
    this.fetchSingleTreeNode({ isRoot: true });
  }
  // 获取单节点数据
  fetchSingleTreeNode = ({ isRoot = false, callback }) => {
    const { frameData } = this.props;
    const { originNode, treeNodeData } = this.state;
    const { datasource1, datasource2, groupColumn, id: frameId } = frameData;
    let group = 1;
    if (!isRoot) group = +treeNodeData.isGroup;
    const id = isRoot ? 0 : treeNodeData.id;
    let rootPath = '';
    if (originNode && originNode.props) {
      rootPath = treeNodeData.rootpath;
    }
    const params = {
      id,
      group,
      groupDataSource: datasource1,
      dataSource: datasource2,
      mainColumn: groupColumn,
      frameId,
      rootPath,
    };
    getPageSingleTreeNode(params).then(res => {
      const { groupList = [], childList = [], currentTreeData = {} } = res;
      if (isRoot) {
        this.setState({ treeData: [...groupList, ...childList] });
      } else {
        originNode.props.nodeData.children = [...groupList, ...childList];
        originNode.props.nodeData.name = currentTreeData.name;
        originNode.props.nodeData.childCount = currentTreeData.childCount;
        this.setState({ treeData: [...this.state.treeData] });
      }
      callback && callback(res);
    }, err => callback && callback());
  }
  // 单个树节点获取数据
  onLoadData = originNode => {
    return new Promise(resolve => {
      const { loadedKeys } = this.state;
      const { nodeKey } = originNode.props.nodeData;
      this.fetchSingleTreeNode({ callback: resolve });
      this.setState({
        loadedKeys: [...loadedKeys, nodeKey],
        treeNodeData: originNode.props.nodeData,
        originNode,
      });
    });
  }
  // 展开、折叠节点
  handleExpand = (node) => {
    const { nodeData } = node.props;
    const { expandedKeys, keyWords } = this.state;
    const activeExpandKeyId = nodeData.nodeKey;
    const activeExpandKeyIndex = expandedKeys.indexOf(activeExpandKeyId);
    let newExpandKeys = [...expandedKeys];
    if (activeExpandKeyIndex === -1) {
      newExpandKeys.push(activeExpandKeyId);
    } else {
      newExpandKeys.splice(activeExpandKeyIndex, 1);
    }
    this.setState({
      expandedKeys: newExpandKeys,
      treeNodeData: nodeData,
      originNode: node,
    });
  }
  // 选择节点
  handleSelectNode = (e, needExpand = true) => {
    const isChecked = e.selected || e.checked;
    const { node } = e;
    const { nodeData } = node.props;
    // if (!nodeData.isGroup) {
      this.setState({ selectedNodeData: isChecked ? nodeData : {} });
    // }
    needExpand && this.handleExpand(node);
  }
  // 遍历生成树节点
  loopNode = (data) => {
    const { keyWords } = this.state;
    const { treeNodeType, leftTreeNodeData, visible } = this.props;
    if (!visible) return null;
    const { isGroup: leftNodeIsGroup, nodeKey: leftNodeKey } = leftTreeNodeData;
    return data && data.map(item => {
      const {
        isGroup,
        rootpath, // 显示层级结构 （/A1/B1 ）
        name,
        nodeKey,
        childCount,
        children = [],
        keyCode = '',
        iconName,
      } = item;
      const level = rootpath && rootpath.match(/\//g).length || 1;
      const initIconName = isGroup ? 'file' : 'line-tree';
      // 节点前缀图标样式
      const nodeIconCls = classNames({
        [styles.elementIcon]: !!!isGroup,
        'iconfont': true,
        [`icon-${iconName || initIconName}`]: true,
      });
      // 节点样式
      const nodeCls = classNames({
        [styles.groupTit]: !!isGroup,
        [styles.eleTit]: !!!isGroup,
        [styles[`level-${level}`]]: true,
      });
      // 节点名称格式
      const nodeName = (function() {
        switch (treeNodeType) {
          case 1: return name;
          case 2: return `${keyCode}_${name}`;
          case 3: return `${name}_${keyCode}`;
          case 4: return keyCode;
          default: return name;
        }
      }());
      const nodeProps = {
        className: nodeCls,
        title: <span title={nodeName}>{nodeName}</span>,
        icon: <span className={nodeIconCls}/>,
        nodeData: item,
        checkable: !(leftNodeIsGroup && !isGroup), // 无法将原组节点移到非组节点下
        isLeaf: !childCount,
      };
      if (leftNodeKey === nodeKey) return <span />;
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
  render() {
    const { selectedNodeData, expandedKeys, loadedKeys, treeData } = this.state;
    return (
      <div className={styles.treeWrap}>
        <Tree
          showIcon
          checkable={true}
          checkStrictly={true}
          blockNode={true}
          expandedKeys={expandedKeys}
          checkedKeys={[selectedNodeData.nodeKey || '']}
          onExpand={(expandedKeys, { expanded, node }) => this.handleExpand(node)}
          onSelect={(selectedKeys, e) => this.handleSelectNode(e)}
          onCheck={(checkedKeys, e) => this.handleSelectNode(e, false)}
          loadData={this.onLoadData}
          loadedKeys={loadedKeys}
        >
          {this.loopNode(treeData)}
        </Tree>
      </div>
    );
  }
}
export default MoveTreeNode;