import { Component, Fragment } from 'react';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';
import { Tooltip } from 'antd';
import styles from './States.less';

class States extends Component {
  state = {
    stateList: [], // 状态
  }
  static getDerivedStateFromProps(props, state) {
    // elementMap转为state
    // 原因：弹出第二层面板后发生触发器或修改按钮状态等情况下需要更新elementMap，会造成弹出面板死循环反复弹出
    //  || JSON.stringify(props.tabInfo) !== '{}'
    if (JSON.stringify(props.stateDate) !== 'undefined' || JSON.stringify(props.seniorFilter) !== 'undefined') {
      return {
        stateDate: props.stateDate,
        seniorFilter: props.seniorFilter,
      };
    }
    return null;
  }
  componentDidMount() {
  }
  componentDidUpdate(prevProps, prevState) {
    if (prevState.stateDate !== this.state.stateDate) {
      const { stateList, stateDate } = this.state;
      stateList && stateDate.forEach(item => {
        stateList.push({
          id: item.id,
          state: false,
          name: item.name,
          color: item.colorcode,
        });
      });
      this.setState({ stateList: stateList });
    };
    const { stateList, seniorFilter } = this.state;
    if (prevState.seniorFilter !== seniorFilter) {
      let stateId = [];
      if (seniorFilter.stateid) {
        let valueDate = seniorFilter.stateid && seniorFilter.stateid.static_value;
        if (typeof valueDate === 'number') {
          stateId.push(valueDate);
        } else if (typeof valueDate === 'string') {
          stateId = valueDate.split(',');
        }
      }
      stateList.forEach(item => {
        item.state = false;
        stateId.forEach(val => {
          if (Number(val) === item.id) {
            item.state = true;
          }
        });
        if (stateId.length === 0) {
          item.state = true;
        }
      });
      this.setState({ stateList: stateList });
    };
  }
  handleBtnState = (id, index) => {
    const { stateList } = this.state;
    const { fetchListData, listQueryParams, allFooterBtnProps, setContainerState, seniorFilter, searchQueryList } = this.props;
    const { endDay, startDay, keyword } = listQueryParams;
    let stateId = [];
    stateList.forEach(item => {
      if (item.id === id) {
        item.state = !item.state;
      }
      item.state === true && stateId.push(item.id);
    });
    this.setState({ stateList });
    if (stateId) {
      seniorFilter['stateid'] = {
        static_type: 2,
        static_value: stateId.join(','),
        static_connector: 8,
      };
    } else {
      delete seniorFilter['stateid'];
    }
    setContainerState({
      seniorFilter: seniorFilter,
    }, () => {
      fetchListData({ searchQueryList });
    });
  }
  render() {
    const { stateDate } = this.props;
    const { stateList } = this.state;
    // let stateColor = [];
    // stateDate && stateDate.forEach(item => {
    //   stateColor.push({
    //     id: item.id,
    //     color: item.colorcode,
    //     name: item.name,
    //   });
    // });
    const setIconYes = classNames({
      'iconfont': true,
      'icon-select-ok': true,
    });
    const setIconNo = classNames({
      'iconfont': true,
      'icon-select-no': true,
    });
    return (
      <div className={styles.state}>
        <div className={styles.textName}>状态</div>
        <div className={styles.circle}>
          {
            stateList.map((item, index) => {
              // item子体   index下标
              // react里一般使用map遍历，通过return返回渲染代码块
              // map可用于返回符合条件的内容结合if语句
              // map不结合if判断语句则可以遍历数组，返回全部数组的内容
              return (
                <Tooltip
                  key={item.id}
                  title={item.name}
                >
                  <span className={item.state ? setIconYes : setIconNo} style={{ color: item.color, marginRight: '6px', marginLeft: (index === 0) ? '6px' : '' }} onClick={() => this.handleBtnState(item.id, index)}></span>
                </Tooltip>
              );
            })
          }
        </div>
      </div>
    );
  }
}

export default States;