/*
 * @Author: Fus
 * @Date:   2019-08-09 16:04:04
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2019-09-11 14:02:08
 * @Desc: 加载中状态
 */
import { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';
import { Spin } from 'antd';
import styles from './CSpin.less';

const initProps = {
  tip: <FormattedMessage id="global.loading" />,
  // showtip: true, // 是否显示提示内容
};
class CSpin extends Component {
  render() {
    const { showtip, tip = true } = this.props;
    const className = classNames({
      [styles.wrap]: true,
      [this.props.className]: true,
    });
    const props = {
      ...initProps,
      ...this.props,
      tip: showtip ? tip : null,
      className,
    };
    return (
      <Spin {...props}>
        {this.props.children}
      </Spin>
    );
  }
}
export default CSpin;