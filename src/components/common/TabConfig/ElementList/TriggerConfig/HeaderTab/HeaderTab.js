/*
 * @Author: Fus
 * @Date:   2019-08-15 09:42:56
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2019-11-22 09:43:55
 * @Desc: 头部触发器类型
 */
import { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'dva';
import classNames from 'classnames';
import { BaseContext } from '@/constants/global';
import { CCard } from '@/components/common/BasicWidgets';
import { getProceduresType } from '@/services/triggerEvent';
import styles from './HeaderTab.less';

const triggerTypes = [
  {
    iconName: 'icon-triggerEvent-element',
    type: 1,
  }, {
    iconName: 'icon-triggerEvent-data',
    type: 2,
  }, {
    iconName: 'icon-triggerEvent-mysql',
    type: 3,
  }, {
    iconName: 'icon-triggerEvent-javascript',
    type: 4,
  }, {
    iconName: 'icon-triggerEvent-http',
    type: 5,
  }, {
    iconName: 'icon-triggerEvent-jar',
    type: 6,
  },
];

@connect(state => ({
  triggerState: state.triggerState,
}))
class HeaderTab extends Component {
  static contextType = BaseContext
  // 修改触发器类型
  handleChangeType = (triggerType) => {
    const { dispatch } = this.context;
    const { procedureTypeList } = this.props.triggerState;
    // 清空触发器内容
    dispatch({ type: 'triggerState/resetTriggers' });
    // 修改触发器类型
    dispatch({
      type: 'triggerState/updateState',
      payload: { triggerType },
    });
    // 获取该类型的数据
    setTimeout(() => {
      this.props.fetchData();
    }, 0);
    // 获取存储过程类型
    if (triggerType === 3 && !procedureTypeList.length) {
      this.fetchTypes();
    }
  }
  // 获取所有存储类型
  fetchTypes = () => {
    getProceduresType({}).then(procedureTypeList => {
      this.context.dispatch({
        type: 'triggerState/updateState',
        payload: { procedureTypeList },
      });
    });
  }
  render() {
    const { triggerEventConfig = {}, triggerType } = this.props.triggerState;
    const { elementData = {} } = triggerEventConfig;
    return (
      <CCard
        title={<FormattedMessage id="triggerEvent.toConnect" values={{ name: elementData.displayName }} />}
        className={styles.card}
      >
        {triggerTypes.map(item => {
          const cls = classNames({
            [styles.tab]: true,
            [styles[`tab_${item.type}`]]: true,
            [styles.active]: triggerType === item.type,
          });
          return (
            <div key={item.type} className={cls} onClick={() => this.handleChangeType(item.type)}>
              <span className={`iconfont ${item.iconName}`} />
              <FormattedMessage id={`triggerEvent.type.${item.type}`} />
            </div>
          );
        })}
      </CCard>
    );
  }
}
export default HeaderTab;