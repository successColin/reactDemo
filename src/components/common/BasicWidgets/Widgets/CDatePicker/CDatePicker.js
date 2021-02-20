/*
 * @Author: Fus
 * @Date:   2019-08-30 15:48:23
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2019-10-17 16:10:54
 * @Desc: 日期选择器
 */
import { Component } from 'react';
import { DatePicker } from 'antd';
// import { DEFAULT_TIME_FORMATE } from '@/constants/element';

const initProps = {
  // format: DEFAULT_TIME_FORMATE,
  showTime: true,
  showToday: true,
};

class CDatePicker extends Component {
  render() {
    const props = {
      ...initProps,
      ...this.props,
    };
    return (
      <DatePicker {...props} />
    );
  }
}
export default CDatePicker;