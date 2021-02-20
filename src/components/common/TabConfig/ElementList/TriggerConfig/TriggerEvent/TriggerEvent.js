/*
 * @Author: Fus
 * @Date:   2019-08-15 09:37:21
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2019-12-26 19:52:46
 * @Desc: 触发器配置页面
 */
import { Component } from 'react';
import { connect } from 'dva';
import { BaseContext } from '@/constants/global';
import { CCard } from '@/components/common/BasicWidgets';
import HeaderTab from '../HeaderTab/HeaderTab';
import EventElementList from '../EventElementList/EventElementList';
import styles from './TriggerEvent.less';

@connect(state => ({
  triggerState: state.triggerState,
}))
class TriggerEvent extends Component {
  static contextType = BaseContext
  state = {
    loadingStatus: {
      list: false, // 事件列表
    },
  }
  componentDidMount() {
    this.props.fetchData();
  }
  setWrapState = (itemObj) => {
    this.setState(itemObj);
  }
  render() {
    const { loadingStatus } = this.state;
    const { fetchData } = this.props;
    const headerProps = {
      ...this.props,
      fetchData: fetchData,
      // setWrapState: this.setWrapState,
    };
    const listProps = {
      ...this.props,
      loading: loadingStatus.list,
      fetchData: fetchData,
      // setWrapState: this.setWrapState,
    };
    return (
      <div className={styles.wrap}>
        <HeaderTab {...headerProps} />
        <CCard className={styles.content}>
          <EventElementList {...listProps} />
        </CCard>
      </div>
    );
  }
}
export default TriggerEvent;