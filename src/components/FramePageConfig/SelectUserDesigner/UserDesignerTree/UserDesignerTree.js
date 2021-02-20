/*
 * @Author: Fus
 * @Date:   2019-08-12 08:44:25
 * @Last Modified by: Fus
 * @Last Modified time: 2019-08-26 16:31:06
 * @Desc: 用户设计组的树
 */
import { Component } from 'react';
import classNames from 'classnames';
import { CSearch } from '@/components/common/BasicWidgets';
import CreateTree from '@/components/common/CreateTree/CreateTree';
import styles from './UserDesignerTree.less';

class UserDesignerTree extends Component {
  render() {
    const { treeData, setSelectedState, loading, activeTreeNodeDetail } = this.props;
    const searchCls = classNames({
      [styles.search]: true,
      'light-circle-search': true,
    });
    return (
      <div className={styles.wrap}>
        <div className={styles.searchWrap}>
          <CSearch className={searchCls} />
        </div>
        <CreateTree
          dataType="userDesigner"
          treeStyle="dark"
          treeData={treeData}
          nodeConfig={{ notGroupIcon: true }}
          needGetDetail={false}
          loading={loading}
          updateFrameState={setSelectedState}
          activeTreeNodeDetail={activeTreeNodeDetail}
        />
      </div>
    );
  }
}
export default UserDesignerTree;