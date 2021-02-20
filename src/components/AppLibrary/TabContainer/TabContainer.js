/*
 * @Author: Fus
 * @Date:   2019-09-09 14:21:52
 * @Desc: app档案详情（包括：基本信息、app列表）
 */
import { Component, Fragment } from 'react';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';
import { BaseContext } from '@/constants/global';
import { Tabs, Form } from 'antd';
import { CButton } from '@/components/common/BasicWidgets';
import CreateModal from '@/components/common/CreateModal/CreateModal';
import SettingForm from './SettingForm/SettingForm';
import GroupForm from './GroupForm/GroupForm';
import AppList from './AppList/AppList';
import { insertOrUpdateApp } from '@/services/appLibrary';
import { formatTime } from '@/utils/common';
import styles from './TabContainer.less';

const { TabPane } = Tabs;

class TabContainer extends Component {
  static contextType = BaseContext;
  // static getDerivedStateFromProps(props, state) {
  //   if (props.)
  // }
  state = {
    visibleSettingModal: false, // 设置APP弹框
    isEdit: false, // 编辑状态or新增状态
    activeAppDetail: {}, // 当前APP信息
    loadingStatus: {
      getDetail: false,
      save: false,
    },
  };
  // 更新loading状态
  setLoadingStatus = (type, loading) => {
    const { loadingStatus } = this.state;
    this.setState({
      loadingStatus: {
        ...loadingStatus,
        [type]: loading,
      },
    });
  };
  // 打开新增APP入口
  handleOpenAdd = (isEdit, activeAppDetail = {}) => {
    this.setState({
      visibleSettingModal: true,
      isEdit,
      activeAppDetail,
    });
  };
  // 保存设置弹框
  handleSaveSettingForm = () => {
    const { activeTreeNodeDetail, fetchAppList } = this.props;
    const { isEdit, activeAppDetail } = this.state;
    this.settingForm.props.form.validateFieldsAndScroll((err, values) => {
      if (err) return;
      const { overdueDate } = values;
      const params = {
        installAtionPackAgeURL: '',
        ...values,
        overdueDate: overdueDate ? formatTime(overdueDate) : '',
        rootId: 0,
        groupId: activeTreeNodeDetail.id,
        id: isEdit ? activeAppDetail.id : '',
      };
      this.setLoadingStatus('save', true);
      insertOrUpdateApp(params).then(res => {
        this.setState({ visibleSettingModal: false });
        this.setLoadingStatus('save', false);
        fetchAppList();
        this.context.dispatch({ type: 'global/getQBlists' });
      }, err => this.setLoadingStatus('save', false));
    });
  };

  render() {
    const { visibleSettingModal, isEdit, activeAppDetail, loadingStatus } = this.state;
    const { activeDetail, loading, appList, form, activeTabKey, updateFrameState, fetchAppList, functionData } = this.props;
    const { canmodify, canadd } = functionData.attributes;
    const wrapCls = classNames({
      [styles.tabWrap]: true,
      'custom-pageConfig-tabs': true,
    });
    // tab栏右侧按钮
    const extraBtn = activeTabKey === 'appList' && canadd && (
      <CButton className={styles.addBtn} onClick={() => this.handleOpenAdd(false, {})}>
        <i className="iconfont icon-add-app custom-color"/>
        <FormattedMessage id="appLibrary.addApp"/>
      </CButton>
    );
    const groupFormProps = {
      // form,
      activeDetail,
      loading,
      wrappedComponentRef: form => this.groupForm = form,
    };
    const modalTit = <FormattedMessage id={`appLibrary.${isEdit ? 'settingApp' : 'addApp'}`}/>;
    return (
      <Fragment>
        <Tabs
          activeKey={activeTabKey}
          animated={false}
          className={wrapCls}
          tabBarExtraContent={extraBtn}
          onChange={activeTabKey => updateFrameState({ activeTabKey })}
        >
          <TabPane tab={<FormattedMessage id="appLibrary.tab.basic"/>} key="basicProps">
            <GroupForm {...groupFormProps} />
          </TabPane>
          <TabPane tab={<FormattedMessage id="applibrary.tab.appList"/>} key="appList">
            <AppList
              functionData={functionData}
              appList={appList}
              loading={loading}
              handleOpenAdd={this.handleOpenAdd}
              fetchAppList={fetchAppList}
            />
          </TabPane>
        </Tabs>
        <CreateModal
          visible={visibleSettingModal}
          maskClosable={false}
          title={modalTit}
          onCancel={() => this.setState({ visibleSettingModal: false })}
          onOk={() => {
            if (canmodify || (!isEdit && canadd)) {
              this.handleSaveSettingForm();
            } else {
              this.setState({ visibleSettingModal: false });
            }
          }}
          confirmLoading={loadingStatus.save}
        >
          <SettingForm
            activeAppDetail={activeAppDetail}
            loading={loading}
            wrappedComponentRef={form => this.settingForm = form}
          />
        </CreateModal>
      </Fragment>
    );
  }
}

export default TabContainer;
