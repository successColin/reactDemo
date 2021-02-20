/*
 * @Author: Fus
 * @Date:   2019-08-12 13:38:34
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2019-12-02 16:04:09
 * @Desc: 选择预设面板
 */
import { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { Tabs } from 'antd';
import { connect } from 'dva';
import classNames from 'classnames';
import CreateTree from '@/components/common/CreateTree/CreateTree';
import { BaseContext } from '@/constants/global';
import { getTabTree, getMenuTabTree } from '@/services/pageConfig';
import { getMobileTabTree, getUserDesignerMobileTabTree } from '@/services/mobileConfig';
import styles from './SelectPageTab.less';

const { TabPane } = Tabs;

@connect(state => ({
  framePage: state.framePage,
}))
class SelectPageTab extends Component {
  static contextType = BaseContext;
  static defaultProps = {
    fromType: 'PC', // 引用该组件处（PC-界面配置，APP-移动端bundle配置）
  };

  static getDerivedStateFromProps(props, state) {
    if (props.keywords !== state.keywords) {
      return {
        keywords: props.keywords,
      };
    }
    return null;
  }

  state = {
    activeTabKey: 'tabTree', // tabkey
    libTreeData: [], // 界面库树数据
    menuTreeData: [], // 当前菜单面板树
    activeTreeNodeDetail: {}, // 当前树节点信息
    loadingStatus: { // 加载状态
      libTree: false, // 界面库树
      menuTree: false,
    },
    keywords: '', // 模糊查询
  };

  componentDidMount() {
    // 统一加loading，防止两棵树异步获取导致setLoading时状态未统一
    this.setState({
      loadingStatus: {
        libTree: true,
        menuTree: true,
      },
    });
    this.fetchLibTree();
    this.fetchMenuTree();
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.keywords !== prevState.keywords) {
      this.fetchLibTree();
      this.fetchMenuTree();
    }
  }

  // 获取界面库树数据
  fetchLibTree = () => {
    const { fromType } = this.props;
    const getTreeApi = fromType === 'PC' ? getTabTree : getMobileTabTree;
    const { keywords } = this.state;
    getTreeApi({ keywords }).then(libTreeData => {
      this.setState({ libTreeData });
      keywords && this.treeRefLib && this.treeRefLib.setSearchExpandKeys(libTreeData);
      this.setLoadingStatus('libTree', false);
    }, err => this.setLoadingStatus('libTree', false));
  };
  // 获取菜单树数据
  fetchMenuTree = () => {
    const { fromType } = this.props;
    const { keywords } = this.state;
    const getTreeApi = fromType === 'PC' ? getMenuTabTree : getUserDesignerMobileTabTree;
    getTreeApi({ keywords }).then(menuTreeData => {
      this.setState({ menuTreeData });
      keywords && this.treeRef && this.treeRef.setSearchExpandKeys(menuTreeData);

      this.setLoadingStatus('menuTree', false);
    }, err => this.setLoadingStatus('menuTree', false));
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
  // 更新tab树节点信息
  setSelectedTabInfo = ({ activeTreeNodeDetail, activeDetail = {} }) => {
    if (activeTreeNodeDetail.isGroup) return; // 只加入非组的面板信息
    const { activeTabKey } = this.state;
    const { elementList = [] } = activeDetail;
    this.props.setContainerState({ selectedTabNodeInfo: activeTreeNodeDetail });
    const newElementList = elementList && elementList.map(item => ({ ...item, id: null })); // 去除元素里的id
    const { fromType } = this.props;
    const dispatchState = fromType === 'PC' ? 'framePage' : 'bundleConfig';
    this.context.dispatch({
      type: `${dispatchState}/updateState`,
      payload: {
        addTabDetail: {
          ...activeTreeNodeDetail,
          ...activeDetail,
          id: null,
          rootId: null,
          groupId: null,
          planned: fromType === 'PC' ? 10 : 1, // 配置界面
          elementList: newElementList,
          ignore_type: activeTabKey,
          ignore_id: activeTreeNodeDetail.id, // 从菜单库中添加需要面板id
        },
      },
    });
  };

  render() {
    const { libTreeData, menuTreeData, loadingStatus, activeTabKey, activeTreeNodeDetail } = this.state;
    const { selectedTabNodeInfo, fromType } = this.props;
    const { langLib } = this.context;
    const tabsCls = classNames({
      'custom-content-tabs': true,
      [styles.tabs]: true,
    });
    const renderTree = dataType => (
      <CreateTree
        dataType={dataType}
        checkable={true}
        activeTreeNodeDetail={selectedTabNodeInfo}
        treeData={libTreeData}
        loading={loadingStatus.libTree}
        updateFrameState={this.setSelectedTabInfo}
      />
    );
    const tabTreeType = fromType === 'PC' ? 'tab' : 'mobileTab';
    const menuTreeType = fromType === 'PC' ? 'menuTree' : 'mobileMenuTree';
    return (
      <Tabs
        activeKey={activeTabKey}
        className={tabsCls}
        onChange={activeTabKey => this.setState({ activeTabKey })}
      >
        <TabPane tab={<FormattedMessage id="selectPage.from.lib"/>} key="tabTree">
          <div className={styles.treeBox}>
            <CreateTree
              dataType={tabTreeType}
              checkable={true}
              activeTreeNodeDetail={selectedTabNodeInfo}
              treeData={libTreeData}
              ref={ref => this.treeRefLib = ref}
              loading={loadingStatus.libTree}
              updateFrameState={this.setSelectedTabInfo}
            />
          </div>
        </TabPane>
        <TabPane tab={<FormattedMessage id={`selectPage.from.${fromType === 'PC' ? 'menu' : 'bundle'}`}/>}
                 key="menuTree">
          <div className={styles.treeBox}>
            <CreateTree
              dataType={menuTreeType}
              checkable={true}
              treeData={menuTreeData}
              activeTreeNodeDetail={activeTreeNodeDetail}
              loading={loadingStatus.menuTree}
              updateFrameState={this.setSelectedTabInfo}
              ref={ref => this.treeRef = ref}
              nodeConfig={{
                renderTitle: node => {
                  const { name, userDesignerName, isGroup } = node;
                  const tit = isGroup ? name : `${name}（${langLib['global.userDesigner']}：${userDesignerName}）`;
                  return (
                    <span title={tit}>
                      {tit}
                    </span>
                  );
                },
              }}
            />
          </div>
        </TabPane>
      </Tabs>
    );
  }
}

export default SelectPageTab;
