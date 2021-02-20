/*
 * @Author: Fus
 * @Date:   2020-05-06 10:09:17
 * @Desc: 大屏看板图表控件
 */
import { Component } from 'react';
import TopLine from './TopLine/TopLine';
import SerieTable from './SerieTable/SerieTable';

class BoardChartConfig extends Component {
  // 更新sql表格
  setChartList = (newList) => {
    const { eleObj, setRowData, activeRowIndex } = this.props;
    setRowData({
      index: activeRowIndex,
      record: eleObj,
      key: 'chartList',
      value: newList,
    });
  }
  render() {
    const publicProps = {
      ...this.props,
      setChartList: this.setChartList,
    };
    return (
      <div>
        <TopLine {...publicProps} />
        <SerieTable {...publicProps} />
      </div>
    );
  }
}
export default BoardChartConfig;