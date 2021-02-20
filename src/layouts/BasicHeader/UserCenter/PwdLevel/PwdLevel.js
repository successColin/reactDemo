/*
 * @Author: Fus
 * @Date:   2019-09-23 14:50:01
 * @Desc: 密码强度
 */
import styles from './PwdLevel.less';

const PwdLevel = ({ level = 1 }) => (
  <div className={`${styles.wrap} ${styles[`level_${level}`]}`}>
    <div className={`${styles.item} ${styles.start}`}></div>
    <div className={`${styles.item} ${styles.mid}`}></div>
    <div className={`${styles.item} ${styles.end}`}></div>
  </div>
);
export default PwdLevel;