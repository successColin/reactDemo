/*
 * @Description: 
 * @Author: tjf
 * @Date: 2020-05-29 14:44:44
 * @LastEditTime: 2020-05-29 16:12:38
 * @LastEditors: tjf
 */
import { Component } from 'react';
import { BaseContext } from '@/constants/global';
import styles from './Crumb.less';

class Crumb extends Component {
  static contextType = BaseContext;
  getCrumbPath = () => {
    const { activeTreeNodeDetail = {}, treeData } = this.props.crumbProps;
    let activeName = activeTreeNodeDetail.id && activeTreeNodeDetail.name;
    const result = activeName ? [activeName] : [];
    let resu = activeName ? [activeName] : [];
    // 找到父节点名称
    const findPidName = (list, data) => {
      list.forEach(item => {
        if (item.nodeKey === data.pid) {
          result.unshift(item.name);
          if (item.rootId != 0) {
            findPidName(treeData, item);
          } else {
            return;
          }
        } else if (item.children) {
          findPidName(item.children, data);
        }
      });
    };
    findPidName(treeData, activeTreeNodeDetail);
    return result;
  }
  render () {
    const { langLib } = this.context;
    const crumbPath = this.getCrumbPath().join('>');
    const path = langLib['global.crumbPath'] + crumbPath;
    return (
      <div className={styles.wrap}>
        <span title={path}>
          {path}
        </span>
      </div>
    );
  }
}

export default Crumb;
