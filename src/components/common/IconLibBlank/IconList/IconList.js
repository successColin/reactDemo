/*
 * @Author: Fus
 * @Date:   2019-08-07 11:00:37
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2020-05-19 14:53:09
 * @Desc:  图标列表
 */
import { Component, Fragment } from 'react';
import classNames from 'classnames';
import { Modal, Spin } from 'antd';
import { FormattedMessage } from 'react-intl';
import { CSpin, CMessage } from '@/components/common/BasicWidgets';
import { getElementDetail } from '@/services/element';
import { addElementToTab } from '@/services/framePage';
import { addElementToMobileTab } from '@/services/bundleConfig';
import { insertAppHomePage, replaceAppHomePageBundle } from '@/services/appLibrary';
import { ELEMENT_COLOR, SELECT_ELEMETN_TYPE } from '@/constants/element';
import { BaseContext } from '@/constants/global';
import { LIST_TAB_SHOW_TYPES, FORM_TAB_SHOW_TYPES } from '@/constants/pageConfig';
import { getDefaultConfirmProps } from '@/utils/common';
import styles from './IconList.less';
import ModalBox from '@/components/common/ReminderBox/ReminderBox';

class IconList extends Component {
  static contextType = BaseContext;
  static defaultProps = {
    dataType: '',
  };
  state = {
    loading: false,
    activeRow: {}, // 当前点击的图标
  };
  // 点击单个组件
  handleClickItem = (record) => {
    const { langLib } = this.context;
    const { dataType, preData, newSno, fromType, addEleCallback } = this.props;
    const { id } = record;
    const { relationTableName } = preData;
    console.log(dataType, preData);
    if (dataType === 'prevModule') { // 作为组件库，需要获取组件的更多详情（预设界面，因未与设计组菜单界面统一，故先保留）
      this.setState({ loading: true, activeRow: record });
      this.addToPrevPage(record);
    } else if (dataType === 'relateTab') { // 组件直接关联面板（设计组菜单，点击直接关联至面板）
      this.setState({ loading: true, activeRow: record });
      this.addToTabConfig(record);
    } else if (dataType === 'icon') { // 仅作为图标，只需要iconName即可，无需再调接口
      this.props.setWrapState({ selectedRows: [record] });
      this.setState({ activeRow: record });
    } else if (dataType === 'bundle' || dataType === 'appBundle') { // bundle功能库 / app库中
      const { functionalType, activeBundle } = preData;
      // 未选择功能区块
      if (!functionalType && !activeBundle.id) {
        CMessage(langLib['message.error.noFunctionalType'], 'error');
        return;
      } else if (functionalType === 'banner') {
        // banner区域不支持加bundle
        CMessage(langLib['message.error.notMatchArea'], 'error');
        return;
      } else if (functionalType === 'staticBlock') {
        // banner区域不支持加bundle
        CMessage(langLib['message.error.notMatchArea'], 'error');
        return;
      }
      // 替换组件
      if (activeBundle.id) {
        this.handleReplaceAppBundle(record, functionalType);
        return;
      }
      // 新增组件
      this.handleAddBundle(record);
    }
  };
  // 添加至【预设界面】
  addToPrevPage = (record) => {
    const { dataType, preData, newSno } = this.props;
    const { relationTableName } = preData;
    getElementDetail({ id: record.id }).then(res => {
      this.props.setWrapState({
        selectedRows: [{
          ...res,
          id: dataType === 'prevModule' ? null : res.id, // 从组件库拉到其他地方 需要去除id
          groupId: dataType === 'prevModule' ? null : res.id, // 从组件库拉到其他地方 需要去除id
          sno: newSno,
          visiabled: 1,
          columnSpan: 12,
          displayName: res.name,
          relationTableName,
        }],
      });
      this.setState({ loading: false });
    }, err => this.setState({ loading: false }));
  };
  // 添加至设计组菜单
  addToTabConfig = (record) => {
    const { id } = record;
    const { dataType, preData, newSno, fromType, addEleCallback } = this.props;
    const { relationTableName } = preData;
    const { functionId, userDesignerId, bundleId = '', showType, framType } = preData;
    let columnSpan = 12;
    if (LIST_TAB_SHOW_TYPES.includes(showType)) {
      columnSpan = 110;
    }
    let params = {
      tabId: preData.id,
      functionId,
      userDesignerId,
      id,
      planned: 10,
      sno: newSno,
      relationTableName,
      columnSpan,
      triggerSign: 1,
    };
    if (fromType === 'appBundleConfig' || fromType === 'appPageConfig') { // 新增APP控件
      params = {
        mobileTabId: preData.id,
        bundleId,
        id,
        planned: fromType === 'appPageConfig' ? 10 : 1,
        userDesignerId: fromType === 'appPageConfig' ? userDesignerId : 1,
        sno: newSno,
        relationTableName,
        triggerSign: 1,
      };
    }
    // 下拉框默认类型为【普通下拉】
    if (SELECT_ELEMETN_TYPE.includes(record.baseType)) {
      params.elementFormat = 1;
    }
    // 看板图表控件
    if (record.baseType === 41) {
      params = {
        ...params,
        elementPcStyle: 1,
        showType: 1,
      };
    }
    const addApi = fromType === 'PC' ? addElementToTab : addElementToMobileTab;
    this.setState({ loading: true, activeRow: record });
    addApi(params).then(res => {
      this.setState({ loading: false });
      addEleCallback && addEleCallback(res);
    }, err => this.setState({ loading: false }));
  };
  // 新增APP组件
  handleAddBundle = (record) => {
    const { id } = record;
    const { preData, dataType, addEleCallback } = this.props;
    const { activeBundle, ...restParams } = preData;
    const params = {
      ...restParams,
      bundleLibraryId: dataType === 'bundle' ? id : '',
      oldBundleId: dataType === 'appBundle' ? id : '',
    };
    this.setState({ loading: true, activeRow: record });
    insertAppHomePage(params).then(res => {
      this.setState({ loading: false });
      addEleCallback && addEleCallback(res);
    }, err => this.setState({ loading: false }));
  };
  // 替换APP组件
  handleReplaceAppBundle = (record, functionalType) => {
    const { id } = record;
    const { preData, dataType, addEleCallback } = this.props;
    const { activeBundle, appId, basetype } = preData;
    const { langLib } = this.context;
    let { close } = ModalBox.confirm({
      ...getDefaultConfirmProps(langLib),
      title: langLib['confirm.replace.bundle'](activeBundle.bundleName || ''),
      onOk: () => {
        const params = {
          id: activeBundle.id,
          appId,
          sno: activeBundle.sno,
          bundleLibraryId: dataType === 'bundle' ? id : '',
          oldBundleId: dataType === 'appBundle' ? id : '',
          functionalType,
          basetype,
        };
        replaceAppHomePageBundle(params).then(res => {
          closeModal();
          CMessage(langLib['message.replace.success']);
          addEleCallback && addEleCallback(res);
        });
      },
      onCancel: () => closeModal(),
    });
    const closeModal = () => {
      close();
    };
    // Modal.confirm({
    //   className: 'customConfirmColor',
    //   ...getDefaultConfirmProps(langLib),
    //   title: langLib['confirm.replace.bundle'](activeBundle.bundleName || ''),
    //   onOk: () => {
    //     const params = {
    //       id: activeBundle.id,
    //       appId,
    //       sno: activeBundle.sno,
    //       bundleLibraryId: dataType === 'bundle' ? id : '',
    //       oldBundleId: dataType === 'appBundle' ? id : '',
    //       functionalType,
    //       basetype,
    //     };
    //     return replaceAppHomePageBundle(params).then(res => {
    //       CMessage(langLib['message.replace.success']);
    //       addEleCallback && addEleCallback(res);
    //     });
    //   },
    // });
  };

  render() {
    const { iconList = [], selectedRows = [], dataType, iconSize = 'default' } = this.props;
    const { loading, activeRow } = this.state;
    const icons = iconList && iconList.map(icon => {
      const { baseType, iconName, name } = icon;
      const isActive = activeRow.id === icon.id;
      const realName = dataType === 'icon' ? name : iconName;
      let isBundleIcon = realName ? realName.indexOf('_bundle') !== -1 : false; // 是否为app bundle的图标
      if (!isBundleIcon) {
        isBundleIcon = realName ? realName.indexOf('APP_') !== -1 : false;
      }
      if (realName === 'iconzhishiku1') {
        isBundleIcon = true;
      }
      // const isFunctionIcon = realName ? realName.indexOf('_function') !== -1 : false; // 是否为PC菜单的图标
      console.log(isBundleIcon, 'isBundleIcon');
      const iconCls = (name = 'input') => classNames({
        'iconfont': true,
        'iconfont-app': isBundleIcon,
        [`icon-${name || iconName || 'input'}`]: true,
        [styles.icon]: true,
      });
      const activeIcon = selectedRows[0] || {};
      const liCls = classNames({
        [styles.iconLi]: true,
        [styles[iconSize]]: true,
        'custom-iconLib-active': isActive,
      });
      // 生成随机颜色
      const colorIndex = baseType < ELEMENT_COLOR.length ? baseType : Math.ceil(baseType / ELEMENT_COLOR.length);
      const color = ELEMENT_COLOR[colorIndex];
      console.log(icon.name, 'icon.name');
      return (
        <li
          key={`icon-${icon.id}`}
          className={liCls}
          title={icon.name}
          onClick={() => this.handleClickItem(icon)}
        >
          {iconSize === 'default' ? <span className={iconCls(icon.name)}/> : (
            <Fragment>
              <span className={iconCls(icon.iconName)} style={{ color }}/>
              <span className={styles.name}>{icon.name}</span>
            </Fragment>
          )}
        </li>
      );
    });
    return iconList && iconList.length ? (
      <div className={styles.loadingWrap}>
        <CSpin
          spinning={loading}
          tip={null}
        >
          <ul className={styles.box}>
            {icons}
          </ul>
        </CSpin>
      </div>
    ) : <div className="custom-text-center"><FormattedMessage id="global.noData"/></div>;
  }
}

export default IconList;
