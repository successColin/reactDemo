/*
 * @Author: Fus
 * @Date:   2019-08-14 10:02:20
 * @Last Modified by: Fus
 * @Last Modified time: 2019-08-14 10:02:20
 * @Desc: 数字输入框
 */
import { Component } from 'react';
import { InputNumber } from 'antd';
import classNames from 'classnames';
import styles from '../../index.less';

const initProps = {
};
class CInputNumber extends Component {
  render() {
    const className = classNames({
      [styles.cInputNumber]: true,
      [this.props.className]: true,
    });
    const { disabled } = this.props;
    const inputProps = {
      ...initProps,
      ...this.props,
      className,
    };
    return (
      <InputNumber {...inputProps} />
    );
  }
}

export default CInputNumber;