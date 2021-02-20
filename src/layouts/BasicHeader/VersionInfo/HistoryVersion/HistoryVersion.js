/*
 * @Author: Fus
 * @Date:   2020-02-11 10:12:03
 * @Desc: 历史版本
 */
import { Component } from 'react';
import { Pagination } from 'antd';
import { SplitLine, CSpin } from '@/components/common/BasicWidgets';
import { getSystemVersionList } from '@/services/versionConfig';
import { formatTime } from '@/utils/common';
import styles from './HistoryVersion.less';

class HistoryVersion extends Component {
  state = {
    total: 0, // 总数
    listData: [], // 列表数据
    loading: false, // 加载状态
    queryParam: { // 获取列表传参
      pageSize: 2,
      pageNum: 1,
      basetype: 1,
    },
  }
  componentDidMount() {
    this.fetchList();
  }
  // 获取列表
  fetchList = () => {
    const { queryParam } = this.state;
    this.setState({ loading: true });
    getSystemVersionList(queryParam).then(res => {
      const { list = [], total = 0 } = res;
      this.setState({ listData: list, total, loading: false });
    }, err => this.setState({ loading: false }));
  }
  // 渲染列表
  renderList = () => {
    const { listData } = this.state;
    return listData.map(item => {
      const { version, upgradeTime, memo, id } = item;
      const content = memo ? memo.replace(/\n/g, '<br/>') : '';
      return (
        <li key={`version_${id}`}>
          <SplitLine title={`${version} | ${upgradeTime ? formatTime(upgradeTime) : ''}`} />
          <div className={styles.content} dangerouslySetInnerHTML={{ __html: content }} />
        </li>
      );
    });
  }
  // 切换页码
  handleChangePageNum = (pageNum, pageSize) => {
    const { queryParam } = this.state;
    this.setState({
      queryParam: {
        ...queryParam,
        pageNum,
        pageSize,
      },
    }, () => this.fetchList());
  }
  render() {
    const { queryParam, total, loading } = this.state;
    const { pageNum, pageSize } = queryParam;
    return (
      <CSpin spinning={loading}>
        <div className={styles.wrap}>
          <ul className={styles.list}>
            {this.renderList()}
          </ul>
          <Pagination
            current={pageNum}
            total={total}
            size="small"
            showQuickJumper={true}
            showSizeChanger={true}
            pageSize={pageSize}
            pageSizeOptions={['2', '5', '10', '20']}
            onChange={(pageNum, pageSize) => this.handleChangePageNum(pageNum, pageSize)}
            onShowSizeChange={(pageNum, pageSize) => this.handleChangePageNum(pageNum, pageSize)}
          />
        </div>
      </CSpin>
    );
  }
}

export default HistoryVersion;