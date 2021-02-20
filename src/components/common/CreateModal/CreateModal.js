/*
 * @Author: Fus
 * @Date:   2019-08-06 10:10:23
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2020-11-08 15:07:54
 * @Desc: 创建modal类
 */
import React, { Component } from 'react';
import { Modal } from 'antd';
import classNames from 'classnames';
import styles from './CreateModal.less';

const initProps = {
  centered: true,
  destroyOnClose: true,
  size: 'default', // 尺寸 default-默认 large-大屏弹框
};
class CreateModal extends Component {
  static defaultProps = initProps
  constructor(props) {
    super(props);
    this.modalRef = React.createRef();
    const { clientHeight, clientWidth } = document.documentElement;
    this.state = {
      clientWidth,
      clientHeight,
      pageX: clientWidth / 3,
      pageY: '10vh',
      moving: false,
    };
  }
  // 获取鼠标点击title时的坐标、title的坐标以及两者的位移
  getPosition = (e) => {
    // 标题DOM元素titleDom
    const titleDom = e.target;
    // titleDom的坐标
    const X = titleDom.getBoundingClientRect().left;
    const Y = titleDom.getBoundingClientRect().top;
    // 鼠标点击的坐标
    let mouseX = 0, mouseY = 0;
    if (e.pageX || e.pageY) {  // ff,chrome等浏览器
      mouseX = e.pageX;
      mouseY = e.pageY;
    } else {
      mouseX = e.clientX + document.body.scrollLeft - document.body.clientLeft;
      mouseY = e.clientY + document.body.scrollTop - document.body.clientTop;
    }
    // 鼠标点击位置与modal的位移
    const diffX = mouseX - X;
    const diffY = mouseY - Y;
    return { X, Y, mouseX, mouseY, diffX, diffY };
  }

  onMouseDown = (e) => {
    const position = this.getPosition(e);
    window.onmousemove = this.onMouseMove;
    this.setState({ moving: true, diffX: position.diffX, diffY: position.diffY });
  }

  // 松开鼠标，设置modal状态为不可移动,
  onMouseUp = (e) => {
    this.setState({ moving: false });
  }

  // 鼠标移动重新设置modal的位置
  onMouseMove = (e) => {
    const { moving, diffX, diffY } = this.state;
    if (moving) {
      // 获取鼠标位置数据
      const position = this.getPosition(e);
      // 计算modal应该随鼠标移动到的坐标
      const x = position.mouseX - diffX;
      const y = position.mouseY - diffY;
      // 窗口大小
      const { clientWidth, clientHeight } = document.documentElement;
      const modal = this.modalRef.current;
      console.log(this.modalRef.current.offsetHeight, 'aaaaa ');
      if (modal) {
        // 计算modal坐标的最大值
        const maxHeight = clientHeight - modal.offsetHeight;
        const maxWidth = clientWidth - modal.offsetWidth;
        // 判断得出modal的最终位置，不得超出浏览器可见窗口
        const left = x > 0 ? (x < maxWidth ? x : maxWidth) : 0;
        const top = y > 0 ? (y < maxHeight ? y : maxHeight) : 0;
        this.setState({ pageX: x, pageY: y });
      }
    }
  }
  render() {
    const { size, footer, title, mask = true } = this.props;
    const { pageX, pageY } = this.state;
    const className = classNames({
      [styles.modal]: true,
      [styles[`modal_${size}`]]: true,
      [styles.hasFooter]: !!footer,
      [this.props.className]: true,
    });
    const modalProps = {
      getContainer: document.getElementById('main-container'), // 挂载的html节点
      ...initProps,
      ...this.props,
      className,
      // ref: this.modalRef,
      title: (
        <div
          className={styles.titleWrap}
          // onMouseDown={this.onMouseDown}
          // onMouseUp={this.onMouseUp}
        >
          {title}
        </div>
      ),
      mask: mask,
      // style: {
      //   top: pageY,
      //   left: pageX,
      // },
    };
    return (
      <Modal {...modalProps}>
        {this.props.children}
      </Modal>
    );
  }
}

export default CreateModal;