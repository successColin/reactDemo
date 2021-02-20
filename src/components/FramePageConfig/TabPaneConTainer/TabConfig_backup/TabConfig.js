/*
 * @Author: Fus
 * @Date:   2019-08-14 09:45:45
 * @Last Modified by: Fus
 * @Last Modified time: 2019-08-24 14:44:32
 * @Desc: 面板配置（与预设面板中类似）
 */
import { Component } from 'react';
import HeaderForm from './HeaderForm/HeaderForm';
import ListTable from '@/components/PageConfig/ListTable/ListTable';
import styles from './TabConfig.less';

class TabConfig extends Component {
  render() {
    const { listConfig = {}, ...rest } = this.props;
    return (
      <div className={styles.wrap}>
        <HeaderForm {...rest} />
        <div className={styles.listWrap}>
          <ListTable {...listConfig} />
        </div>
      </div>
    );
  }
}
export default TabConfig;