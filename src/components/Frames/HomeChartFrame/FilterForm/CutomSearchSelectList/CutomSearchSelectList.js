/*
 * @Author: Fus
 * @Date:   2020-02-26 10:40:09
 * @Desc: 数据选择框自定义弹出列表
 */

import React, { Component } from 'react';
import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';
import { CTable, CButton } from '@/components/common/BasicWidgets';
import { LIST_COLUMN_IGNORE_TYPE } from '@/constants/element';
import { getTreeFrameListData } from '@/services/frame';
import { jsonParse, isGlobalOrCustomVar, matchGlobalVars, parseListData } from '@/utils/common';
import CreateModal from '@/components/common/CreateModal/CreateModal';
import { getNormalSearchDetail } from '@/services/frame';
import SearchQuery from '@/components/Frames/TreeFrame/ContentContainer/SearchQuery/SearchQuery';
import styles from '@/components/Frames/TreeFrame/ContentContainer/DetailList/DetailList.less';
let tableWidth = 0;

class CutomSearchSelectList extends Component {
  constructor(props) {
    super(props);
    this.tabWrapRef = React.createRef();
  }
  state = {
    listDataObj: {}, // 获取列表数据接口返回对象
    selectedRow: {}, // 选中的数据行
    loadingSave: false, // 保存状态
    loadingStatus: {
      save: false, // 保存
      data: false, // 获取数据
    },
    listQueryParams: {
      pageNum: 1,
      pageSize: 10,
    },
  }
  componentDidMount() {
    tableWidth = this.tabWrapRef.current.clientWidth;
    this.fetchListData({});
  }
  // 获取列表数据
  fetchListData = ({ searchQueryList = [] }) => {
    const { tabInfo, tabList, elementMap, getGlobalVarValue, advancedQueryMap, userInfo, fromType, prevTabData, prevTabInfo } = this.props;
    const { listQueryParams } = this.state;
    const { pageNum, pageSize } = listQueryParams;
    const { id: tabId, relationTableName: tabSource, showType, relationColumn } = tabInfo;
    const tabEleList = elementMap[tabInfo.id] || [];
    const elementList = tabEleList.map(item => {
      const { relationColumnName: name, basetype: baseType, mainColumnName, mainTableName, elementMultiRelation, id: elementId, relationColumnType, elementFormat } = item;
      return {
        elementId, name, baseType, mainColumnName, mainTableName, elementMultiRelation, relationColumnType,
        elementFormat,
      };
    });
    // let seniorFilterMap = {};
    // // 关联面板且有关联字段时传入
    // if (showType === 4 && relationColumn) {
    //   const treeNodeId = treeNodeData.id;
    //   seniorFilterMap = {
    //     [relationColumn]: {
    //       static_connector: 3,
    //       static_type: 2,
    //       static_value: treeNodeId,
    //     },
    //   };
    // }
    const queryList = advancedQueryMap[tabId] || [];
    const globalMap = {};
    const globalQueryMap = {};
    // 将过滤条件中的全局变量赋值
    queryList.forEach(item => {
      const { asqlValueType, asqlValue, queryType, basetype, apiSql } = item;
      // 面板过滤条件为组合条件方式
      if (queryType === 1 && basetype === 1) {
        // 值类型为【变量】时，需要将变量对应的值传给后台
        if (asqlValueType === 2 || isGlobalOrCustomVar(asqlValue)) {
          globalMap[item.asqlValue] = getGlobalVarValue({ varName: asqlValue });
        }
      } else if (queryType === 2 && basetype === 2) { // SQL过滤条件方式
        const varArr = matchGlobalVars(apiSql);
        varArr.forEach(varName => {
          globalQueryMap[varName] = getGlobalVarValue({ varName, globalMapType: 'globalQueryMap' });
        });
      }
    });
    const params = {
      elementList,
      tabId,
      tabSource,
      pageNum,
      pageSize,
      calendarList: searchQueryList,
      globalMap,
      globalQueryMap,
      // seniorFilterMap,
    };
    if (!elementList.length) return;
    this.setLoadingStatus('data', true);
    getTreeFrameListData(params).then(res => {
      const listDataObj = parseListData({
        elementList: elementMap[tabId],
        listDataObj: res,
      });
      this.setState({
        listDataObj,
        calendarList: searchQueryList,
      });
      this.setLoadingStatus('data', false);
    }, err => this.setLoadingStatus('data', false));
  }

  // 保存选择框弹出列表选中数据
  handleSave = () => {
    const { listSelectedRows, handleCancel, tabInfo, elementMap, prevTabInfo, setPrevContainerState, handleSetPrevCustomSelectList, prevEleObj } = this.props;
    if (!listSelectedRows.length) {
      handleCancel && handleCancel(true);
      return;
    }
    const idObj = listSelectedRows[0].id;
    if (!idObj) return;
    this.setLoadingStatus('save', true);
    getNormalSearchDetail({
      tabSource: tabInfo.relationTableName,
      id: idObj.id,
    }).then(res => {
      handleSetPrevCustomSelectList && handleSetPrevCustomSelectList([res]);
      handleCancel && handleCancel(false);
      this.setLoadingStatus('save', false);
    }, err => this.setLoadingStatus('save', false));
  }
  // 点击行
  onClickRow = (selectedRow) => {
    this.setState({ selectedRow });
  };
  // 获取列名
  getColumns = () => {
    const { elementMap, tabInfo, getGlobalVarValue } = this.props;
    const elementList = elementMap[tabInfo.id] || [];
    const filteredElementList = elementList.filter(item => !LIST_COLUMN_IGNORE_TYPE.includes(item.basetype) && item.visiabled);
    let widthTotal = 60; // 选择列的宽度
    const columns = filteredElementList.map((eleObj, index) => {
      const { id, displayName, columnSpan } = eleObj;
      // 默认取15%
      let colWidth = columnSpan <= 100 ? 115 : columnSpan;
      const width = Math.ceil(tableWidth * (colWidth % 100 / 100));
      // const width = (columnSpan > 100 && index !== filteredElementList.length - 1) ? `${columnSpan % 100}%` : '';
      widthTotal += width;
      return {
        title: displayName,
        dataIndex: id,
        width,
        render: (text = {}, record) => {
          const { relationTabId, defaultValue } = eleObj;
          const content = text.name || getGlobalVarValue({
            varName: defaultValue,
            type: 'defaultValue',
            eleObj,
            listActiveRowData: record,
          });
          const renderContent = <span title={content}>{content}</span>;
          // 有关联弹出面板的控件
          if (relationTabId) {
            return (
              <a onClick={() => this.props.setPopupTabInfo({ eleObj, listRowData: record })}>
                {renderContent}
              </a>
            );
          }
          return renderContent;
        },
      };
    });
    return { columns, widthTotal };
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
  setCustomListState = (itemObj, callback) => {
    this.setState(itemObj, () => callback && callback());
  }
  render() {
    const { fromType, elementMap, tabInfo, value, fetchListData, listSelectedRows, BtnLine, setContainerState, setSelected } = this.props;
    const { selectedRow, listDataObj, listQueryParams, loadingStatus } = this.state;
    const selectedRowKey = selectedRow.id || value;
    const { datalist = [], total = 0 } = listDataObj;
    const { pageNum, pageSize } = listQueryParams;
    const elementList = elementMap[tabInfo.id] || [];
    const rowSelection = {
      type: 'radio',
      selectedRowKeys: [selectedRowKey],
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
          selectedRow: {},
          listQueryParams: {
            pageNum,
            pageSize: newPageSize,
          },
        }, () => this.fetchListData({}));
      },
    };
    const quickQueryLen = elementList.filter(item => item.quickQuery).length;
    const searchBox = elementList.find((item) => item.basetype === 14) || {};
    const hasSearchQuery = quickQueryLen && searchBox && searchBox.visiabled;
    const tableCls = classNames({
      [styles.table]: true,
      [styles.customList]: true,
      [styles.hasSearchQuery]: hasSearchQuery,
      [styles.searchSelectList]: tabInfo.basetype === 7,
    });
    const headerCls = classNames({
      [styles.headerWrap]: true,
      [styles.hasSearchQuery]: !!hasSearchQuery,
    });
    const { columns, widthTotal } = this.getColumns();
    return (
      <div className={styles.wrap} ref={this.tabWrapRef} style={{ paddingTop: 8 }}>
        <div className={headerCls}>
          {BtnLine && BtnLine}
          {hasSearchQuery ? <div className={styles.queryLine}>
            <SearchQuery
              elementList={elementList}
              fetchListData={this.fetchListData}
              setContainerState={this.setCustomListState}
            />
          </div> : null}
        </div>
        <CTable
          className={tableCls}
          columns={columns}
          dataSource={datalist}
          rowSelection={rowSelection}
          pagination={pagination}
          onClickRow={this.onClickRow}
          loading={loadingStatus.data}
          scroll={{ x: widthTotal, y: 100 }}
          rowKey="id"
        />
        {/* <div className={styles.selectListBtnWrap}>
          <CButton
            className={styles.cancelBtn}
            onClick={this.props.onCancel}
          >
            <FormattedMessage id="global.cancel" />
          </CButton>
          <CButton
            type="primary"
            onClick={this.handleSave}
            loading={loadingStatus.save}
          >
            <FormattedMessage id="global.ok" />
          </CButton>
        </div> */}
      </div>
    );
  }
}
export default CutomSearchSelectList;
