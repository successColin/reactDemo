/*
 * @Author: Fus
 * @Date:   2019-10-21 11:35:42
 * @Desc: 切换父节点
 */
import { Component } from 'react';
import { Tree } from 'antd';
import classNames from 'classNames';
import styles from './MoveTreeNode.less';

const { TreeNode } = Tree;

class MoveTreeNode extends Component {
  state = {
    selectedNodeData: {}, // 选中的节点
    expandedKeys: [], // 展开的节点
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
      activeNode: node,
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
    const { treeNodeType, treeNodeData, visible } = this.props;
    if (!visible) return null;
    const { isGroup: leftNodeIsGroup, nodeKey: leftNodeKey } = treeNodeData;
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
        isLeaf: !children.length,
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
    const { selectedNodeData, expandedKeys } = this.state;
    const { moveTreeData } = this.props;
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
        >
          {this.loopNode(moveTreeData)}
        </Tree>
      </div>
    );
  }
}
export default MoveTreeNode;