/*
 * @Author: Fus
 * @Date:   2019-12-23 09:49:23
 * @Desc: 自定义label框
 */
import { Component } from 'react';
import { Input } from 'antd';
import classNames from 'classnames';
import styles from './CLabel.less';

class CLabel extends Component {
  static defaultProps = {
    onClick: null, // click事件
    disabled: false, // 不可编辑
    placeholder: '', // 提示文字
  };
  triggerChange = changedValue => {
    const { onChange } = this.props;
    if (onChange) {
      onChange(changedValue);
    }
  };

  render() {
    const { value, onClick, disabled, placeholder, relationTabId } = this.props;
    const className = classNames({
      [styles.normal]: !!relationTabId,
      [styles.pointer]: !!relationTabId,
      [this.props.className]: true,
    });
    return (
      <div onClick={() => onClick && onClick()}>
        <Input
          className={className}
          onChange={e => this.triggerChange(e.target.value)}
          value={value}
          disabled={disabled}
          placeholder={placeholder}
        />
      </div>
    );
  }
}

export default CLabel;
