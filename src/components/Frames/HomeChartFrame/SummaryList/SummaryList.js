/*
 * @Author: Fus
 * @Date:   2020-03-02 09:22:58
 * @Desc: 汇总控件列表
 */
import { Component } from 'react';
import SummaryItem from './SummaryItem/SummaryItem';
import styles from './SummaryList.less';

class SummaryList extends Component {
  // 渲染汇总控件
  renderItems = () => {
    const { summaryEles = [] } = this.props;
    return summaryEles.filter(item => !!item.visiabled).map(item => {
      return (
        <SummaryItem
          {...this.props}
          eleObj={item}
          key={`summaryItem_${item.id}`}
        />
      );
    });
  };

  render() {
    return (
      <div className={styles.wrap}>
        {this.renderItems()}
      </div>
    );
  }
}

export default SummaryList;
