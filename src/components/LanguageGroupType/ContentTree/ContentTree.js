import { Component } from 'react';
import { Tree } from 'antd';
import classNames from 'classnames';
import { CSpin } from '@/components/common/BasicWidgets';
import {
  getLanguageGroupTree,
  languageGroupInsertOrUpdate,
  getLanguageTypeTree,
  languageTypeAction,
} from '@/services/languageGroupType';
import styles from './ContentTree.less';

const { TreeNode } = Tree;

class ContentTree extends Component {
  static defaultProps = {
    eleObj: {}, // 控件对象
  };
  state = {
    treeData: [], // 树数据
    // firstLoad: true, // 是否为第一次加载且默认展开第一个节点
    expandedKeys: [], // 展开的节点
    selectedRows: [], // 选中的节点
    activeNode: {}, // 当前节点TreeNode
    loading: false, // 加载状态
    keyWords: '', // 关键字
  };

  static getDerivedStateFromProps(props, state) {
    // 关键字搜索
    if (props.headerKeywords !== state.keyWords) {
      return {
        keyWords: props.headerKeywords,
      };
    }
    return null;
  }

  componentDidMount() {
    this.setState({ loading: true });
    this.fetchTree({ isRoot: true });
  }

  // 获取树单节点数据
  fetchTree = ({ isRoot = false, treeNode, callback }) => {
    const { type } = this.props;
    let api;
    let params;
    console.log(type);
    switch (type) {
      case 'languageGroup':
        api = getLanguageGroupTree;
        params = {};
        break;
      default :
        api = getLanguageGroupTree;
        params = {};
        break;
    }
    // api(params).then(res => {
    api(params).then(res => {
      // 搜索时使用全树
      // if (keyWords) {
      let expandedKeys;
      if (type === 'groupId') {
        expandedKeys = [];
      } else {
        expandedKeys = this.getSearchNodeKey(res);
      }
      if (treeNode) {
        treeNode.props.nodeData.children = res;
        this.setState({ treeData: [...this.state.treeData], loading: false });
      } else {
        this.setState({ treeData: res, loading: false, expandedKeys });
      }
      callback && callback();
    }, err => {
      callback && callback();
    });
  };
  // 搜索结果所有节点打开
  getSearchNodeKey = (treeData) => {
    const expandedKeys = [];
    // const loopGetNodeKey = dataList => {
    //   dataList.forEach(item => {
    //     expandedKeys.push(item.nodeKey);
    //     if (item.children) {
    //       loopGetNodeKey(item.children);
    //     }
    //   });
    // };
    // loopGetNodeKey(treeData);
    return expandedKeys;
  };
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
    }, () => {
      (!nodeData.children || !nodeData.children.length) && !keyWords && this.handleLoadData(node);
    });
  };
  // 选择节点
  handleSelectNode = e => {
    // 设置复选框选中状态(只允许选中非组节点)
    const isChecked = e.selected || e.checked;
    const { updateFrameState } = this.props;
    const { node } = e;
    const { nodeData } = node.props;
    this.setState({
      selectedRows: isChecked ? [nodeData] : [],
    }, () => {
      updateFrameState({ selected: isChecked ? [nodeData] : [] });
    });
    this.handleExpand(node);
  };
  // 单个树节点获取数据
  handleLoadData = treeNode => {
    const { keyWords } = this.state;
    return new Promise(resolve => {
      // 已经获取过子级
      if (treeNode.props.nodeData.children || keyWords) {
        resolve();
        return;
      }
      this.fetchTree({ treeNode, callback: resolve });
    });
  };
  // 遍历生成树节点
  loopNode = (data) => {
    const { keyWords } = this.state;
    const { treeNodeType, type } = this.props;
    return data && data.map(item => {
      const {
        isGroup,
        rootpath, // 显示层级结构 （/A1/B1 ）
        name,
        nodeKey,
        childCount,
        children = [],
        keyCode = '',
      } = item;
      const level = rootpath && rootpath.match(/\//g).length || 1;
      // 节点前缀图标样式
      const nodeIconCls = classNames({
        [styles.elementIcon]: !!!isGroup,
        'iconfont': true,
        'icon-file': !!isGroup, // 组图标
        'icon-line-tree': !!!isGroup, // 非组图标
      });
      // 节点样式
      const nodeCls = classNames({
        [styles.groupTit1]: type === 'languageGroup',
        [styles.eleTit1]: type === 'languageGroup',
        [styles[`level-${level}`]]: true,
      });
      // 节点名称格式
      const nodeName = (function() {
        switch (treeNodeType) {
          case 1:
            return name;
          case 2:
            return `${keyCode}_${name}`;
          case 3:
            return `${name}_${keyCode}`;
          case 4:
            return keyCode;
          default:
            return name;
        }
      }());
      const nodeProps = {
        className: nodeCls,
        title: <span title={nodeName}>{nodeName}</span>,
        icon: <span className={nodeIconCls}/>,
        nodeData: item,
        checkable: type === 'languageGroup' ? isGroup : !isGroup, // 只有非组时可以选择
        isLeaf: (type !== 'groupId' && type !== 'org') ? !children.length : !childCount,
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
  };

  render() {
    const { loading, expandedKeys, treeData, selectedRows } = this.state;
    const { eleObj = {} } = this.props;
    const { mainTableName = '' } = eleObj;
    const checkedKeys = selectedRows.map(item => item.nodeKey);
    return (
      <div className={styles.wrap}>
        <CSpin spinning={loading}>
          <Tree
            showIcon
            checkable={true}
            checkStrictly={true}
            // blockNode={true}
            className={styles.treeWrap}
            expandedKeys={expandedKeys}
            checkedKeys={checkedKeys}
            defaultExpandAll={true}
            onExpand={(expandedKeys, { expanded, node }) => this.handleExpand(node)}
            onSelect={(selectedKeys, e) => this.handleSelectNode(e)}
            onCheck={(checkedKeys, e) => this.handleSelectNode(e)}
            loadData={this.handleLoadData}
          >
            {this.loopNode(treeData)}
          </Tree>
        </CSpin>
      </div>
    );
  }
}

export default ContentTree;
