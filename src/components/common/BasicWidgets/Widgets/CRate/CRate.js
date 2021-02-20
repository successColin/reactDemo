/*
 * @Author: Fus
 * @Date:   2019-06-29 14:56:52
 * @Last Modified by: Fus
 * @Last Modified time: 2019-08-28 14:36:24
 * @Desc: 基于antd的Input封装
 */
import { Component } from 'react';
import { Rate } from 'antd';
import classNames from 'classnames';
import styles from '../../index.less';

const initProps = {
  count: 5,
};

class CRate extends Component {
  render() {
    const className = classNames({
      [this.props.className]: true,
    });
    const inputProps = {
      ...initProps,
      ...this.props,
      className,
    };
    return (
      <Rate {...inputProps} />
    );
  }
}

export default CRate;
