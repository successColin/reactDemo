/*
 * @Author: Fus
 * @Date:   2019-06-18 15:39:00
 * @Last Modified by: Fus
 * @Last Modified time: 2019-06-18 15:50:57
 * @Desc: tab列表及面包屑
 */
import TabContainer from './TabContainer/TabContainer';
import Crumb from './Crumb/Crumb';
import styles from './Container.less';

const Container = () => {
  return (
    <div className={styles.wrap}>
      <Crumb />
      <TabContainer />
    </div>
  );
};

export default Container;
