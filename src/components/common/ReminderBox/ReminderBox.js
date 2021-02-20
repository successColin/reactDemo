import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Modal, Icon } from 'antd';
import Styles from './ReminderBox.less';

const ReminderBox = (props) => {
  let visible = true;
  let component = null;
  const div = document.createElement('div');
  document.getElementById('main-container').appendChild(div);
  const { title, content, ...rest } = props;
  let modalProps = {
    title: null,
    visible,
    maskClosable: false,
    closable: false,
    ...rest,
    getContainer: () => document.getElementById('main-container'),
  };
  const onClose = () => {
    let unmountResult = ReactDOM.unmountComponentAtNode(div);

    if (unmountResult && div.parentNode) {
      div.parentNode.removeChild(div);
    }
    // document.getElementById('main-container').removeChild(div);
    // ReactDOM.unmountComponentAtNode(div);
    // if (typeof props.onClose === 'function') {
    //   props.onClose();
    // }
  };
  // let newProps = Object.assign({}, modalProps, props);
  ReactDOM.render(
    <Modal
      {...modalProps}
      className={Styles.modal}
      ref={c => component = c}
      // onClose={onClose}
    >
      <div>
        <Icon className={Styles.iconSty} type="question-circle"/>
        <span className={Styles.spanSty}>{title}</span>
      </div>
      {!!content ? <div className={Styles.content}>{content}</div> : null}
    </Modal>,
    div,
  );
  return {
    close: onClose,
  };
};
const ModalBox = {};
ModalBox.confirm = (props) => ReminderBox({
  ...props,
  type: 'confirm',
});
export default ModalBox;
