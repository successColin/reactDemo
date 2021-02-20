/*
 * @Author: Fus
 * @Date:   2019-11-12 14:10:33
 * @Desc: 底部图例
 */
import { Component } from 'react';
import classNames from 'classnames';
import styles from './LegendFooter.less';

class LegendFooter extends Component {
  static defaultProps = {
    elementList: [], // 控件列表
  }
  state = {
    visible: true,
  }
  renderLengendList = () => {
    const { elementList = [], totalObj } = this.props;
    return elementList.map(ele => {
      const { colorCode, displayName, id } = ele;
      const iconCls = classNames({
        'iconfont': true,
        'iconWater': true,
      });
      return (
        <li key={ele.id}>
          <i className={iconCls} style={{ color: colorCode }} />
          <span>{displayName}</span>
          （{totalObj[id] || 0}）
        </li>
      );
    });
  }
  render() {
    const { visible } = this.state;
    const wrapCls = classNames({
      [styles.wrap]: true,
      [styles.hide]: !visible,
    });
    const triggerIconCls = classNames({
      [styles.triggerIcon]: true,
      [styles.up]: true,
      'iconfont': true,
      'icon-zoom': visible,
      'icon-expand': false,
    });
    return (
      <div className={wrapCls}>
        <div className={styles.trigger}>
          {/*<i className={triggerIconCls} onClick={() => this.setState({ visible: !visible })} />*/}
          <i className={triggerIconCls} />
        </div>
        <div className={styles.legendWrap}>
          <ul>
            {this.renderLengendList()}
          </ul>
        </div>
      </div>
    );
  }
}
export default LegendFooter;
