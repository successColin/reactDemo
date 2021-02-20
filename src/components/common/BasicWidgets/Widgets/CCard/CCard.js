/*
 * @Author: Fus
 * @Date:   2019-08-15 09:44:47
 * @Last Modified by: Fus
 * @Last Modified time: 2019-08-15 15:00:26
 * @Desc: 卡片
 */
import { Component } from 'react';
import { Card } from 'antd';
import classNames from 'classnames';
import styles from '../../index.less';

const initProps = {
  size: 'small',
};
class CCard extends Component {
  render() {
    const className = classNames({
      [styles.ccard]: true,
      [this.props.className]: true,
    });
    const props = {
      ...initProps,
      ...this.props,
      className,
    };
    return (
      <Card {...props}>
        {this.props.children}
      </Card>
    );
  }
}
export default CCard;