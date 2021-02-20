/*
 * @Author: Fus
 * @Date:   2019-09-10 21:24:55
 * @Desc: 主页模型
 */
import { Component, Fragment } from 'react';
import { FormattedMessage } from 'react-intl';
import { Modal, Dropdown, Menu } from 'antd';
import { connect } from 'dva';
import classNames from 'classnames';
import ModalBox from '@/components/common/ReminderBox/ReminderBox';
import { CMessage, CSpin } from '@/components/common/BasicWidgets';
import { getDefaultConfirmProps } from '@/utils/common';
import { BaseContext } from '@/constants/global';
import {
  deleteAppHomePageBundle,
  deleteAppHomePageBundleGroup,
  updateAppHomePageBundleGroupSno,
  switchGroup,
} from '@/services/appLibrary';
import styles from './HomeModel.less';

// @connect(state => ({
//   appHomeConfig: state.appHomeConfig,
//   functionData: state.tabs.activeTabData.functionData,
// }))
class HomeModel extends Component {
  static contextType = BaseContext;
  state = {
    loadingMoveGroup: false, // 移动分组中
    showChangeGroup: false, // 是否显示修改分组下拉列表
  };
  // 选择功能区
  handleSetArea = (areaCode) => {
    this.context.dispatch({
      type: 'appHomeConfig/updateState',
      payload: {
        areaCode,
        groupData: {},
        actionType: '',
        activeBundle: {},
      },
    });
  };
  // 删除bundle
  handleDeleteBundle = (id) => {
    const { langLib } = this.context;
    let { close } = ModalBox.confirm({
      ...getDefaultConfirmProps(langLib),
      onOk: () => {
        deleteAppHomePageBundle({ id }).then(res => {
          CMessage(langLib['message.del.success']);
          this.context.dispatch({
            type: 'appHomeConfig/updateState',
            payload: {
              actionType: '',
              activeBundle: {},
            },
          });
          closeModal();
          this.props.fetchAppData();
        });
      },
      onCancel: () => closeModal(),
    });
    const closeModal = () => {
      close();
    };
    // Modal.confirm({
    //   ...getDefaultConfirmProps(langLib),
    //   className: 'customConfirmColor',
    //   onOk: () => {
    //     return deleteAppHomePageBundle({ id }).then(res => {
    //       CMessage(langLib['message.del.success']);
    //       this.context.dispatch({
    //         type: 'appHomeConfig/updateState',
    //         payload: {
    //           actionType: '',
    //         },
    //       });
    //       this.props.fetchAppData();
    //     });
    //   },
    // });
  };
  // 删除主页bundle分组
  handleDeleteGroup = ({ id }) => {
    const { langLib } = this.context;
    let { close } = ModalBox.confirm({
      ...getDefaultConfirmProps(langLib),
      onOk: () => {
        deleteAppHomePageBundleGroup({ id }).then(res => {
          CMessage(langLib['message.del.success']);
          this.context.dispatch({
            type: 'appHomeConfig/updateState',
            payload: {
              groupData: {},
            },
          });
          closeModal();
          this.props.fetchAppData();
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
    //   onOk: () => {
    //     return deleteAppHomePageBundleGroup({ id }).then(res => {
    //       CMessage(langLib['message.del.success']);
    //       this.context.dispatch({
    //         type: 'appHomeConfig/updateState',
    //         payload: {
    //           groupData: {},
    //         },
    //       });
    //       this.props.fetchAppData();
    //     });
    //   },
    // });
  };
  // 移动bundle分组
  handleMoveBundleGroup = (type, prevGroupData, nextGroupData, activeGroupData) => {
    if ((type === 'up' && !prevGroupData.id) || (type === 'down' && !nextGroupData.id)) return;
    const { fetchAppData } = this.props;
    let groupList = [
      { id: activeGroupData.id, sno: prevGroupData.sno },
      { id: prevGroupData.id, sno: activeGroupData.sno },
    ];
    if (type === 'down') {
      groupList = [
        { id: activeGroupData.id, sno: nextGroupData.sno },
        { id: nextGroupData.id, sno: activeGroupData.sno },
      ];
    }
    this.setState({ loadingMoveGroup: true });
    updateAppHomePageBundleGroupSno({ groupList }).then(res => {
      fetchAppData();
      this.setState({ loadingMoveGroup: false });
    }, err => this.setState({ loadingMoveGroup: false }));
  };
  // 更新state
  handleUpdateState = (payload) => {
    this.context.dispatch({
      type: 'appHomeConfig/updateState',
      payload,
    });
  };
  // 控制分组隐藏
  hideChangeGroup = () => {
    this.setState({ showChangeGroup: false });
  };
  // 切换bundle
  handleSetActiveBundle = (e, curBundle, curGroupData = {}) => {
    e.stopPropagation();
    const { appHomeConfig, form } = this.props;
    const { activeBundle: preBundle } = appHomeConfig;
    form.resetFields();
    const isSameBundle = preBundle.id === curBundle.id;
    let params = {
      actionType: 'bundleDetail',
      activeBundle: curBundle,
    };
    // 点击bundle同时切换到该组的信息
    if (curGroupData) {
      params = {
        ...params,
        areaCode: 30,
        groupData: curGroupData,
      };
    }
    !isSameBundle && this.setState({ showChangeGroup: false });
    this.handleUpdateState(params);
  };
  // 切换组
  handleChangeGroup = (groupData) => {
    this.props.form.resetFields();
    this.handleUpdateState({
      actionType: 'editGroup',
      areaCode: 30,
      groupData,
      activeBundle: {},
    });
  };
  // 新增组
  handleAddGroup = () => {
    this.props.form.resetFields();
    this.handleUpdateState({
      actionType: 'addGroup',
      areaCode: '',
      groupData: {},
    });
  };
  // 获取分组列表的下拉菜单项
  getGroupList = () => {
    const { workSpaceList, myWorkSpaceList, mainTabKey } = this.props.appHomeConfig;
    const listData = mainTabKey === 1 ? workSpaceList : myWorkSpaceList;
    const menuList = listData.map(item => (
      <Menu.Item key={`${item.id}`} onClick={(e) => this.handleChangeBundleGroup(item)}>
        <div className={styles.overlayItem}>
          {item.name}
          {/* <i
            className="iconfont icon-changeGroup-select"
          /> */}
        </div>
      </Menu.Item>
    ));
    return (
      <Menu>
        {menuList}
      </Menu>
    );
  };
  // 修改bundle的所属分组
  handleChangeBundleGroup = (groupData) => {
    this.setState({ showChangeGroup: false });
    const { langLib } = this.context;
    const { activeBundle } = this.props.appHomeConfig;
    let { close } = ModalBox.confirm({
      ...getDefaultConfirmProps(langLib),
      title: langLib['appHomeConfig.changeGroup.title'](groupData.name),
      onOk: () => {
        const params = {
          groupId: groupData.id,
          bundleId: activeBundle.id,
        };
        switchGroup(params).then(res => {
          CMessage(langLib['message.save.success']);
          this.props.fetchAppData();
          closeModal();
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
    //   title: langLib['appHomeConfig.changeGroup.title'](groupData.name),
    //   onOk: () => {
    //     const params = {
    //       groupId: groupData.id,
    //       bundleId: activeBundle.id,
    //     };
    //     return switchGroup(params).then(res => {
    //       CMessage(langLib['message.save.success']);
    //       this.props.fetchAppData();
    //     });
    //   },
    // });
  };
  // 获取bundle列表
  mapToGetBundles = (listData, curGroupData = {}) => {
    const { langLib } = this.context;
    const { showChangeGroup } = this.state;
    const { mainTabKey, activeBundle, areaCode, groupData: activeGroupData } = this.props.appHomeConfig;
    return listData && listData.map(item => {
      const { bundleIconName } = item;
      const isBundleIcon = bundleIconName ? bundleIconName.indexOf('_bundle') !== -1 : false;
      const iconCls = classNames({
        [styles.bundleIcon]: true,
        'iconfont-app': isBundleIcon,
        [`icon-${item.bundleIconName}`]: !!item.bundleIconName,
        'iconfont': true,
        'icon-app-placeholder': !item.bundleIconName,
      });
      const isActiveBundle = activeBundle.id === item.id;
      const styleData = activeGroupData.id === curGroupData.id ? activeGroupData : curGroupData;
      const itemCls = classNames({
        [styles.item]: true,
        [styles.active]: isActiveBundle,
        [styles[`style_${styleData.styleType}`]]: true,
      });
      return (
        <div
          key={`bundle${item.id}`}
          className={itemCls}
          onClick={(e) => this.handleSetActiveBundle(e, item, curGroupData)}
        >
          <i className="iconfont icon-app-delete custom-color" onClick={() => this.handleDeleteBundle(item.id)}/>
          <i className={iconCls}/>
          {isActiveBundle && <div className={styles.changeGroup}>
            <Dropdown
              overlay={this.getGroupList()}
              trigger="click"
              visible={showChangeGroup && isActiveBundle}
            >
              <i
                className="iconfont icon-changeGroup"
                title={langLib['appHomeConfig.changeGroup']}
                onClick={() => this.setState({ showChangeGroup: !showChangeGroup })}
              />
            </Dropdown>
          </div>}
        </div>
      );
    }) || null;
  };
  // 渲染分组区域
  mapToGetGroups = (bundleData) => {
    const { mainTabKey, activeBundle, areaCode, groupData: activeGroupData } = this.props.appHomeConfig;
    if (!bundleData || !bundleData.length) return null;
    const bundleDataLen = bundleData ? bundleData.length : 0;
    return bundleData && bundleData.map((curGroupData, index) => {
      const { list = [] } = curGroupData;
      const bundleItems = this.mapToGetBundles(list, curGroupData);
      const prevGroupData = (bundleData && index !== 0) ? bundleData[index - 1] : {};
      const nextGroupData = (bundleData && index !== (bundleDataLen - 1)) ? bundleData[index + 1] : {};
      const groupCls = classNames({
        [styles.blockWrap]: true,
        [styles.groupWrap]: true,
        [styles.active]: areaCode === 30 && curGroupData.id === activeGroupData.id,
      });
      // 个人中心配置没有分组风格配置，只有默认样式
      const styleData = activeGroupData.id === curGroupData.id ? activeGroupData : curGroupData;
      const showTitle = !!(styleData.showGroupName);
      return (
        <div
          key={`groupBundle${curGroupData.id}`}
          className={groupCls}
          onClick={() => this.handleChangeGroup(curGroupData)}
        >
          <div className={styles.groupItem}>
            <div className={styles.operatorWrap}>
              <i className="iconfont icon-up"
                 onClick={() => this.handleMoveBundleGroup('up', prevGroupData, nextGroupData, curGroupData)}/>
              <i className="iconfont icon-down"
                 onClick={() => this.handleMoveBundleGroup('down', prevGroupData, nextGroupData, curGroupData)}/>
              <i className="iconfont icon-close" onClick={() => this.handleDeleteGroup(curGroupData)}/>
            </div>
            {showTitle && <p className={styles.tit}>{curGroupData.name}</p>}
            <div className={styles.itemWrap}>
              {bundleItems}
            </div>
          </div>
        </div>
      );
    });
  };

  render() {
    const { appHomeConfig, functionData } = this.props;
    const { canmodify, canadd, candelete } = functionData.attributes;

    const { loadingMoveGroup } = this.state;
    const { mainTabKey, areaCode, leftList, rightList, topCoreList, workSpaceList, myWorkSpaceList, bottomList, figureList } = appHomeConfig;
    const isUserCenter = mainTabKey === 2;
    const listData = mainTabKey === 1 ? workSpaceList : myWorkSpaceList;
    return (
      <div className={styles.wrap}>
        {!isUserCenter && (
          <Fragment>
            {/* <div className={styles.topBar}>
              <div
                className={`${styles.blockWrap} ${styles.topLeftBar} ${areaCode === 11 && styles.active}`}
                onClick={() => this.handleSetArea(11)}
              >
                {this.mapToGetBundles(leftList)}
              </div>
              <div
                className={`${styles.blockWrap} ${styles.topRightBar} ${areaCode === 12 && styles.active}`}
                onClick={() => this.handleSetArea(12)}
              >
                {this.mapToGetBundles(rightList)}
              </div>
            </div> */}
            <div
              className={`${styles.blockWrap} ${styles.bannerWrap} ${areaCode === 'banner' && styles.active}`}
              onClick={() => this.handleSetArea('banner')}
            >
            </div>
            <div
              className={`${styles.blockWrap} ${styles.mainEntry} ${areaCode === 20 && styles.active}`}
              onClick={() => this.handleSetArea(20)}
            >
              {this.mapToGetBundles(topCoreList)}
            </div>
          </Fragment>
        )}
        {canadd ? <div
          className={`${styles.blockWrap} ${styles.addGroup}`}
          onClick={() => this.handleAddGroup()}
        >
          <i className="iconfont icon-add-app"/>
          <FormattedMessage id="appHomeConfig.addGroup"/>
        </div> : null}
        <div className={styles.groupSpinWrap}>
          <CSpin spinning={loadingMoveGroup}>
            {this.mapToGetGroups(listData)}
          </CSpin>
        </div>
        {isUserCenter && (
          <div
            className={`${styles.blockWrap} ${styles.staticBlock} ${areaCode === 'staticBlock' && styles.active}`}
            onClick={() => this.handleSetArea('staticBlock')}
          >
            <p className={styles.tit}>
              <FormattedMessage id="appHomeConfig.userCenter.staticBlock"/>
            </p>
          </div>
        )}
        {!isUserCenter && (
          <div
            className={`${styles.blockWrap} ${styles.bottomWrap} ${areaCode === 40 && styles.active}`}
            onClick={() => this.handleSetArea(40)}
          >
            {this.mapToGetBundles(bottomList)}
          </div>
        )}
      </div>
    );
  }
}

export default HomeModel;
