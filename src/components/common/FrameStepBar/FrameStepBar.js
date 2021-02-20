/*
 * @Author: jwk
 * @Date:   2020-06-12 15:45:48
 * @Desc: 步骤条功能
 */

import React, { Component } from 'react';
import { Steps, Popover, Col } from 'antd';
import { BTN_ELEMENT_TYPE } from '@/constants/element';
import { getList } from '@/services/leftListFrame';
import { BaseContext } from '@/constants/global';
import { CMessage } from '@/components/common/BasicWidgets';
import Styles from './FrameStepBar.less';

const { Step } = Steps;

class FrameStepBar extends Component {
  static contextType = BaseContext;

  static getDerivedStateFromProps(props, state) {

    if (JSON.stringify(props.list) !== JSON.stringify(state.list)) {
      return {
        transitionWidth: 0,
        list: props.list,
      };
    }
    return null;
  }

  state = {
    globalMap: {}, // 条件1
    globalQueryMap: {}, // 条件2
    list: [], // 返回的数组
    transitionWidth: 0, // 移动距离
  };
  // 判断是否展示按钮
  checkIsShowBtn = () => {
    const { transitionWidth, list } = this.state;
    let realDomWidth = document.getElementById('a') && document.getElementById('a').clientWidth; // 获取dom宽度
    let n = list.length;
    let realyWidth = 200 * n;
    if (transitionWidth === 0 & realyWidth <= (realDomWidth + 2)) { // 如果移动距离为0切真实宽度小于等于容器宽度，则不显示切换按钮
      return {
        showLeft: false,
        showRight: false,
      };
    } else if (transitionWidth === 0 & realyWidth > (realDomWidth + 2)) { // 如果移动距离为0切真实宽度大于容器宽度，则显示右切换按钮
      return {
        showLeft: false,
        showRight: true,
      };
    } else if (transitionWidth !== 0 & (realyWidth + transitionWidth) > (realDomWidth + 2)) { // 如果移动距离不为0切移动之和的宽度大于容器宽度，则显示切换按钮
      return {
        showLeft: true,
        showRight: true,
      };
    } else if (transitionWidth !== 0 & (realyWidth + transitionWidth) <= (realDomWidth + 2)) { // 如果移动距离不为0且移动过得距离和真实的dom节点宽度之和小于容器宽度，则显示左切换按钮
      return {
        showLeft: true,
        showRight: false,
      };
    }
  };

  // 渲染步骤条
  renderSteps = () => {
    const { list, transitionWidth } = this.state;
    const { elementMap, tabInfo } = this.props;
    const tabId = tabInfo.id;
    const { langLib } = this.context;
    let elementObj = elementMap[tabId] || [];
    const showEleObj = elementObj.find(item => item.canDisplayName === 1);
    const operationdateObj = elementObj.find(item => item.relationColumnName === 'operationdate');
    const useridObj = elementObj.find(item => item.relationColumnName === 'userid');
    if (!showEleObj) {
      CMessage(langLib['message.err.please.configure.showname'], 'error');
      return;
    }
    if (!list.length) return;
    let newList = list.map((item, index) => {
      return {
        ...item,
        index,
      };
    });
    let n = newList.length;
    let lastObj = newList[n - 1];
    let styleData = `translate3d(${transitionWidth}px, 0px, 0px)`;
    const { showLeft = false, showRight = false } = this.checkIsShowBtn();
    return <div className={Styles.stepBox}>
      {showLeft ? <span onClick={() => this.moveLeft()}
                        className={`iconfont icon-click-left ${Styles.left} ${Styles.iconCommon}`}></span> : null}
      <Steps current={lastObj.index} style={{ 'transitionDuration': '.1s', 'transform': styleData }}>{
        list.map((item, i) => {
          let showName = !!item[showEleObj.id] && (typeof item[showEleObj.id] !== 'string') ? item[showEleObj.id].name : JSON.parse(item[showEleObj.id]).name;
          let operationdate = !!item[operationdateObj.id] && (typeof item[operationdateObj.id] !== 'string') ? item[operationdateObj.id].name : JSON.parse(item[operationdateObj.id]).name;
          let userid = !!item[useridObj.id] && (typeof item[useridObj.id] !== 'string') ? item[useridObj.id].name : JSON.parse(item[useridObj.id]).name;
          let description = <div>{userid} <br/>{operationdate}</div>;
          let PopoverDom = this.renderPopoverContent(item);
          let dom = <Popover
            placement={'bottom'}
            overlayClassName={Styles.overlayStyle}
            getPopupContainer={() => document.getElementById('main-container')} color={'#fff'}
            content={PopoverDom}>{showName}</Popover>;
          return <Step className={Styles.stpeWidth} key={i} title={dom} description={description}/>;
        })
      }</Steps>
      {showRight ? <span onClick={() => this.moveRight()}
                         className={`iconfont icon-click-right ${Styles.right} ${Styles.iconCommon}`}></span> : null}
    </div>;
  };
  // 渲染Popover中的内容
  renderPopoverContent = (item) => {
    const { elementMap, tabInfo } = this.props;
    const tabId = tabInfo.id;
    const elementList = elementMap[tabId];
    let dom = elementList.map(value => {
      if (value.relationColumnName !== 'id' && value.visiabled) {
        return <Col key={value.id}
                    span={24}><span
          className={Styles.colSpan}>{value.displayName}</span> : {item[value.id] && (typeof item[value.id] !== 'string') ? item[value.id].name : JSON.parse(item[value.id]).name}
        </Col>;
      }
    });
    return <div>{dom}</div>;
  };
  // 右边移动
  moveRight = () => {
    const { transitionWidth } = this.state;
    this.setState({
      transitionWidth: transitionWidth - 200,
    });
  };
  // 左边移动
  moveLeft = () => {
    const { transitionWidth } = this.state;
    this.setState({
      transitionWidth: transitionWidth + 200,
    });
  };


  render() {
    const { list = [] } = this.state;
    let n = list.length;
    return (n ? <div className={Styles.content} ref="getFormWidth">{this.renderSteps()}</div> : null);
  }
}

export default FrameStepBar;
