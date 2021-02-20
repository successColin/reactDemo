/*
 * @Author: Shi
 * @Date:   2021-01-26
 * @Last Modified by: Fus
 * @Last Modified time: 2019-08-28 14:36:24
 * @Desc: 基于antd的checkbox封装
 */
import { Component } from 'react';
import { Checkbox } from 'antd';
import classNames from 'classnames';
import styles from './Checkbox.less';

const CheckboxGroup = Checkbox.Group;

const initProps = {
  // maxLength: 128,
};
class SCheckbox extends Component {
  render () {
    const className = classNames({
      [styles.SCheckbox]: true,
      [this.props.className]: true,
    });
    console.log(className)
    const { disabled } = this.props;
    const checkboxProps = {
      ...initProps,
      // allowClear: !!!disabled, // 禁止编辑时也不允许清除
      ...this.props,
      className,
    };
    return (
      <CheckboxGroup {...checkboxProps} />
    );
  }
}

export default SCheckbox;