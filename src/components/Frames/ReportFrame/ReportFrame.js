/*
 * @Author: Fus
 * @Date:   2019-10-17 10:33:53
 * @Desc: 报表框架
 */
import { Component } from 'react';
import { connect } from 'dva';
import TabPaneContainer from './TabPaneContainer/TabPaneContainer';
import { getPageConfig, getPageFullTree, getPageSingleTreeNode, getPageData, insertOrUpdatePageData, getPageSelectOptions, getTreeFrameListData, validKeycode } from '@/services/frame';
import styles from './ReportFrame.less';

@connect(state => ({
  functionData: state.tabs.activeTabData.functionData,
}))
class ReportFrame extends Component {
  state = {
    pageConfig: {}, // 配置信息
    loadingStatus: {
      page: false, // 页面元素
    },
  }
  componentDidMount() {
    this.fetchPageConfig();
  }
  // 获取页面的配置信息
  fetchPageConfig = () => {
    const { functionData } = this.props;
    this.setLoadingStatus('page', true);
    getPageConfig({ functionId: functionData.id }).then(pageConfig => {
      this.setState({ pageConfig });
      this.setLoadingStatus('page', false);
    }, err => this.setLoadingStatus('page', false));
  }
  // 更新loading状态
  setLoadingStatus = (type, loading) => {
    const { loadingStatus } = this.state;
    this.setState({
      loadingStatus: {
        ...loadingStatus,
      [type]: loading,
      },
    });
  }
  render() {
    const { pageConfig } = this.state;
    const tabProps = {
      pageConfig,
    };
    return (
      <div className={styles.wrap}>
        <TabPaneContainer {...tabProps} />
      </div>
    );
  }
}

export default ReportFrame;