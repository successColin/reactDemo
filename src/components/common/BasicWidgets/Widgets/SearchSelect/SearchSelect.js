/*
 * @Author: Fus
 * @Date:   2019-07-01 08:52:39
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2019-11-08 14:08:24
 * @Desc: 搜索选择框，由一个InputSearch和Modal组成
 */

import { Component, Fragment } from 'react';
import classNames from 'classnames';
import { Modal } from 'antd';
import { connect } from 'dva';
import { FormattedMessage } from 'react-intl';
import { CSearch, CButton, CMessage } from '@/components/common/BasicWidgets';
import CreateModal from '@/components/common/CreateModal/CreateModal';
import ModalContent from './ModalContent/ModalContent';
import { getDefaultConfirmProps } from '@/utils/common';
import { BaseContext } from '@/constants/global';
import { updateTriggerEvent } from '@/services/pageConfig';
import styles from './SearchSelect.less';

// 获取弹框标题
const getModalTit = (modalContentType, listName) => {
  switch (modalContentType) {
    case 'relateTable':
      return 'element.tablename';
    case 'tableColumn':
      return 'searchSelect.title.tableColumn';
    case 'icon':
      return 'global.iconLib';
    case 'triggerEvent':
      return 'connect.triggerEvent';
    case 'state':
      return 'settingForm.relationStateid';
    case 'priority':
      return 'settingForm.relationPriorityid';
    case 'type':
      return 'settingForm.relationTypeid';
    case 'function':
      return 'settingForm.functionId';
    case 'bundle':
      return 'settingForm.bundleId';
    default:
      return listName ? 'filemanger.table.choose' : '';
  }
};
const { confirm } = Modal;

@connect(state => ({
  triggerState: state.triggerState,
}))

class SearchSelect extends Component {
  static contextType = BaseContext;
  static defaultProps = {
    modalContentType: 'relateTable', // 内容类型 relateTable-关联表列表  tableColumn-关联字段 triggerEvent-触发器 state-状态 type-类型 priority-优先级 function-菜单 bundle-移动端菜单
    queryConfig: { // modalContentType为dynamic时，请求配置
      url: '', // 请求地址
    },
    showType: 'list', // 显示类型 list-列表 tree-树 icon-左侧树右侧图标列表 triggerEvent-触发器
    isReadOnly: false, // 是否只读
    otherQueryParams: {}, // 其他传参
    disabled: false,
    needCheckRoot: false, // 是否需要选择根节点
    rowKey: 'id', // 行标识符
    selectConfig: { // 选择数据配置
      isMulti: false, // 是否多选
      keyName: 'tableName', // 选择的key字段名
    },
    triggerEventConfig: { // 触发器配置
      elementData: {}, // 元素信息
      tabInfo: {}, // 面板信息
      doSaveFrameTab: () => {
      }, // 保存框架面板信息，有了对应的面板信息才可以进行关联触发器
    },
  };

  static getDerivedStateFromProps(props) {
    if ('value' in props) {
      return {
        inputVal: props.value || '',
      };
    }
    return null;
  }

  state = {
    visible: false, // modal是否显示
    selectedRows: [], // 已选择的数据
    headerKeywords: null, // 头部搜索内容
  };
  handleOk = () => {
    const { selectedRows } = this.state;
    const { modalContentType } = this.props;
    if (modalContentType === 'triggerEvent') {
      this.doSaveTriggerEvent();
    } else {
      this.setState({ loadingSave: true });
      this.props.setSelected(selectedRows);
      setTimeout(() => { // 该方法只能这么写，要不然引用的地方太多。改的也多
        this.handleCancel();
      }, 0);
    }
  };
  handleCancel = () => {
    this.setState({
      visible: false,
      headerKeywords: null,
      loadingSave: false,
      selectedRows: [],
    });
    this.props.modalContentType === 'triggerEvent' && this.context.dispatch({
      type: 'triggerState/clearState',
    });
  };
  // 点击清除
  handleClear = () => {
    this.setState({ selectedRows: [] }, () => {
      this.handleOk();
    });
  };

  // 保存触发器
  doSaveTriggerEvent = () => {
    const { langLib } = this.context;
    const { eventData } = this.props.triggerState;
    this.setState({ loadingSave: true });
    updateTriggerEvent({ triggerEventPramDtoList: eventData }).then(res => {
      CMessage(langLib['message.save.success']);
      this.setState({ loadingSave: false });
      this.handleCancel();
    }, err => this.setState({ loadingSave: false }));
  };
  // 点击搜索框，弹框出现前
  handleClickSearch = () => {
    const { isReadOnly, triggerEventConfig, disabled } = this.props;
    if (this.validBeforeShow() && !isReadOnly) {
      this.setState({ visible: true });
      // this.context.dispatch({
      //   type: 'triggerState/updateState',
      //   payload: { triggerEventConfig },
      // });
    }
  };
  // 弹框前校验
  validBeforeShow = () => {
    const { modalContentType, triggerEventConfig } = this.props;
    const { langLib } = this.context;
    switch (modalContentType) {
      case 'triggerEvent': {
        const { tabInfo, doSaveFrameTab } = triggerEventConfig;
        // if (!tabInfo.id) { // 需要先保存面板信息才可以进行关联
        //   confirm({
        //     ...getDefaultConfirmProps(langLib),
        //     title: langLib['confirm.saveFrame.title'],
        //     content: langLib['confirm.saveFrame.content'],
        //     onOk: () => {
        //       doSaveFrameTab();
        //     },
        //   });
        //   return false;
        // }
        return true;
      }
        ;
      default:
        return true;
    }
  };
  setWrapState = (itemObj, callback) => {
    this.setState(itemObj, () => callback && callback());
  };
  handleInputChange = (e) => {
    const inputVal = e.target.value;
    if (!('value' in this.props)) {
      this.setState({ inputVal });
    }
    this.triggerChange({ inputVal });
  };
  triggerChange = changedValue => {
    const { onChange } = this.props;
    if (onChange) {
      onChange(Object.assign({}, this.state, changedValue));
    }
  };

  render() {
    const { modalContentType, showType, selectConfig, isReadOnly, otherQueryParams, listName, rowKey, triggerEventConfig, disabled, name,needCheckRoot } = this.props;
    const { visible, selectedRows, inputVal, loadingSave, headerKeywords } = this.state;
    const titId = getModalTit(modalContentType, listName);
    const titName = titId && <FormattedMessage id={titId}/> || '';
    const isTriggerEvent = modalContentType === 'triggerEvent';
    const modalSearchCls = classNames({
      [styles.modalSearch]: true,
      // [styles.showInput]: !!headerKeywords,
      [styles.showInput]: true,
    });
    const title = (
      <Fragment>
        {titName}
        <CSearch
          className={modalSearchCls}
          onSearch={headerKeywords => this.setState({ headerKeywords })}
          onChange={e => !e.target.value && this.setState({ headerKeywords: null })}
        />
        {/* <span className={styles.split}>|</span> */}
      </Fragment>
    );
    // 底部栏按钮
    const footer = (
      <Fragment>
        <CButton onClick={this.handleClear}>
          <FormattedMessage id="global.clear"/>
        </CButton>
        <CButton onClick={this.handleCancel}>
          <FormattedMessage id="global.cancel"/>
        </CButton>
        <CButton type="primary" onClick={this.handleOk} loading={loadingSave}>
          <FormattedMessage id="global.ok"/>
        </CButton>
      </Fragment>
    );
    const modalProps = {
      visible,
      footer,
      onOk: this.handleOk,
      onCancel: this.handleCancel,
      title,
      confirmLoading: loadingSave,
      className: isTriggerEvent ? styles.triggerEventModal : styles.modal,
      size: isTriggerEvent ? 'large' : 'default',
    };
    const contentProps = {
      modalContentType,
      rowKey,
      showType,
      selectConfig,
      selectedRows,
      otherQueryParams,
      headerKeywords,
      needCheckRoot,
      setWrapState: this.setWrapState,
    };
    const searchCls = classNames({
      [styles.search]: true,
      [styles.readOnly]: !!isReadOnly,
      [styles.disabled]: disabled,
    });
    const wrapCls = classNames({
      [this.props.className]: this.props.className,
    });
    return (
      <div className={wrapCls}>
        <CSearch
          value={inputVal}
          onSearch={this.handleClickSearch}
          onChange={this.handleInputChange}
          className={searchCls}
          allowClear={false}
          disabled
          prefix={name ? (<span className={`iconfont icon-${name}`}></span>) : null}
        />
        <CreateModal {...modalProps}>
          <ModalContent {...contentProps} />
        </CreateModal>
      </div>
    );
  }
}

export default SearchSelect;
