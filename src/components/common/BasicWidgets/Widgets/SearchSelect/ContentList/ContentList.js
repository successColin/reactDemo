/*
 * @Author: Fus
 * @Date:   2019-08-06 10:32:06
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2019-09-24 17:31:49
 * @Desc: 列表内容
 *        已配类型：
 *          relateTable  关联表
 */
import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { CTable, CMessage } from '@/components/common/BasicWidgets';
import { BaseContext } from '@/constants/global';
import { getGlobalTables, getGlobalTableCols, getMenuList, getRelationTablbeDetial } from '@/services/global';
import { getBundleSelectFields } from '@/services/appLibrary';
import { getStateList } from '@/services/stateManager';
import { getTypeList } from '@/services/typeManager';
import { getPriorityList } from '@/services/priorityManager';
import { getCompanyList } from '@/services/licenseManager';
import { getWatermarkList, getCurrencyList } from '@/services/global';


const initQueryParams = {
  pageNum: 1,
  pageSize: 10,
};

class ContentList extends Component {
  static contextType = BaseContext;

  static getDerivedStateFromProps(props, state) {
    if (props.headerKeywords !== state.keyWords) {
      return {
        keyWords: props.headerKeywords,
        queryParams: {
          ...state.queryParams,
          pageNum: 1,
        },
      };
    }
    return null;
  }

  state = {
    listData: [], // 数据源
    total: 0,
    loading: false,
    queryParams: initQueryParams, // 获取列表的传参
    keyWords: null, // 搜索关键字
  };

  componentDidMount() {
    this.fetchData();
  }

  componentWillUnmount() {
    this.resetData();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.keyWords !== this.state.keyWords) {
      this.fetchData(true);
    }
  }

  // 重置数据
  resetData = () => {
    this.setState({ listData: [], total: 0, queryParams: initQueryParams, keyWords: null });
  };
  // 获取列表数据
  fetchData = () => {
    const api = this.getListApi();
    const { queryParams, keyWords } = this.state;
    const { otherQueryParams, selectConfig } = this.props;
    const { langLib } = this.context;
    const reqParams = {
      ...queryParams,
      ...otherQueryParams,
      [selectConfig.keyName]: keyWords || null,
    };
    this.setState({ loading: true });
    api(reqParams).then(res => {
      const { modalContentType } = this.props;
      const { list, total } = res;
      const { pageNum, pageSize } = queryParams;
      const getIndex = index => (pageNum - 1) * pageSize + index + 1;
      const noPages = ['relationColumnName', 'state', 'type', 'priority']; // 无分页的类型
      if (noPages.includes(modalContentType)) {
        const listData = res.map((item, index) => ({ ...item, index: index + 1 }));
        this.setState({ listData, loading: false });
      } else {
        if (modalContentType === 'company') {
          const listData = res.map((item, index) => ({ ...item, index: getIndex(index) }));
          this.setState({ listData, total, loading: false });
          return;
        } else if (modalContentType === 'fromApi') {
          let list = res.list || [];
          const listData = list.map((item, index) => ({ ...item, index: index + 1 }));
          this.setState({ listData, loading: false });
          return;
        }
        const listData = list.map((item, index) => ({ ...item, index: getIndex(index) }));
        this.setState({ listData, total, loading: false });
      }
      // bundle应用于日历选择字段时若没有数据表示未配过框架信息
      if (modalContentType === 'bundleSelectFields' && !total) {
        CMessage(langLib['message.noFrame'], 'error');
      }
    }, err => this.setState({ loading: false }));
  };
  // 获取列表数据的接口
  getListApi = () => {
    const { modalContentType } = this.props;
    switch (modalContentType) {
      case 'relateTable':
        return getGlobalTables; // 表名
      case 'tableColumn':
        return getGlobalTableCols; // 列名
      case 'bundleSelectField':
        return getBundleSelectFields; // 可选字段
      case 'relateMenu' : // 功能库
        return getMenuList;
      case 'relationColumnName':
        return getRelationTablbeDetial;
      case 'state':
        return getStateList; // 状态
      case 'type':
        return getTypeList; // 状态
      case 'priority':
        return getPriorityList; // 状态
      case 'company' :
        return getCompanyList; // 获取公司
      case 'waterMarkId':
        return getWatermarkList; // 获取水印模板
      case 'fromApi':
        return getCurrencyList; // 获取出参
      default:
        return getGlobalTables;
    }
  };
  // 获取列名
  getColumns = () => {
    const { modalContentType } = this.props;
    switch (modalContentType) {
      case 'relateTable':
        return this.getRelateTableCols();
      case 'tableColumn':
        return this.getTableColumnCols();
      case 'bundleSelectField':
        return this.getTableColumnCols();
      case 'relateMenu':
        return this.getMenuColum();
      case 'relationColumnName':
        return this.getTableColumnCols();
      case 'state':
        return this.getSTPCols();
      case 'type':
        return this.getSTPCols();
      case 'priority':
        return this.getSTPCols();
      case 'company':
        return this.getCompanyColumns();
      case 'waterMarkId':
        return this.getWaterMarkColumns();
      case 'fromApi':
        return this.getCurrencyColumns(); // 获取出参
      default:
        return [];
    }
  };
  // 状态、类型、优先级
  getSTPCols = () => {
    return [
      {
        title: <FormattedMessage id="menu.table.sno"/>,
        dataIndex: 'id',
        width: 100,
        render: (text, record, index) => {
          return <span>{index + 1}</span>;
        },
      }, {
        title: <FormattedMessage id="menu.table.name"/>,
        dataIndex: 'name',
        key: 'name',
        width: 100,
      },
    ];
  };
  getMenuColum = () => {
    const { langLib } = this.context;
    return [
      {
        title: <FormattedMessage id="menu.table.sno"/>,
        dataIndex: 'id',
        width: 100,
        render: (text, record, index) => {
          return <span>{index + 1}</span>;
        },
      },
      {
        title: <FormattedMessage id="menu.table.name"/>,
        dataIndex: 'name',
        key: 'name',
        width: 100,
      },
      {
        title: <FormattedMessage id="menu.table.url"/>,
        dataIndex: 'url',
        key: 'url',
        width: 100,
      },
      {
        title: <FormattedMessage id="menu.table.frametypeBasetype"/>,
        dataIndex: 'frameTypeName ',
        key: 'frameTypeName',
        width: 100,
        render: (text, record, index) => {
          return <span>{record.frameTypeName || ''}</span>;
        },
      },
      {
        title: 'icon',
        dataIndex: 'iconName',
        key: 'iconName',
        width: 100,
        render: (text, record, index) => {
          return <span className={`iconfont icon-${text}`}></span>;
        },
      },
      {
        title: <FormattedMessage id="menu.table.memo"/>,
        key: 'memo',
        dataIndex: 'memo',
        width: 150,
      },
    ];

  };
  // 获取关联表列名
  getRelateTableCols = () => {
    const { langLib } = this.context;
    return [{
      title: langLib['global.index'],
      key: 'index',
      dataIndex: 'index',
    }, {
      title: langLib['relateTable.col.name'],
      key: 'tableName',
      dataIndex: 'tableName',
    }, {
      title: langLib['global.momo'],
      key: 'memo',
      dataIndex: 'memo',
    }];
  };
  // 获取字段表列名
  getTableColumnCols = () => {
    const { langLib } = this.context;
    return [{
      title: langLib['global.index'],
      key: 'index',
      dataIndex: 'index',
    }, {
      title: langLib['tableColumn.col.name'],
      key: 'columnName',
      dataIndex: 'columnName',
    }, {
      title: langLib['global.memo'],
      key: 'displayColumn',
      dataIndex: 'displayColumn',
    }];
  };
  // 获取公司名称
  getCompanyColumns = () => {
    const { langLib } = this.context;
    return [{
      title: langLib['global.index'],
      key: 'index',
      dataIndex: 'index',
    }, {
      title: langLib['global.keycode'],
      key: 'keycode',
      dataIndex: 'keycode',
    }, {
      title: langLib['global.name'],
      key: 'name',
      dataIndex: 'name',
    }];
  };
  // 水印模板列表
  getWaterMarkColumns = () => {
    const { langLib } = this.context;
    return [{
      title: langLib['global.index'],
      key: 'index',
      dataIndex: 'index',
    }, {
      title: langLib['global.keycode'],
      key: 'keycode',
      dataIndex: 'keycode',
    }, {
      title: langLib['global.name'],
      key: 'name',
      dataIndex: 'name',
    }];
  };
  // 出参列表
  getCurrencyColumns = () => {
    const { langLib } = this.context;
    return [{
      title: langLib['global.index'],
      key: 'index',
      dataIndex: 'index',
    }, {
      title: langLib['global.keycode'],
      key: 'paramKey',
      dataIndex: 'paramKey',
    }, {
      title: langLib['global.name'],
      key: 'name',
      dataIndex: 'name',
    }];
  };
  // 点击行
  onClickRow = (record) => {
    const { selectConfig, selectedRows } = this.props;
    const { isMulti, keyName } = selectConfig;
    const activeRowValue = record[keyName];
    let newSelectedRows = [...selectedRows];
    if (isMulti) { // @TODO: 多选

    } else { // 单选
      newSelectedRows = [record];
    }
    this.props.setWrapState({ selectedRows: newSelectedRows });
  };

  render() {
    const { listData, loading, total, queryParams } = this.state;
    const { selectConfig, selectedRows, rowKey } = this.props;
    const { pageNum, pageSize } = queryParams;
    const { isMulti, keyName } = selectConfig;
    const selectedRowKeys = selectedRows.map(item => item[rowKey]);
    const rowSelection = {
      type: isMulti ? 'checkbox' : 'radio',
      selectedRowKeys,
      onSelectAll: (selected, selectedRows, changeRows) => {
        this.onSelectAll(selected, changeRows);
      },
      onSelect: (record, selected, selectedRows, nativeEvent) => {
        this.onClickRow(record);
      },
      onChange: (record, selected, selectedRows, nativeEvent) => {
        this.onClickRow(record);
      },
    };
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
    return (
      <CTable
        pagination={pagination}
        columns={this.getColumns()}
        dataSource={listData}
        rowSelection={rowSelection}
        onClickRow={this.onClickRow}
        loading={loading}
        rowKey={rowKey}
      />
    );
  }
}

export default ContentList;
