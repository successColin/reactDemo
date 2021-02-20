/*
 * @Author: tjf
 * @Date:   2020-05-06 09:22:58
 * @Desc: 汇总控件列表
 */
import { Component } from 'react';
import { getListData } from '@/services/board';
import { CTable } from '@/components/common/BasicWidgets';
import { parseDecimal } from '@/utils/common';
import styles from './WorkList.less';
class WorkList extends Component {
  state = {
    elementMap: {}, // 控件map
    tabId: null, // 面板id
    listRowData: {}, // 上一个面板的行数据(最后在props中取值)
    formData: {}, // 表单数据
    originFormData: {}, // 原始表单数据（避免触发器影响显示初始状态）
    listDataObj: {}, // 列表数据
    listSelectedRows: [], // 列表选择的行数据
    tabDropDownData: {}, // 当前面板下的下拉数据(内容以{表名: [下拉数据]})形式）
    visiblePopup: false, // 弹出面板的显示状态
    triggerPopupEle: {}, // 触发弹出面板的控件信息
    popupTabInfo: {}, // 弹出面板信息
    popupHasFetched: false,
    relationFileObj: {}, // 文件关联信息
    calendarList: [], // 便捷搜索条件
    handleSetCustomSelectList: null, // 自定义选择框弹出列表中选中行后点击确定
    loadingStatus: {
      data: false, // 获取数据
      mainList: false, // 主列表
    },
    mainListData: [], // 主面板列表数据
    mainListRowData: {}, // 主列表行数据
    currentList: [],
    loading: false,
    data: {},
    pageNum: 1,
    pageSize: 15,
    fullPageSize: 10,
  };

  componentDidMount() {
    //  获取中间列表的高度，
    const height = document.getElementById('workList').offsetHeight;
    const pageSize = parseInt(height / 35) - 1;
    this.setState({
      pageSize: pageSize,
    });
    setTimeout(() => {
      this.props.fromType === 'normal' && this.fetchListData();
    }, 10);
    this.interve = setInterval(() => {
      let { pageNum } = this.state;
      this.setState({
        pageNum: pageNum+=1,
      },()=>{this.fetchListData()});
    }, 60000);
  }
  componentWillUnmount() {
    this.interve && clearInterval(this.interve);
  }

  relizeFullScreen = () => {
    clearInterval(this.interve);
    setTimeout(() => {
      let { pageNum } = this.state;
      const height = document.getElementById('workList').offsetHeight;
      const PageSize = parseInt(height / 35) - 1;
      this.setState({
        fullPageSize: PageSize,
        pageNum: pageNum === 1 ? pageNum : pageNum - 1,
      });

      this.props.fromType === 'normal' && this.fetchListData();
    });

    this.interve = setInterval(() => {
      let { pageNum } = this.state;
      this.setState({
        pageNum: pageNum+=1,
      },()=>{this.fetchListData()});
    }, 60000);
  }
	/**
	 * 获取列表数据
	 * @param {array} searchQueryList 便捷搜索条件
	 * @param {object} targetTabInfo  目标面板信息（如，数据选择框的弹出列表面板、常规列表面板）
	 */
  fetchListData = () => {
    const { elementList, tabId, tabSource, globalMap, globalQueryMap, boardIsFullScreen } = this.props;
    const { pageNum, pageSize, fullPageSize } = this.state;
    const params = {
      elementList,
      tabId,
      tabSource,
      pageNum,
      pageSize: boardIsFullScreen ? fullPageSize : pageSize,
      globalMap,
      globalQueryMap,
    };
    if (!elementList.length) return;
    // this.setLoadingStatus('data', true);
    getListData(params).then(res => {
      let num = res.pageNum;
      if (num * res.pageSize >= res.total) {
        num = 0;
      }
      this.setState({
        currentList: res.datalist,
        data: res,
        pageNum: num,
      });
    });
  };


  // 生成表头
  getTableColumns = () => {
    const { elementList } = this.props;
    const elements = elementList.filter(item => item.visiabled === 1) || [];
    return elements.map((item, index) => {
      return {
        title: item.displayName,
        dataIndex: `a${item.elementId}`,
        key: `a${item.elementId}`,
        render: (text, record) => {
          const { elementId } = item;
          const content = record[`a${elementId}`] && record[`a${elementId}`].indexOf('1970-01-01') > -1 ? '' : (parseDecimal(record[`a${elementId}`]) || '');
          let style = {};
          if (JSON.parse(record[elementId]).color) {
            style = { 'background': JSON.parse(record[elementId]).color, 'width': 'auto' };
          }
          return <div style={style} title={content}>{content}</div>;
        },
      };
    });
  };
  // 数据处理
  dataProcessing = (arr = []) => {
    let { elementList } = this.props;
    let { pageNum, pageSize } = this.state.data;
    let newDataSource = [];
    arr.forEach((item, index) => {
      let data = {};
      for (let key in item) {
        if (Number(key).toString() !== 'NaN') {
          // item[obj.relationColumnName] = JSON.parse(item[key]).name;
          data.zindex = (pageNum - 1) * pageSize + index;
          data[`a${key}`] = JSON.parse(item[key]).name;
        } else {
          let obj = elementList.find((value) => {
            return value.relationColumnName === key;
          });
          data.zindex = (pageNum - 1) * pageSize + index;
          if (obj) {
            data[`a${obj.id}`] = JSON.parse(item[key]).name;
          }
        }
        if (key === 'id') {
          data.id = JSON.parse(item[key]).name;
        }
      }
      data = {
        ...item,
        ...data,
      };
      newDataSource.push(data);
    });
    return newDataSource;
  };

  render() {
    let columns = this.getTableColumns();
    const { currentList, loading } = this.state;
    let dataSource = this.dataProcessing(currentList) || [];
    return (
      <div className={styles.wrap}>
        <div id="workList" className={styles.workList}>
          <CTable
            columns={columns}
            loading={loading}
            pagination={false}
            dataSource={dataSource}
            rowKey={record => record.zindex}
          />
        </div>
      </div>
    );
  }
}
export default WorkList;
