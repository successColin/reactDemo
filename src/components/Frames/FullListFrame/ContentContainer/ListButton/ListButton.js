/*
 * @Author: Fus
 * @Date:   2019-08-28 20:06:55
 * @Last Modified by: Fus
 * @Last Modified time: 2019-09-06 15:10:03
 * @Desc: 面板中的底部按钮栏
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { BTN_ELEMENT_TYPE } from '@/constants/element';
import Styles from '@/components/Frames/LeftListFrame/ContentContainer/DetailList/DetailList.less';
import { Icon } from 'antd';

@connect(state => ({
  functionData: state.tabs.activeTabData.functionData,
}))
class ListButton extends Component {
  // 校验是否有对应类型的权限
  validPermission = (btn) => {
    const { basetype } = btn;
    const { actionType, functionData } = this.props;
    const { canadd, canmodify, candelete } = functionData.attributes;
    // 没有对应权限则不显示对应类型按钮
    switch (basetype) {
      case 4:
        return !!canadd; // 新增权限
        break;
      case 5:
        return !!canmodify; // 修改权限
        break;
      case 6:
        return !!candelete; // 删除权限
        break;
      case 7:  // 保存按钮与新增权限或修改权限相关
        return !!canmodify;
        break;
      case 18:
        return !!canadd; // 新增权限
        break;
      case 24:
        return !!canmodify; // 修改权限
        break;
      case 26:
        return !!canmodify; // 修改权限
      default:
        return false;
    }
  };
  // 生成按钮列表
  // 生成按钮
  renderBtnGroup = () => {
    const { tabInfo, elementMap, handleClickBtn, normalBtnInList } = this.props;
    let elementObj = elementMap[tabInfo.id];
    let btnArr = elementObj.filter((item) => {
      return (BTN_ELEMENT_TYPE.includes(item.basetype) && item.visiabled);
    }) || [];
    return btnArr.map((item) => {
      const { basetype } = item;
      if (this.validPermission(item)) {
        switch (basetype) {
          case 4:
            return <div className={Styles.divFlex} key={item.id} onClick={() => handleClickBtn(item)}>
              <div className={Styles.addNewBtn}>
                <Icon className={Styles.addnewBtnIco} type="plus-square"/>
                <span>{item.displayName}</span>
              </div>
            </div>;
          case 5:
            return <div className={Styles.divFlex} key={item.id} onClick={() => handleClickBtn(item)}>
              <div className={Styles.addNewBtn}>
                <span className={`${Styles.commonIconStyle} iconEdit iconfont`}></span>
                <span>{item.displayName}</span>
              </div>
            </div>;
          case 6:
            return <div className={Styles.divFlex} key={item.id} onClick={() => handleClickBtn(item)}>
              <div className={Styles.addNewBtn}>
                <span className={`${Styles.commonIconStyle} icondelete iconfont`}></span>
                <span>{item.displayName}</span>
              </div>
            </div>;
          case 18:
            return <div className={Styles.divFlex} key={item.id} onClick={() => handleClickBtn(item)}>
              <div className={Styles.addNewBtn}>
                <Icon className={Styles.addnewBtnIco} type="plus-square"/>
                <span>{item.displayName}</span>
              </div>
            </div>;
          case 24:
            return <div className={Styles.divFlex} key={item.id} onClick={() => normalBtnInList(item)}>
              <div className={Styles.addNewBtn}>
                {/*<Icon className={Styles.addnewBtnIco} type="plus-square"/>*/}
                <span>{item.displayName}</span>
              </div>
            </div>;
          default:
            return null;
        }
      }
    });
  };

  render() {
    const { fromType } = this.props;
    return (
      <div style={{ 'height': '42px' }}>
        {this.renderBtnGroup()}
      </div>
    );
  }
}

export default ListButton;
