/**
 *@author jwk
 *@2019/9/5 0005
 *@Description 预检测与导入弹框
 */

import React, { Component } from 'react';
import CModal from '@/components/common/CreateModal/CreateModal';
import Preview from './previewForm';
import Styles from '../ImportTemplateFiles.less';

class Cmodal extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    console.log(this.props,2)
    const config = {
      form: this.props.form,
      type: this.props.type,
      endRow: this.props.endRow,
    };
    return (<CModal
      {...this.props}
    >
      <Preview {...config}/>
    </CModal>);
  }
}

export default Cmodal;

