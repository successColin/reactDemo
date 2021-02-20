import React, { Component } from 'react';
import { Form, Modal } from 'antd';
import CreateModal from '@/components/common/CreateModal/CreateModal';

class RenderModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      popupTabInfo: {},
    };
  }

  render() {
    const { form } = this.props;
    const { visible, ...rest } = this.props;
    return (<CreateModal
      {...rest}
      // title={tabInfo.name}
      visible={visible}
      className="default"
    >
      {this.props.children}
    </CreateModal>);
  }
}

export default Form.create()(RenderModal);
