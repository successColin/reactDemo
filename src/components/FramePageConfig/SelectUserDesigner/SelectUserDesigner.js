/*
 * @Author: Fus
 * @Date:   2019-08-10 14:40:21
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2019-12-13 15:15:19
 * @Desc: 选择设计组应用该界面
 */
import { Component, Fragment } from 'react';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';
import { connect } from 'dva';
import { BaseContext } from '@/constants/global';
import { CSearch } from '@/components/common/BasicWidgets';
import CreateTree from '@/components/common/CreateTree/CreateTree';
import { CButton, CToolContainer, CTooltip } from '@/components/common/BasicWidgets';
// import UserDesignerTree from './UserDesignerTree/UserDesignerTree';
import { getUserDesignerTree } from '@/services/userDesigner';
import styles from './SelectUserDesigner.less';

@connect(state => ({
  framePage: state.framePage,
}))
class SelectUserDesigner extends Component {
  static contextType = BaseContext;
  state = {
    visibleToolContainer: false,
    treeData: [],
    activeTreeNodeDetail: {}, // 当前树节点信息
    keywords: '', // 关键字
    loading: false,
  };

  componentDidMount() {
    this.fetchTree(true);
  }

  // 获取树数据
  fetchTree = (setInit = false) => {
    this.setState({ loading: true });
    const { keywords } = this.state;
    getUserDesignerTree({ keywords }).then(treeData => {
      keywords && this.treeRef && this.treeRef.setSearchExpandKeys(treeData);
      this.setState({ treeData, loading: false });
      if (setInit) this.setInitSelected(treeData);
    }, err => this.setState({ loading: false }));
  };
  // 设置默认选中【默认】用户设计组
  setInitSelected = (treeData) => {
    let initUserDesigner = {};
    const mapToGetData = (data) => {
      data.forEach(item => {
        if (+item.initialData === 1 && !item.isGroup) {
          initUserDesigner = item;
          return;
        }
        if (item.children && item.children.length) {
          mapToGetData(item.children);
        }
      });
    };
    mapToGetData(treeData);
    this.setSelectedState({ activeTreeNodeDetail: initUserDesigner });
  };
  handleOpen = () => {
    // this.fetchTree();
    this.setState({ visibleToolContainer: !this.state.visibleToolContainer });
  };
  // 设置选中的用户组
  setSelectedState = ({ activeTreeNodeDetail }) => {
    this.setState({ activeTreeNodeDetail });
    // 选择非组元素时才设置用户设计组
    if (!activeTreeNodeDetail.isGroup) {
      const { functionId } = this.props.framePage;
      this.context.dispatch({
        type: 'framePage/clearState',
      });
      this.context.dispatch({
        type: 'framePage/updateState',
        payload: {
          functionId,
          userDesignerId: activeTreeNodeDetail.id,
          selectedUserDesignerDetail: activeTreeNodeDetail,
        },
      });
      // 选择面板时关闭弹框
      this.setState({ visibleToolContainer: false });
    }
  };
  handleSearch = (keywords) => {
    this.setState({ keywords }, () => this.fetchTree());
  };

  render() {
    const { visibleToolContainer, treeData, loading, activeTreeNodeDetail } = this.state;
    const { selectedUserDesignerDetail } = this.props.framePage;
    const { name = '' } = selectedUserDesignerDetail;
    const searchCls = classNames({
      [styles.search]: true,
      'light-circle-search': true,
    });
    return (
      <div className={styles.wrap}>
        <CButton className={styles.toUse} onClick={this.handleOpen}>
          <FormattedMessage id={`framePageConfig.treeHeader.title${name ? '.group' : ''}`} values={{ name }}/>
          <span className="iconfont icon-right"/>
        </CButton>
        <CToolContainer
          trigger="click"
          placement="rightTop"
          visible={visibleToolContainer}
          onClose={() => this.setState({ visibleToolContainer: false })}
        >
          <div className={styles.treeWrap}>
            <div className={styles.searchWrap}>
              <CSearch
                className={searchCls}
                onSearch={keywords => this.handleSearch(keywords)}
                onChange={e => !e.target.value && this.handleSearch('')}
              />
            </div>
            <div className={styles.treeContent}>
              <CreateTree
                dataType="userDesigner"
                treeStyle="dark"
                treeData={treeData}
                nodeConfig={{ notGroupIcon: true }}
                needGetDetail={false}
                loading={loading}
                updateFrameState={this.setSelectedState}
                activeTreeNodeDetail={activeTreeNodeDetail}
                ref={ref => this.treeRef = ref}
              />
            </div>
          </div>
        </CToolContainer>
      </div>
    );
  }
}

export default SelectUserDesigner;
