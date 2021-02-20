import React, { Component } from 'react';
import { Col, Row, Icon, Input, Select, Table, Pagination, Modal, Form } from 'antd';
import { FormattedMessage } from 'react-intl';
import styles from './RelationElementList.less';
import { BaseContext } from '@/constants/global';
import { getDoBatchList } from '@/services/language';

const { Search } = Input;
const InputGroup = Input.Group;

class RelationElementList extends Component {
  static contextType = BaseContext;

  constructor() {
    super();
    this.state = {
      list: [],
      count: 0, // 列表数量
      pageSize: 10, // 默认分页10
      keyWords: '',
      pageNum: 1, // 默认第一页
      loading: false,
      selected: [], // 选中的行
      selectedRowKeys: [], // 勾选中的行
      selectedItems: [], // 勾选中的下拉框
      searchValue: { keywords: '' },
    };
  }

  componentDidMount() {
    this.getList();
  }

  // 获取数据
  getList = () => {
    const { pageSize, pageNum, searchValue, loading } = this.state;
    const { activeDetail } = this.props;
    this.setState({ loading: true });
    getDoBatchList({ pageSize, pageNum, ...searchValue, languagetemplateid: activeDetail.id }).then((res) => {
      this.setState({ selected: [], loading: false, list: res.list || [], count: res.total });
    }, err => {
      this.setState({ loading: false });
    });
  };
  // 单选
  onClickRow = (record, selectedRows) => {
    let { selected } = this.state;
    const { updateState } = this.props;
    if (selectedRows) {
      if (selected.findIndex(item => item.elementid === record.elementid) !== -1) {
        selected.splice(selected.findIndex(item => item.elementid === record.elementid), 1);
      } else {
        selected.push(record);
      }
      this.setState({
        selected: [...selected],
      }, () => {
        updateState({ selected });
      });
    }
  };
  // 全选或者反选
  onClickRowAll = (record, selectedRows, arr) => {
    let { selected } = this.state;
    const { updateState } = this.props;
    if (record) {
      selectedRows.forEach(item => {
        let index = selected.findIndex(items => items.elementid === item.elementid);
        if (index === -1) {
          selected.push(item);
        }
      });
      this.setState({
        selected: [...selected],
      }, () => {
        updateState({ selected });
      });
    } else {
      arr.forEach(item => {
        let index = selected.findIndex(items => items.elementid === item.elementid);
        if (index !== -1) {
          selected.splice(index, 1);
        }
      });
      this.setState({
        selected: [...selected],
      }, () => {
        updateState({ selected });
      });
    }
  };
  // 点击行
  clickRow = (record) => {
    return {
      onClick: () => {
        let { selected } = this.state;
        const { updateState } = this.props;
        if (selected.find((item) => item.elementid === record.elementid)) {
          selected.splice(selected.findIndex((item) => item.elementid === record.elementid), 1);
        } else {
          selected.push(record);
        }
        this.setState({
          selected: [...selected],
        }, () => {
          updateState({
            selected,
          });
        });
      },
    };
  };
  // 切页
  changePage = (page, pageSize) => {
    this.setState({
      pageNum: page,
      pageSize,
    }, () => {
      this.getList();
    });
  };

  render() {
    const { list, visible, pageSize, count, pageNum, loading, selected, selectedItems } = this.state;

    const columns = [
      {
        title: <FormattedMessage id="menu.table.sno"/>,
        dataIndex: 'sno',
        width: 80,
        render: (text, record, index) => {
          return <span>{(pageNum - 1) * pageSize + index + 1}</span>;
        },
      },
      {
        title: <FormattedMessage id="langauges.terminus"/>,
        dataIndex: 'type',
        width: 80,
      },
      {
        title: <FormattedMessage id="langauges.functionname"/>,
        dataIndex: 'functionname',
        width: 200,
      },
      {
        title: <FormattedMessage id="langauges.design"/>,
        dataIndex: 'userdesignername',
        width: 200,
      },
      {
        title: <FormattedMessage id="langauges.tab"/>,
        dataIndex: 'tabname',
        width: 200,
      },
      {
        title: <FormattedMessage id="pageConfig.col.showName"/>,
        dataIndex: 'displayname',
      },
      {
        title: <FormattedMessage id="settingForm.placeholderText"/>,
        dataIndex: 'placeholdertext',
      },
      {
        title: <FormattedMessage id="settingForm.tooltipText"/>,
        dataIndex: 'tooltiptext',
      },
    ];
    const rowSelection = {
      type: 'checkbox',
      columnWidth: '50px',
      selectedRowKeys: selected.map(item => item.elementid),
      onSelectAll: (record, selected, selectedRows, nativeEvent) => {
        this.onClickRowAll(record, selected, selectedRows);
      },
      onSelect: (record, selected, selectedRows, nativeEvent) => {
        this.onClickRow(record, selectedRows);
      },
      onChange: (record, selected, selectedRows, nativeEvent) => {
        this.onClickRow(record, selectedRows);
      },
    };
    const { langLib } = this.context;
    return (<div className={styles.relationElementList}>
      <div className={styles.search}>
        <InputGroup compact>
          <Search
            placeholder={langLib['form.placeholder.keywords']}
            onSearch={value => {
              this.setState({ pageNum: 1, searchValue: { keywords: value } }, () => {
                this.getList();
              });
            }}
            onChange={e => {
              let value = e.target.value;
              this.setState({ searchValue: { keywords: value } });
            }}
            style={{ width: 200 }}
          />
        </InputGroup>
      </div>
      <div className={styles.table}>
        <Table
          columns={columns}
          rowKey={record => record.elementid}
          dataSource={list}
          scroll={{ y: 'calc(100vh - 250px)' }}
          pagination={false}
          onRow={this.clickRow}
          loading={loading}
          rowSelection={rowSelection}
        />
      </div>
      <div className={`${styles.footer} footerClass`}>
        <Pagination
          pageSize={pageSize}
          onChange={this.changePage}
          showSizeChanger
          defaultCurrent={pageNum}
          // current={currentPage}
          total={count}
          pageSizeOptions={['10', '20', '50', '100', '200', '500', '1000']}
          showTotal={(total, range) => {
            return (
              <div><FormattedMessage id="global.total"/>{total}</div>
            );
          }}
          onShowSizeChange={this.changePage}
        />
      </div>
    </div>);
  }
}

export default RelationElementList;
