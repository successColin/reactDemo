/*
 * @Author: Fus
 * @Date:   2019-11-12 14:17:30
 * @Desc: 资源管理器主表格
 */
import { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { Pagination } from 'antd';
import classNames from 'classnames';
import { Tooltip } from 'antd';
import OutlookState from '../OutlookState/OutlookState';
import { CMessage } from '@/components/common/BasicWidgets';
import Gantt from '../Gantt/Gantt';
import styles from './MainTable.less';
import {
  formatTime,
} from '@/utils/common';
import DataElementList from '@/components/common/TabConfig/ElementList/TriggerConfig/EventElementList/DataElementList/DataElementList';
import { getPageSelectOptions } from '@/services/frame';
import { getValueFromGlobalVariables, matchGlobalVars, jsonParse, reduceDataToJsonString } from '@/utils/common';
import { BTN_ELEMENT_TYPE, FILTER_ELEMENT_TYPE, HIDE_IN_LIST_ELEMENT_TYPE } from '@/constants/element';
import moment from 'moment';

// const data = {
//   data: [
//     // { id: 1, text: 'Task #1', start_date: '15-04-2019', duration: 3, progress: 0.6 },
//     // { id: 2, text: 'Task #2', start_date: '18-04-2019', duration: 3, progress: 0.4 },
//     { id: 2, name: '', start_date: '11-04-2017 12:20:20', keycode: '81', end_date: '14-04-2017 12:20:10', stateid: 1 },
//     // { id: 3, name: 'Furniture installation', start_date: '2017-04-11', keycode: '81', duration: '8', progress: 0.6, owner_id: 2 },
//     // { id: 4, name: 'The employee relocation', start_date: '2017-04-13', keycode: '61', duration: '6', progress: 1, owner_id: 3 },
//     // { id: 12, name: 'Perform Initial testing', start_date: '2017-04-03', keycode: '51', duration: '5',  progress: 1, owner_id: 3 },
//     // { id: 13, name: 'Development', start_date: '2017-04-02', keycode: '7', duration: '7',  progress: 0.5, owner_id: 4 },
//     // { id: 14, name: 'Analysis', start_date: '2017-04-02', keycode: '6', duration: '6',  progress: 0.8, owner_id: 5 },
//     // { id: 15, name: 'Design', start_date: '2017-04-02', keycode: '5', duration: '5',  progress: 0.2, owner_id: 1 },
//     // { id: 16, name: 'Documentation creation', start_date: '2017-04-02', keycode: '7', duration: '7',  progress: 0, owner_id: 3 },
//   ],
// };

class OutlookFrame extends Component {
  static defaultProps = {
    loading: false,
  };
  state = {
    currentTabDropDownData: [],
  }
  componentDidMount() {
    this.fetchTabDropDownData();
  }
  // 状态更新
  updataState = (obj = {}, callback) => {
    this.setState({
      ...obj,
    }, () => {
      if (callback) {
        callback();
      }
    });
  };
  // 重置模糊查询的数据
  doRestSearchList = () => {
    this.updataState({ searchList: [] });
  };
  // 过滤条件
  getSeniorFilter = (stateId) => {
    const { elementList } = this.props;
    let data = {};
    elementList.forEach(item => {
      const { relationColumnName, basetype, relationColumnType } = item;
      if (relationColumnName === 'stateid') {
        data[relationColumnName] = {
          static_type: 2,
          static_value: stateId,
          static_connector: 8,
        };
      }
    });
    return data;
  }
  // 获取面板下的下拉数据
  fetchTabDropDownData = () => {
    const { tabInfo, elementMap, filterMap, fetchListData, setContainerState, listQueryParams } = this.props;
    const { userInfo } = this.props;
    const relationTableId = tabInfo.id;
    const elementList = elementMap[relationTableId] || [];
    // 下拉框控件列表
    const dropDownList = elementList.filter(item => FILTER_ELEMENT_TYPE.includes(item.basetype) && !!item.mainTableName).map(item => ({
      dataSource: item.mainTableName,
      elementId: item.id,
      baseType: item.basetype,
    }));
    if (!dropDownList.length) return;
    // 从实体过滤器过滤出含有下拉控件的过滤器
    let dropFilterMap = {};
    Object.keys(filterMap).forEach(item => {
      if (dropDownList.find(items => Number(items.elementId) === Number(item))) {
        dropFilterMap[item] = filterMap[item];
      }
    });
    const globalMap = {};
    // eslint-disable-next-line array-callback-return
    filterMap && Object.keys(dropFilterMap).map(key => {
      dropFilterMap[key].forEach(item => {
        const { asqlValue, asqlValueType } = item;
        if (asqlValueType === 2) {
          globalMap[item.asqlValue] = getValueFromGlobalVariables({
            globalVar: asqlValue,
            userInfo,
            globalMapType: 'globalMapType',
          });
        }
      });
    });
    getPageSelectOptions({ dropDownList, globalMap }).then(currentTabDropDownData => {
      let stateDate = [], stateId = [];
      if (JSON.stringify(currentTabDropDownData) !== '[]') {
        for (let key in currentTabDropDownData) {
          stateDate = currentTabDropDownData[key];
        }
      }
      stateDate.forEach(item => {
        stateId.push(item.id);
      });
      stateId = stateId.join(',');
      let seniorFilter = this.getSeniorFilter(stateId);
      JSON.stringify(seniorFilter) !== '{}' && (
        setContainerState({
          seniorFilter: seniorFilter,
        })
      );
      this.setState({
        currentTabDropDownData,
      });
    });
  };
  // 获取按钮功能分类
  getSqlEditorColumnsAndBtn = (sqlElementList) => {
    const sqlColumns = [], addBtn = [], state = [];
    sqlElementList.forEach(eleObj => {
      const { basetype } = eleObj;
      if (basetype === 1 || basetype === 3) sqlColumns.push(eleObj); // 列表数据
      basetype === 49 && addBtn.push(eleObj); // 展望生成
      basetype === 20 && state.push(eleObj); // 展望状态
    });
    return {
      sqlColumns,
      addBtn,
      state,
    };
  };
  // 切页
  changePage = (page, pageSize) => {
    const { setContainerState, listQueryParams, fetchListData } = this.props;
    const { searchList } = this.state;
    setContainerState({
      listQueryParams: {
        ...listQueryParams,
        pageNum: page,
        pageSize,
      },
      listSelectedRows: [],
    }, () => {
      fetchListData({ searchQueryList: searchList });
    });
  };
  showSizeChange = (current, pageSize) => {
    const { setContainerState, listQueryParams, fetchListData } = this.props;
    const { searchList } = this.state;
    setContainerState({
      listQueryParams: {
        ...listQueryParams,
        pageNum: 1,
        pageSize,
      },
      listSelectedRows: [],
    }, () => {
      fetchListData({ searchQueryList: searchList });
    });
  };
  render() {
    const { loading, mainListData = {}, elementMap = {}, tabInfo = {}, setContainerState, fetchListData, filterMap, allFooterBtnProps, listDataObj, prevEleObj, listDataArr, listQueryParams, setPopupTabInfo, setSelected, listSelectedRows, seniorFilter, stateEndTime } = this.props;
    const { currentTabDropDownData, searchList } = this.state;
    const { total, datalist } = listDataArr;
    const elementList = elementMap[tabInfo.id] || [];
    const sqlElementList = elementList.filter(item => item.visiabled);
    const columns = elementList.filter(item => !HIDE_IN_LIST_ELEMENT_TYPE.includes(item.basetype));
    const { sqlColumns, addBtn, state } = this.getSqlEditorColumnsAndBtn(sqlElementList);
    const { pageSize, pageNum } = listQueryParams;
    const btnType = {
      addBtn, // 生成按钮
      state, // 下拉框状态
    };
    const outlookHeader = {
      ...btnType,
      allFooterBtnProps,
      fetchListData,
      listQueryParams,
      currentTabDropDownData,
      tabInfo,
      seniorFilter,
      elementList,
      setContainerState,
      stateEndTime,
      sqlElementList,
      updataState: this.updataState,
      searchQueryList: searchList,
      doRestSearchList: this.doRestSearchList,
    };
    let data = {}, listArr = [];
    JSON.stringify(listDataArr) !== '[]' && JSON.stringify(datalist) !== '[]' && datalist.forEach(item => {
      let ganttData = {};
      elementList.forEach(val => {
        let itemObj = item[val.id];
        if (val.relationColumnName) {
          ganttData[val.id] = itemObj && JSON.parse(itemObj).name;
          ganttData[val.relationColumnName] = itemObj && JSON.parse(itemObj).name;
          ganttData['get_id_' + val.relationColumnName] = itemObj && JSON.parse(itemObj).id;
          if (val.relationColumnName === 'plannedenddate') ganttData['end_date'] = itemObj &&
            JSON.parse(itemObj).name &&
            formatTime(JSON.parse(itemObj).name, 3) || '';
          if (val.relationColumnName === 'plannedstartdate') ganttData['start_date'] = itemObj &&
            JSON.parse(itemObj).name &&
            formatTime(JSON.parse(itemObj).name, 3) || '';
          if (val.relationColumnName === 'stateid') {
            if (JSON.parse(itemObj).color) {
              ganttData['color'] = itemObj && JSON.parse(itemObj).color;
            }
          };
          ganttData['isCheckout'] = false;
        }
      });
      listArr.push(ganttData);
    });
    data.data = listArr;
    return (
      <div className={styles.wrap}>
        <OutlookState
          {...outlookHeader}
        />
        <Gantt
          columns={columns}
          tasks={data}
          currentTabDropDownData={currentTabDropDownData}
          state={state}
          tabInfo={tabInfo}
          setPopupTabInfo={setPopupTabInfo}
          elementList={elementList}
          fetchListData={fetchListData}
          setSelected={setSelected}
          listSelectedRows={listSelectedRows}
          setContainerState={setContainerState}
          listDataArr={listDataArr}
          oldDatalist={datalist}
        />
        <Pagination
          className={styles.page}
          pageSize={pageSize}
          current={pageNum}
          onChange={this.changePage}
          showSizeChanger
          defaultCurrent={pageNum}
          showQuickJumper={true}
          total={total}
          pageSizeOptions={['10', '20', '50', '100', '200', '500', '1000']}
          showTotal={(total, range) => {
            return (
              <div><FormattedMessage id="global.total"/>{total}</div>
            );
          }}
          onShowSizeChange={this.showSizeChange}
        />
      </div>
    );
  }
}

export default OutlookFrame;