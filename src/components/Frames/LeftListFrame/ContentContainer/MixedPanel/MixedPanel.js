/*
 * @Author: jwk
 * @Date:   2020-05-07 10:33:12
 * @Last Modified by: wjk
 * @Desc: 盘点框架（上表单下列表）
 */

import React, { Component } from 'react';
import DetailForm from '@/components/Frames/LeftListFrame/ContentContainer/DetailForm/DetailForm';
import DetailList from '@/components/Frames/LeftListFrame/ContentContainer/DetailList/DetailList';
import Styles from '../ContentContainer.less';

class MixedPanel extends Component {
  constructor(props) {
    super();
    this.state = {};
  }

  componentDidMount() {
    console.log('did');
  }

  render() {
    const { tabData, tabInfo, formProps, listProps, isNew } = this.props;
    const { total = 0 } = listProps.formData;
    const { SubPanel } = listProps;
    const { visiabled } = SubPanel;
    let isTrue = !isNew && visiabled;
    return (<span>
      <div style={{ 'minHeight': '30%' }}>
        <DetailForm
          {...this.props}
          {...formProps}
          formData={tabData[tabInfo.id] || {}}
          className={Styles.formStyle}
        />
      </div>
      <div style={total ? { 'minHeight': '50%' } : { 'height': '50%' }}>
        <DetailList
          {...this.props}
          {...listProps}
          isTrue={isTrue}
        />
      </div>
    </span>);
  }
}

export default MixedPanel;
