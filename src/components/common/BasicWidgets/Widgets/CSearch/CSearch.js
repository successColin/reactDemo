/*
 * @Author: Fus
 * @Date:   2019-06-29 14:56:52
 * @Last Modified by: Fus
 * @Last Modified time: 2019-08-19 18:26:24
 * @Desc: 基于antd的Input.Search封装
 */
import { Input } from 'antd';
import classNames from 'classnames';
import styles from '../../index.less';

const { Search } = Input;

const initProps = {
  allowClear: false,
};
const geProps = (props) => {
  const className = classNames({
    [styles.cSearch]: true,
    [props.className]: true,
  });
  return {
    ...initProps,
    ...props,
    className,
  };
};
const CSearch = (props) => <Search {...geProps(props)} />;
export default CSearch;