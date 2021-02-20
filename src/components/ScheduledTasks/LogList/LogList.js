/*
 * @Author: jwk
 * @Date:   2020-06-02 10:50:23
 * @Desc: 日志列表
 */
import React, { Component } from 'react';
import { CTable, CMessage } from '@/components/common/BasicWidgets';
import { Pagination, Popover } from 'antd';
import { FormattedMessage } from 'react-intl';
import { getJobLogList } from '@/services/scheduledTasks';
import styles from '@/components/ScheduledTasks/ScheduledTasks.less';


class LogList extends Component {
  static getDerivedStateFromProps(nextProps, state) {
    if (nextProps.modalKeyWords !== state.keyWords) {
      return {
        keyWords: nextProps.modalKeyWords,
        page: 1, // 默认第一页
      };
    }
    return null;
  }

  state = {
    limit: 10, // 默认分页10
    page: 1, // 默认第一页
    loading: false,
    total: 0, // 总条数
    list: [], // 列表数据
    keyWords: null, // 模糊查找
  };


  componentDidMount() {
    this.getLogList();
  }

  componentDidUpdate(nextProps) {
    if (nextProps.modalKeyWords !== this.state.keyWords) {
      this.getLogList();
    }
  }


  // 获取日志列表
  getLogList = () => {
    const { activeDetail } = this.props;
    const { limit, page, keyWords } = this.state;
    this.setState({
      loading: true,
    });
    getJobLogList({ jobId: activeDetail.id, limit, page, keyWords }).then(res => {
      this.setState({
        loading: false,
        total: res.total || 0, // 总条数
        list: res.rows || [], // 列表数据
      });
    }, err => {
      this.setState({
        loading: false,
      });
    });
  };
  getColumns = () => {
    const { list, total, limit, page } = this.state;
    return [
      {
        title: <FormattedMessage id="global.index"/>,
        dataIndex: 'sno',
        width: 50,
        render: (text, record, index) => {
          return <span>{limit * (page - 1) + index + 1}</span>;
        },
      },
      {
        title: <FormattedMessage id="tasks.form.name"/>,
        dataIndex: 'jobName',
        width: 150,
      },
      {
        title: <FormattedMessage id="tasks.form.beanName"/>,
        dataIndex: 'beanName',
        width: 180,
        ellipsis: true,
        render: (text, record) => {
          return <span title={text}>{text}</span>;
        },
      },
      {
        title: <FormattedMessage id="tasks.modal.times"/>,
        dataIndex: 'times',
        width: 100,
        ellipsis: true,
        render: (text, record) => {
          return <span>{`${text}ms`}</span>;
        },
      }, {
        title: <FormattedMessage id="tasks.form.methodName"/>,
        dataIndex: 'methodName',
        width: 150,
        ellipsis: true,
        render: (text, record) => {
          return <span title={text}>{text}</span>;
        },
      }, {
        title: <FormattedMessage id="tasks.modal.startTime"/>,
        dataIndex: 'createDate',
        width: 150,
        ellipsis: true,
      }, {
        title: <FormattedMessage id="tasks.modal.err"/>,
        dataIndex: 'error',
        width: 250,
        ellipsis: true,
        render: (text, record) => {
          let dom = <div style={{ 'padding': '5px', 'wordBreak': 'break-word' }}>{text}</div>;
          return <Popover trigger="hover" overlayStyle={{ 'width': '640px' }}
                          content={dom}>{text}</Popover>;
        },
      }, {
        title: <FormattedMessage id="tasks.stauts"/>,
        dataIndex: 'status',
        width: 100,
        render: (text, record) => {
          let context = record.status === 1 ?
            <div><span className={styles.suspend}></span><FormattedMessage id="tasks.destruction"/></div> :
            <div><span className={styles.start}></span><FormattedMessage id="tasks.success"/></div>;
          return context;
        },
      },
    ];
  };
  // 切页
  changePage = (page, pageSize) => {
    this.setState({
      page,
      limit: pageSize,
    }, () => {
      this.getLogList();
    });
  };

  render() {
    const columns = this.getColumns();
    const { list, total, loading, limit, page } = this.state;
    return (<div className={styles.modalLogListBox}>
      <CTable
        className={styles.modalLogListBoxTable}
        columns={columns}
        rowKey={record => record.id}
        dataSource={list}
        // scroll={{ y: 'calc(100vh - 250px)' }}
        pagination={false}
        loading={loading}
      />
      <Pagination
        className={styles.modalLogListBoxPage}
        pageSize={limit}
        onChange={this.changePage}
        showSizeChanger
        defaultCurrent={page}
        showTotal={(total, range) => {
          return (
            <div><FormattedMessage id="global.total"/>{total}</div>
          );
        }}
        total={total}
        onShowSizeChange={this.changePage}
      />
    </div>);
  }
}

export default LogList;
