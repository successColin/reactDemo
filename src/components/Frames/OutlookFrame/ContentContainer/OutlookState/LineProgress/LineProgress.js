import { Component } from 'react';
import styles from './LineProgress.less';
import classNames from 'classnames';
import { gantt } from 'dhtmlx-gantt';

class LineProgress extends Component {
  state = {
    percent: -8,
    stateName: ['年', '季', '月', '周', '日', '时'],
    clickNum: 0,
    num: 14, // 加减区间
  };
  componentDidMount() {
  };
  // 增加
  increase = () => {
    let { stateName, clickNum, num } = this.state;
    let stateLen = stateName.length - 1;
    clickNum = clickNum >= stateLen ? stateLen : ++clickNum;
    this.setState({ clickNum: clickNum });
    let percent = this.state.percent + num;
    if (percent > 62) {
      percent = 62;
    }
    this.setState({ percent });
    gantt.ext.zoom.zoomIn();
  };
  // 减少
  decline = () => {
    let { clickNum, num } = this.state;
    clickNum = clickNum <= 0 ? 0 : --clickNum;
    this.setState({ clickNum: clickNum });
    let percent = this.state.percent - num;
    if (percent < -8) {
      percent = -8;
    }
    this.setState({ percent });
    gantt.ext.zoom.zoomOut();
  };
  moveTo = (result, event) => {
  }
  render() {
    const { percent, clickNum, stateName } = this.state;
    let stateLen = stateName.length - 1;
    const minusClass = classNames({
      [styles.minus]: true,
      [styles.noDrop]: clickNum === 0,
    });
    const addClass = classNames({
      [styles.add]: true,
      [styles.noDrop]: clickNum === stateLen,
    });
    return (
      <div className={styles.progress}>
        <div className={styles.name}>{stateName[clickNum]}</div>
        <div className={`${minusClass} switchbgd`} onClick={this.decline}>-</div>
        <div className={styles.content}>
          <span style={{ left: percent + 'px' }} onMouseDown={this.moveTo.bind(this, true)} onMouseUp={this.moveTo.bind(this, false)}></span>
        </div>
        <div className={`${addClass} switchbgd`} onClick={this.increase}>+</div>
      </div>
    );
  }
}

export default LineProgress;