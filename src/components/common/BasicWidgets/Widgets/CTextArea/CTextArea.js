/*
 * @Author: Fus
 * @Date:   2019-06-29 14:56:52
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2020-02-07 13:53:38
 * @Desc: 基于antd的Input.TextArea封装
 */
import { Component } from 'react';
import { Input } from 'antd';
import classNames from 'classnames';
import styles from '../../index.less';

const { TextArea } = Input;

const initProps = {
  allowClear: true,
   autosize: { minRows: 4 },
};

class CTextArea extends Component {
  render() {
    const className = classNames({
      [styles.cTextArea]: true,
      [this.props.className]: true,
    });
    const props = {
      ...initProps,
      ...this.props,
      className,
    };
    return (
      <TextArea resize="vertical" {...props} />
    );
  }
}

export default CTextArea;
