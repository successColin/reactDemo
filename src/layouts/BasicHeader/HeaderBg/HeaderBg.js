/*
 * @Author: Fus
 * @Date:   2019-06-18 09:45:41
 * @Last Modified by: Fus
 * @Last Modified time: 2019-06-29 15:49:59
 * @Desc: 头部的动态背景存放
 */
import { Icon } from 'antd';
import classNames from 'classnames';
import styles from './HeaderBg.less';

const HeaderBg = () => {
  const getIconCls = (iconType, index) => (classNames({
    'iconfont': true,
    [`icon-gear${iconType}`]: true,
    [styles.gear]: true,
    [styles[`gear${index}`]]: true,
  }));
  return (
    <div className={styles.wrap}>
      <span className={getIconCls(1, 1)} />
      <span className={getIconCls(2, 2)} />
      <span className={getIconCls(1, 3)} />
      <span className={getIconCls(3, 4)} />
      <span className={getIconCls(2, 5)} />
    </div>
  );
};

export default HeaderBg;