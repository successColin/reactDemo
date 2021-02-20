/*
 * @Author: Fus
 * @Date:   2019-06-18 19:22:22
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2019-10-23 15:10:01
 * @Desc: 分割线组件，可带标题
 */
import { Icon } from 'antd';
import classNames from 'classnames';
import styles from './SplitLine.less';

const SplitLine = ({
  title = '',
}) => {
  const lineCls = classNames({
    [styles.line]: true,
    [styles.noTit]: !title,
  });
  return (
    <div className={styles.wrap}>
      <Icon type="caret-right" className="custom-color" />
      <span className={styles.title}>{title}</span>
      <div className={lineCls} />
    </div>
  );
};

export default SplitLine;