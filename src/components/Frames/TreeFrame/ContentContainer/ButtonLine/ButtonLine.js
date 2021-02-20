/*
 * @Author: Fus
 * @Date:   2019-08-28 20:06:55
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2020-11-24 23:02:08
 * @Desc: 面板中的底部按钮栏
 */
import { Component } from 'react';
import { connect } from 'dva';
import classNames from 'classnames';
import { CButton } from '@/components/common/BasicWidgets';
import { BTN_ELEMENT_TYPE, BTN_ELEMENT_IN_LIST } from '@/constants/element';
import { LIST_TAB_SHOW_TYPES } from '@/constants/pageConfig';
import styles from './ButtonLine.less';
import RelationPopup from '../RelationPopup/RelationPopup';

@connect(state => ({
  functionData: state.tabs.activeTabData.functionData,
}))
class ButtonLine extends Component {
  state = {
    visibleRelationPropup: false, // 关联弹出面板是否显示
  }
  // 校验是否有对应类型的权限
  validPermission = (btn) => {
    const { basetype } = btn;
    const { actionType, functionData, tabInfo } = this.props;
    const { showType } = tabInfo;
    const { canadd, canmodify, candelete, canprint } = functionData.attributes;
    // 没有对应权限则不显示对应类型按钮
    // 面板展示类型为表单时，新增、修改、删除按钮不显示（功能在树的右键上）
    switch (basetype) {
      case 4: return showType !== 2 && !!canadd; // 新增权限
      case 49: return showType !== 2 && !!canadd; // 展望生成
      case 18: return showType !== 2 && !!canadd; // 新增权限(关联新增)
      case 5: return showType !== 2 && !!canmodify; // 修改权限
      case 6: return showType !== 2 && !!candelete; // 删除权限
      case 7: { // 保存按钮与新增权限或修改权限相关
        if (LIST_TAB_SHOW_TYPES.includes(showType)) return false; // 列表中的保存按钮不显示
        if (actionType === 'addGroup' || actionType === 'addChild') {
          return !!canadd;
        } else if (actionType === 'editGroup' || actionType === 'editChild') {
          return !!canmodify;
        }
        return true;
      };
      case 30: return !!canprint; // 打印权限
      default: return true;
    }
  }
  // 点击按钮前处理函数
  beforeResolveClick = (btn) => {
    const { basetype } = btn;
    if (basetype === 18) { // 关联面板的新增按钮
      this.props.handleClickRelationAddBtn(btn);
      // } else if (basetype === 6) { // 删除按钮
      //   this.props.handleDeleteBtn && this.props.handleDeleteBtn(btn);
    } else {
      this.props.handleClickBtn(btn);
    }
  }
  renderBtnIcon = (btn, icon = '') => {
    const { basetype } = btn;
    let iconType = icon;
    if (basetype === 4 || basetype === 18) {
      iconType = 'icon-add-border';
    } else if (basetype === 5) {
      iconType = 'iconEdit';
    } else if (basetype === 6) {
      iconType = 'icondelete';
    } else if (basetype === 30) {
      iconType = 'iconExport';
    } else if (basetype === 49) {
      iconType = 'icon-create-style';
    }
    const iconCls = classNames({
      [styles.btnIcon]: true,
      'iconfont': true,
      'custom-color': true,
      [iconType]: true,
    });
    return iconType ? <span className={iconCls} /> : null;
  }
  // 生成按钮列表
  getElements = () => {
    const { elementList = [], handleClickBtn, tabInfo, icon = '' } = this.props;
    const { showType: tabShowType } = tabInfo;
    const btnElement = elementList.filter(item => BTN_ELEMENT_IN_LIST.includes(item.basetype));
    return btnElement.map(btn => {
      // 有权限时且可见时才显示
      if (this.validPermission(btn) && btn.visiabled) {
        const isListBtn = LIST_TAB_SHOW_TYPES.includes(tabShowType);
        return (
          <CButton
            className={styles.btn}
            key={btn.id}
            onClick={() => this.beforeResolveClick(btn)}
            loading={btn.static_loading}
            type={isListBtn ? 'default' : 'primary'}
          >
            {isListBtn && this.renderBtnIcon(btn, icon)}
            {btn.displayName}
          </CButton>
        );
      }
      return null;
    });
  }
  render() {
    const { tabInfo, fromType } = this.props;
    const { visibleRelationPropup } = this.state;
    const { showType } = tabInfo;
    const Btns = this.getElements();
    const wrapCls = classNames({
      [styles.wrap]: true,
      'tree-frame-button-line': true,
      [styles.noBtn]: !Btns.length,
      [styles[fromType]]: true,
      [styles.listBtnWrap]: showType === 1 || showType === 4,
    });
    return (
      <div className={wrapCls}>
        {Btns}
        {/* <RelationPopup
          visible={visibleRelationPropup}
        /> */}
      </div>
    );
  }
}
export default ButtonLine;
