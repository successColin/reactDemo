/*
 * @Author: Fus
 * @Date:   2019-09-04 11:29:26
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2019-10-09 10:52:20
 * @Desc: 头部修改显示状态容器，包括：
 *  1. 切换树、列表
 *  2. 显示格式（名称、类型、状态）
 */
import { Component, Fragment } from 'react';
import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';
import { Select } from 'antd';
import { CSelect } from '@/components/common/BasicWidgets';
import { TREE_FORMAT, TREE_TYPE } from '@/constants/busNormal';
import styles from './HeaderFilter.less';

const { Option } = Select;
// 树类型下拉项
const renderTypeOptions = Object.keys(TREE_TYPE).map(item => <Option key={`tree_type_${item}`} value={item}><FormattedMessage id={TREE_TYPE[item]} /></Option>);
// 展示状态下拉项
const renderFormatOptions = Object.keys(TREE_FORMAT).map(item => <Option key={`tree_format_${item}`} value={+item}><FormattedMessage id={TREE_FORMAT[item]} /></Option>);

class HeaderFilter extends Component {
  static defaultProps = {
    showType: '', // 显示类型
  }
  render() {
    const { showType, setWrapState } = this.props;
    const treeIcon = classNames({
      [styles.switchIcon]: true,
      'iconfont': true,
      'icon-switch-tree': true,
      'custom-color': showType === 'tree',
    });
    const listIcon = classNames({
      [styles.switchIcon]: true,
      'iconfont': true,
      'icon-switch-list': true,
      'custom-color': showType === 'list',
    });
    return (
      <div className={styles.wrap}>
        <span className={treeIcon} onClick={() => setWrapState({ showType: 'tree' })} />
        <span className={listIcon} onClick={() => setWrapState({ showType: 'list' })} />
        <div className={styles.switchFormat}>
          {showType === 'tree' && (
            <Fragment>
              {/* <label>
                <FormattedMessage id="normalSearchSelect.treeType" />
              </label>
              <CSelect className={styles.select} defaultValue="default">
                {renderTypeOptions}
              </CSelect> */}
              <label>
                <FormattedMessage id="normalSearchSelect.format" />
              </label>
              <CSelect className={styles.select} defaultValue={1} onChange={treeNodeType => setWrapState({ treeNodeType })}>
                {renderFormatOptions}
              </CSelect>
            </Fragment>
          )}
        </div>
      </div>
    );
  }
}
export default HeaderFilter;