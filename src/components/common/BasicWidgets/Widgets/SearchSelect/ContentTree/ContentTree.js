/*
 * @Author: Fus
 * @Date:   2020-02-28 10:22:51
 * @Desc: 数据选择框弹出树
 */
import { Component } from 'react';
import CreateTree from '@/components/common/CreateTree/CreateTree';
import { BaseContext } from '@/constants/global';
import { getFunctionTree } from '@/services/function';
import { getBundleTree } from '@/services/bundleConfig';

class ContentTree extends Component {
  static contextType = BaseContext;

  static getDerivedStateFromProps(props, state) {
    if (props.headerKeywords !== state.keyWords) {
      return {
        keywords: props.headerKeywords,
      };
    }
    return null;
  }

  state = {
    keywords: '', // 关键字
    treeData: [], // 树数据
    loading: false, // 加载数据
  };

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.keywords !== this.state.keywords) {
      this.fetchData();
    }
  }

  // 获取数据
  fetchData = () => {
    const { keywords } = this.state;
    const api = this.getTreeApi();
    if (!api) return;
    this.setState({ loading: true });
    api({ keywords }).then(treeData => {
      this.setState({ treeData, loading: false }, () => {
        keywords && this.refs && this.refs.treeContent.setSearchExpandKeys(treeData);
      });
    }, err => this.setState({ loading: false }));
  };
  // 根据类型获取数据接口
  getTreeApi = () => {
    const { modalContentType } = this.props;
    switch (modalContentType) {
      case 'function':
        return getFunctionTree;
      case 'bundle':
        return getBundleTree;
      default:
        return null;
    }
  };
  // 选中节点
  setSelectedNode = ({ activeTreeNodeDetail }) => {
    this.props.setWrapState({ selectedRows: [activeTreeNodeDetail] });
  };

  render() {
    const { treeData, loading } = this.state;
    const { needCheckRoot = false } = this.props;
    return (
      <CreateTree
        // className={styles.treeWrap}
        ref="treeContent"
        treeData={treeData}
        checkable={true}
        loading={loading}
        needCheckRoot={needCheckRoot}
        updateFrameState={(args) => this.setSelectedNode(args)}
        nodeConfig={{
          childShowIcon: false,
        }}
      />
    );
  }
}

export default ContentTree;
