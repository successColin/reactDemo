/*
 * @Author: jwk
 * @Date:   2020-11-10 11:45:17
 * @Desc: 二维码组件
 */
import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { Popover } from 'antd';

import JsBarcode from 'JsBarcode';
import styles from './QRCode.less';

const QRcode = require('qrcode.react');

class QRCode extends Component {
  static getDerivedStateFromProps(props, state) {
    if (props['data-__meta'].initialValue !== state.value) {
      return { value: props['data-__meta'].initialValue };
    }
    return null;
  }

  state = {
    isOver: false, // 默认移除
    value: '',
  };

  componentDidMount() {
    console.log('did');
  }


  // 设置颜色
  setIsOverState = () => {
    this.setState({ isOver: !this.state.isOver });
  };
  // 渲染二维码还是条形码
  renderDom = () => {
    const { eleObj = {} } = this.props;
    const { elementFormat = 1 } = eleObj;
    const { value = '' } = this.state;
    const jsbar = <svg id="QRcodeSvg"></svg>;
    return elementFormat === 2 ? jsbar : <QRcode value={`${value}`}/>;
  };
  // 显示隐藏的回调
  onVisibleChange = (visible) => {
    const { eleObj = {} } = this.props;
    const { elementFormat = 1 } = eleObj;
    const { value } = this.state;
    elementFormat === 2 && document.getElementById('QRcodeSvg') && JsBarcode('#QRcodeSvg', value);
  };

  render() {
    const { isOver } = this.state;
    const dom = this.renderDom();

    return <div className={styles.QRCodeWrap}>
      <Popover
        overlayClassName={styles.popoverWrap}
        placement="bottom"
        onMouseEnter={() => this.setIsOverState()}
        onMouseLeave={() => this.setIsOverState()}
        content={dom}
        onVisibleChange={() => this.onVisibleChange()}
      >
        <div className={styles.qrWrap}>
          <i className={`iconfont icon-app-qb ${isOver ? styles.colorBg : ''}`}></i>
        </div>
      </Popover>
      <div className={styles.title}><FormattedMessage id="code.qr.viewtheQRcode"/></div>
    </div>;
  }
}

export default QRCode;
