/*
 * @Author: Fus
 * @Date:   2019-06-29 14:56:52
 * @Last Modified by: Fus
 * @Last Modified time: 2019-08-28 14:36:24
 * @Desc: 基于antd的Input封装
 */
import { Component } from 'react';
import { Input } from 'antd';
import classNames from 'classnames';
import styles from '../../index.less';

const initProps = {
  // maxLength: 128,
};
class CInput extends Component {
  render() {
    const className = classNames({
      [styles.cInput]: true,
      [this.props.className]: true,
    });
    const { disabled } = this.props;
    const inputProps = {
      ...initProps,
      // allowClear: !!!disabled, // 禁止编辑时也不允许清除
      ...this.props,
      className,
    };
    return (
      <Input {...inputProps} />
    );
  }
}

export default CInput;