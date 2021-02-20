/*
 * @Author: Yzj
 * @Date:   2020-05-13
 * @Desc:   图形导航组列表
 */
import { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { CTable, CSearch } from '@/components/common/BasicWidgets';
import { getVisualGroupList, getTableLine } from '@/services/visualMap';
import { getGlobalTables } from '@/services/global';
import { getFrameDetail } from '@/services/framePage';
import { connect } from 'dva';
import styles from '../VisualMap.less';

@connect(state => ({
  visualMapGroupID: state.visualmap.visualMapGroupID,
}))

class ContentList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      listData: [], // 数据源
      loading: false,
      selectedRowKeys: [props.selectedRowKeys],
      total: 0,
      queryParams: {
        pageNum: 1,
        pageSize: 10,
      },
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  componentWillUnmount() {
    this.resetData();
  }

  // 重置数据
  resetData = () => {
    this.setState({ listData: [] });
  };
  // 获取列表数据
  fetchData = (searchValue = {}) => {
    this.setState({ loading: true });
    const { queryParams } = this.state;
    const { showType, otherParams } = this.props;
    const reqParams = {
      ...queryParams,
      ...otherParams,
      ...searchValue,
    };
    if (showType === 'grouplist') {
      getVisualGroupList().then(datalist => {
        this.setState({ listData: datalist, loading: false });
      }, err => this.setState({ loading: false }));
    } else if (showType === 'tablelist') {
      getGlobalTables(reqParams).then(datalist => {
        const { list, total } = datalist;
        this.setState({ listData: list, total: total, loading: false, queryParams: reqParams });
      }, err => this.setState({ loading: false }));
    } else if (showType === 'recordlist') {
      getTableLine(reqParams).then(datalist => {
        const { list, total } = datalist;
        this.setState({ listData: list, total: total, loading: false, queryParams: reqParams });
      }, err => this.setState({ loading: false }));
    } else if (showType === 'tablist') {
      getFrameDetail(reqParams).then(datalist => {
        this.setState({ listData: datalist.tabList, loading: false, queryParams: reqParams });
      }, err => this.setState({ loading: false }));
    }
  };
  // 列名
  getColumns = () => {
    const { showType } = this.props;
    if (showType === 'grouplist') {
      return this.visualGroupColums();
    } else if (showType === 'tablelist') {
      return this.tablesColums();
    } else if (showType === 'recordlist') {
      return this.recordColums();
    } else if (showType === 'tablist') {
      return this.tabColums();
    }
  }

  visualGroupColums = () => {
    return [
      {
        title: <FormattedMessage id="global.keycode"/>,
        dataIndex: 'keycode',
        render: text => <span title={text}>{text}</span>,
      }, {
        title: <FormattedMessage id="global.name"/>,
        dataIndex: 'name',
        render: text => <span title={text}>{text}</span>,
      },
    ];
  }

  tablesColums = () => {
    return [
      {
        title: <FormattedMessage id="global.index"/>,
        dataIndex: 'id',
        width: 100,
        render: (text, record, index) => {
          return <span>{index + 1}</span>;
        },
      }, {
        title: <FormattedMessage id="javaBean.modal.name"/>,
        key: 'tableName',
        dataIndex: 'tableName',
        render: text => <span title={text}>{text}</span>,
      }, {
        title: <FormattedMessage id="javaBean.modal.memo"/>,
        key: 'memo',
        dataIndex: 'memo',
        render: text => <span title={text}>{text}</span>,
      },
    ];
  }

  recordColums = () => {
    return [
      {
        title: <FormattedMessage id="global.index"/>,
        dataIndex: 'id',
        width: 100,
        render: (text, record, index) => {
          return <span>{index + 1}</span>;
        },
      }, {
        title: <FormattedMessage id="global.keycode"/>,
        dataIndex: 'keycode',
        render: text => <span title={text}>{text}</span>,
      }, {
        title: <FormattedMessage id="global.name"/>,
        dataIndex: 'name',
        render: text => <span title={text}>{text}</span>,
      },
    ];
  }

  tabColums = () => {
    return [
      {
        title: <FormattedMessage id="global.index"/>,
        dataIndex: 'id',
        width: 100,
        render: (text, record, index) => {
          return <span>{index + 1}</span>;
        },
      }, {
        title: <FormattedMessage id="global.keycode"/>,
        key: 'keycode',
        dataIndex: 'keycode',
        render: text => <span title={text}>{text}</span>,
      }, {
        title: <FormattedMessage id="pageConfig.tab.name"/>,
        key: 'name',
        dataIndex: 'name',
        render: text => <span title={text}>{text}</span>,
      },
    ];
  }
  // 点击行
  onClickRow = (record) => {
    const selectedRowKeys = [record.id];
    const { showType, setVisualMapGroupID, setTemporaryData } = this.props;
    this.setState({ selectedRowKeys });
    if (showType === 'grouplist') {
      setVisualMapGroupID({ id: record.id, name: record.name, userDesignerId: record.userDesignerId });
    } else if (showType === 'tablelist') {
      setTemporaryData({ relationTableNameId: record.id, relationTableName: record.tableName });
    } else if (showType === 'recordlist') {
      setTemporaryData({ relationId: record.id, recordName: record.name });
    } else if (showType === 'tablist') {
      setTemporaryData({ relationTabId: record.id, relationTabName: record.name });
    }
  };

  setSearchValue = tableName => {
    this.fetchData({ tableName, pageNum: 1 });
  }

  render() {
    const { listData, loading, total, selectedRowKeys, queryParams } = this.state;
    const { pageNum, pageSize } = queryParams;
    const { showType } = this.props;
    const rowSelection = {
      type: 'radio',
      selectedRowKeys,
      onSelect: (record, selected, selectedRows, nativeEvent) => {
        this.onClickRow(record);
      },
      onChange: (record, selected, selectedRows, nativeEvent) => {
        this.onClickRow(record);
      },
    };
    const pagination = (showType !== 'grouplist' || showType !== 'tablist') ? {
      total,
      current: pageNum,
      pageSize,
      onChange: (pageNum, newPageSize) => {
        this.setState({
          queryParams: {
            ...queryParams,
            pageNum,
            pageSize: newPageSize,
          },
        }, () => this.fetchData());
      },
    } : false;

    const HeaderSearch = (
      <CSearch
        className={styles.modalSearch}
        onSearch={value => this.setSearchValue(value)}
      />
    );

    return (
      <div className={styles.tableListWrap}>
        {showType === 'tablelist' && HeaderSearch}
        <CTable
          pagination={pagination}
          columns={this.getColumns()}
          dataSource={listData}
          rowSelection={rowSelection}
          onClickRow={this.onClickRow}
          loading={loading}
          rowKey="id"
        />
      </div>
    );
  }
}

export default ContentList;
