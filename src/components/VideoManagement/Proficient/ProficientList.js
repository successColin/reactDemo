import React, { Component, Fragment } from 'react';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';
import { BaseContext } from '@/constants/global';
import CTable from '@/components/common/BasicWidgets/Widgets/CTable/CTable';
import CreateModal from '@/components/common/CreateModal/CreateModal';
import CButton from '@/components/common/BasicWidgets/Widgets/CButton/CButton';
import CMessage from '@/components/common/BasicWidgets/Widgets/CMessage/CMessage';
import { CSearch } from '@/components/common/BasicWidgets';
import TagSet from '@/components/common/BasicWidgets/Widgets/CheckBoxSearchSelect/ModalContent/TagSet/TagSet';
import styles from './ProficientList.less';
import { getExportList } from '@/services/videoManager';

const initQueryParams = {
  pageNum: 1,
  pageSize: 10,
  expertStates: 'ONLINE',
};

class ProficientList extends Component {
  static contextType = BaseContext;

  constructor(props) {
    super();
    this.state = {
      listData: [], // 数据源
      total: 0,
      loading: false,
      queryParams: initQueryParams, // 获取列表的传参
      keyWords: null, // 关键字
      selectedRows: [],
    };
  }

  componentDidMount() {
    console.log('proficient_____did');
    this.fetchData();
  }

  // 获取列表数据
  fetchData = (fromSearch = false) => {
    const { queryParams, keyWords } = this.state;
    const { pageNum } = queryParams;
    const reqParams = {
      ...queryParams,
      keyWords,
    };
    this.setState({ loading: true });
    getExportList(reqParams).then(res => {
      const { list, total } = res;
      this.setState({ listData: list, total, loading: false });
    }, err => this.setState({ loading: false }));
  };

  // 列名
  getColumns = () => {
    return [
      {
        //   title: 'id',
        //   dataIndex: 'id',
        //   width: 40,
        // }, {
        title: <FormattedMessage id="userCenter.account"/>,
        dataIndex: 'account',
        render: text => <span title={text}>{text}</span>,
      }, {
        title: <FormattedMessage id="global.name"/>,
        dataIndex: 'name',
        render: text => <span title={text}>{text}</span>,
      }, {
        title: <FormattedMessage id="video.list.domain"/>,
        dataIndex: 'domain',
        render: text => <span title={text}>{text}</span>,
      }, {
        title: <FormattedMessage id="global.root"/>,
        dataIndex: 'rootname',
        render: text => <span title={text}>{text}</span>,
        // }, {
        //   title: <FormattedMessage id="global.memo"/>,
        //   dataIndex: 'memo',
        //   render: text => <span title={text}>{text}</span>,
        // }, {
        //   title: <FormattedMessage id="global.type"/>,
        //   dataIndex: 'typename',
        //   render: text => <span title={text}>{text}</span>,
        // }, {
        //   title: <FormattedMessage id="global.status"/>,
        //   dataIndex: 'statesname',
        //   render: text => <span title={text}>{text}</span>,
        // }, {
        //   title: <FormattedMessage id="global.org"/>,
        //   dataIndex: 'orgname',
        //   render: text => <span title={text}>{text}</span>,
      },
    ];
  };
  // 点击行
  onClickRow = (record) => {
    const { selectedRows } = this.state;
    // const { multiple = true, keyName } = selectConfig;
    // // const activeRowValue = record[keyName];
    // let newSelectedRows = [...selectedRows];
    //
    // let index = newSelectedRows.findIndex(item => item.account === record.account);
    // if (index !== -1) {
    //   newSelectedRows.splice(index, 1);
    // } else {
    //   newSelectedRows.push(record);
    // }
    this.setState({ selectedRows: [record] });
  };
  onSelectAll = (selected, selectedRow, changeRows) => {
    const { selectedRows } = this.state;
    let newSelectedRows = [...selectedRows];
    if (selected) { // 多选
      newSelectedRows = newSelectedRows.concat(changeRows);
    } else if (!selected) {
      changeRows.forEach(item => {
        let index = newSelectedRows.findIndex(items => items.account === item.account);
        if (index !== -1) {
          newSelectedRows.splice(index, 1);
        }
      });
    }
    this.setState({ selectedRows: newSelectedRows });
  };
  updateState = (obj = {}, callback) => {
    this.setState({ ...obj }, () => {
      callback && callback();
    });
  };
  // 发起邀请
  handleOk = () => {
    const { selectedRows } = this.state;
    const { invit, updateState } = this.props;
    const { dispatch, langLib } = this.context;
    if (!selectedRows.length) {
      CMessage(langLib['video.select.export'], 'warn');
      return;
    }
    updateState({ visible: false }, () => {
      invit(selectedRows);
    });
  };

  render() {
    const { visible, updateState, userList } = this.props;
    const { listData, loading, total, queryParams, selectedRows } = this.state;
    const renderTags = () => {
      return selectedRows.length ? <TagSet setWrapState={this.updateState}
                                           selectedRows={selectedRows}
      /> : null;
    };
    const { pageNum, pageSize } = queryParams;
    const modalSearchCls = classNames({
      [styles.modalSearch]: true,
      [styles.showInput]: true,
    });
    const tableStyle = classNames({
      [styles.tableUnNormal]: selectedRows.length,
      [styles.tableNormal]: !selectedRows.length,
    });
    // 标题
    const title = (
      <Fragment>
        {/*<FormattedMessage id="normalSearchSelect.title"/>*/}
        邀请其他成员
        <CSearch
          allowClear={false}
          className={modalSearchCls}
          onSearch={this.handleSearch}
          onChange={e => !e.target.value && this.setState({ headerKeywords: null })}
        />
      </Fragment>
    );
    const pagination = {
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
    };
    const selectedRowKeys = selectedRows.map(item => item.account);
    const rowSelection = {
      type: 'radio',
      selectedRowKeys,
      onSelectAll: (selected, selectedRows, changeRows) => {
        this.onSelectAll(selected, selectedRows, changeRows);
      },
      onSelect: (record, selected, selectedRows, nativeEvent) => {
        this.onClickRow(record);
      },
      onChange: (record, selected, selectedRows, nativeEvent) => {
        this.onClickRow(record);
      },
      getCheckboxProps: record => ({
        disabled: userList.find(item => record.account === item.userID) ? true : false,
      }),
    };
    return (
      <CreateModal
        visible={visible}
        title={title}
        wrapClassName={styles.modalWrap}
        footer={[
          <CButton key="back" onClick={() => updateState({ visible: false })}>
            <FormattedMessage id="global.cancel"/>
          </CButton>,
          <CButton key="submit" type="primary" onClick={() => this.handleOk()}>
            <FormattedMessage id="global.invitation"/>
          </CButton>,
        ]}
        closable={false}
        destroyOnClose={true}
        maskClosable={false}
        getContainer={() => document.getElementById('main-container')}
      >
        {renderTags()}
        <CTable
          className={tableStyle}
          pagination={pagination}
          columns={this.getColumns()}
          dataSource={listData}
          rowSelection={rowSelection}
          // onClickRow={this.onClickRow}
          loading={loading}
          rowKey={record => record.account}
        />
      </CreateModal>);
  }
}

export default ProficientList;
