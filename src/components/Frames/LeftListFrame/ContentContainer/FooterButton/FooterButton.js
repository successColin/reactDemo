/*
 * @Author: Fus
 * @Date:   2019-08-28 20:06:55
 * @Last Modified by: Fus
 * @Last Modified time: 2019-09-06 15:10:03
 * @Desc: 面板中的底部按钮栏
 */
import { Component } from 'react';
import { connect } from 'dva';
import { CButton } from '@/components/common/BasicWidgets';
import { BTN_ELEMENT_TYPE } from '@/constants/element';
import styles from './FooterButton.less';

@connect(state => ({
  functionData: state.tabs.activeTabData.functionData,
}))
class FooterButton extends Component {
  // 校验是否有对应类型的权限
  validPermission = (btn) => {
    const { basetype } = btn;
    const { actionType, functionData } = this.props;
    const { canadd, canmodify, candelete } = functionData.attributes;
    // 没有对应权限则不显示对应类型按钮
    switch (basetype) {
      // case 4: return !!canadd; // 新增权限
      case 5:
        return !!canmodify; // 修改权限
      case 6:
        return !!candelete; // 删除权限
      case 7:  // 保存按钮与新增权限或修改权限相关
        return !!canmodify;
      case 24:
        return !!canmodify; // 修改权限
      case 26:
        return !!canmodify; // 修改权限
      case 28:
        return !!canmodify; // 修改权限
      case 29:
        return !!canmodify; // 修改权限
      case 34:
        return !!canmodify; // 修改权限
      case 35:
        return !!canmodify; // 修改权限
      default:
        return false;
    }
  };
  // 生成按钮列表
  getElements = () => {
    const { elementList = [], handleClickBtn } = this.props;
    const btnElement = elementList.filter(item => BTN_ELEMENT_TYPE.includes(item.basetype) && item.visiabled);
    return btnElement.map(btn => {
      // 无权限时不显示
      if (this.validPermission(btn)) {
        return (
          <CButton type="primary" key={btn.id} onClick={() => handleClickBtn(btn)}
                   loading={btn.static_loading}>
            {btn.displayName}
          </CButton>
        );
      }
      return null;
    });
  };

  render() {
    const { fromType } = this.props;
    return (
      <div className={!fromType ? styles.wrap : styles.wrapModal}>
        {this.getElements()}
      </div>
    );
  }
}

export default FooterButton;
