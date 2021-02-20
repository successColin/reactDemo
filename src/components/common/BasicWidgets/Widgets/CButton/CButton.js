/*
 * @Author: Fus
 * @Date:   2019-08-10 14:42:49
 * @Last Modified by: Fus
 * @Last Modified time: 2019-08-13 10:02:04
 * @Desc: 按钮 基于antd的Button
 */
import { Component } from 'react';
import { Button } from 'antd';
import classNames from 'classnames';
import styles from '../../index.less';

const initProps = {
  type: 'default', // 按钮类型 default-默认 primary-主要的 dark-灰色
};
class CButton extends Component {
  static defaultProps = {
    ...initProps,
  }
  render() {
    const { type } = this.props;
    const className = classNames({
      [styles.cButton]: true,
      [styles[`btn-${type}`]]: true,
      [this.props.className]: !!this.props.className,
    });
    const inputProps = {
      ...initProps,
      ...this.props,
      className,
    };
    return (
      <Button {...inputProps} />
    );
  }
}

export default CButton;

