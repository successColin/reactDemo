/*
 * @Author: Fus
 * @Date:   2019-12-02 15:48:25
 * @Desc: 复制用户设计组菜单
 */
import { Component } from 'react';
import { Row, Col } from 'antd';
import { CSpin, CSearch } from '@/components/common/BasicWidgets';
import CreateTree from '@/components/common/CreateTree/CreateTree';
import { getUserDesignerTree } from '@/services/userDesigner';
import { getFunctionTree } from '@/services/function';
import { BaseContext } from '@/constants/global';
import { getBundleTree } from '@/services/bundleConfig';
import styles from './CopyUserDesignerMenu.less';

class CopyUserDesignerMenu extends Component {
  static contextType = BaseContext;
  static defaultProps = {
    fromType: 'PC', // 调用类型  (PC - APP)
  };
  state = {
    menuKeywords: '', // 菜单树搜索关键字
    userDesignerKeywords: '', // 用户设计组搜索关键字
    loadingStatus: {
      menuTree: false, // 菜单树
      userDesignerTree: false, // 用户设计组树
    },
  };

  componentDidMount() {
    this.fetchMenuTree();
    this.fetchUserDesignerTree();
  }

  // 获取菜单树
  fetchMenuTree = () => {
    const { fromType } = this.props;
    const { menuKeywords: keywords } = this.state;
    const menuTreApi = fromType === 'PC' ? getFunctionTree : getBundleTree;
    this.setLoadingStatus('menuTree', true);
    menuTreApi({ keywords }).then(menuTreeData => {
      this.setState({ menuTreeData });
      keywords && this.treeRef1 && this.treeRef1.setSearchExpandKeys(menuTreeData);
      this.setLoadingStatus('menuTree', false);
    }, err => this.setLoadingStatus('menuTree', false));
  };
  // 获取用户设计组树
  fetchUserDesignerTree = () => {
    this.setLoadingStatus('userDesignerTree', true);
    const { userDesignerKeywords: keywords } = this.state;
    getUserDesignerTree({ keywords }).then(userDesignerTreeData => {
      this.setState({ userDesignerTreeData });
      keywords && this.treeRef && this.treeRef.setSearchExpandKeys(userDesignerTreeData);
      this.setLoadingStatus('userDesignerTree', false);
    }, err => this.setLoadingStatus('userDesignerTree', false));
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
  // 搜索关键字
  handleSearch = (type, value) => {
    this.setState({ [type]: value }, () => {
      if (type === 'userDesignerKeywords') {
        this.fetchUserDesignerTree();
      } else if (type === 'menuKeywords') {
        this.fetchMenuTree();
      }
    });
  };
  // 选中节点
  setSelectedNode = ({ activeTreeNodeDetail }, type) => {
    const { isGroup, id } = activeTreeNodeDetail;
    this.props.setRootWrapState({
      [type]: isGroup ? 0 : id,
    });
  };

  render() {
    const { userDesignerTreeData, menuTreeData, loadingStatus } = this.state;
    const { langLib } = this.context;
    return (
      <Row className={styles.wrap}>
        <Col span={12} className={styles.colWrap}>
          <CSearch
            onSearch={val => this.handleSearch('userDesignerKeywords', val)}
            onChange={e => !e.target.value && this.handleSearch('userDesignerKeywords', e.target.value)}
            placeholder={langLib['form.placeholder.keywords']}
          />
          <CreateTree
            className={styles.treeWrap}
            treeData={userDesignerTreeData}
            checkable={true}
            ref={ref => this.treeRef = ref}
            loading={loadingStatus.userDesignerTree}
            updateFrameState={(args) => this.setSelectedNode(args, 'targetUserDesignerId')}
          />
        </Col>
        <Col span={12} className={styles.colWrap}>
          <CSearch
            onSearch={val => this.handleSearch('menuKeywords', val)}
            onChange={e => !e.target.value && this.handleSearch('menuKeywords', e.target.value)}
            placeholder={langLib['form.placeholder.keywords']}
          />
          <CreateTree
            className={styles.treeWrap}
            treeData={menuTreeData}
            checkable={true}
            ref={ref => this.treeRef1 = ref}
            loading={loadingStatus.menuTree}
            updateFrameState={(args) => this.setSelectedNode(args, 'targetFunctionId')}
            nodeConfig={{
              childShowIcon: false,
            }}
          />
        </Col>
      </Row>
    );
  }
}

export default CopyUserDesignerMenu;
