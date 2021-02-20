/*
 * @Author: Fus
 * @Date:   2019-11-05 08:59:50
 * @Desc: 过滤器配置
 */
import { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { CSpin, CMessage } from '@/components/common/BasicWidgets';
import CreateModal from '@/components/common/CreateModal/CreateModal';
import ListTable from './ListTable/ListTable';
import { BaseContext } from '@/constants/global';
import { getElementFilterCond, insertOrUpdateElementFilterCond } from '@/services/pageConfig';
import styles from './FilterConfig.less';

class FilterConfig extends Component {
  static contextType = BaseContext
  static defaultProps = {
    elementData: {}, // 控件信息
    tabInfo: {}, // 面板信息
    isPC: true, // 调用处是否为PC（PC、APP）
  }
  state = {
    visible: false,
    loadingSave: false,
    loadingList: false,
    listData: [], // 数据源
  }
  // 获取控件过滤器信息
  fetchFilterData = () => {
    const { id: elementId } = this.props.elementData;
    this.setState({ loadingList: true });
    getElementFilterCond({ elementId }).then(listData => {
      this.setState({ loadingList: false, listData });
    }, err => this.setState({ loadingList: false }));
  }
  // 保存
  handleSave = () => {
    const { elementData, tabInfo, isPC } = this.props;
    const { langLib } = this.context;
    const { listData } = this.state;
    const { id: elementId } = elementData;
    const { id: tabId } = tabInfo;
    const tabIdKey = isPC ? 'tabId' : 'mobileTabId';
    const params = {
      elementFilterConditionList: listData,
      [tabIdKey]: tabId,
      elementId,
    };
    this.setState({ loadingSave: true });
    insertOrUpdateElementFilterCond(params).then(res => {
      CMessage(langLib['message.save.success']);
      this.setState({ loadingSave: false, visible: false });
    }, err => this.setState({ loadingSave: false }));
  }
  // 打开弹窗
  handleOpenModal = () => {
    const { readOnly } = this.props;
    if (readOnly) return;
    this.fetchFilterData();
    this.setState({ visible: true });
  }
  // 关闭弹窗
  handleCancel = () => {
    this.setState({
      visible: false,
      listData: [],
    });
  };
  updateWrapState = itemObj => {
    this.setState(itemObj);
  }
  render() {
    const { visible, loadingSave, listData, loadingList } = this.state;
    const modalProps = {
      visible,
      onOk: this.handleSave,
      onCancel: this.handleCancel,
      title: <FormattedMessage id="settingForm.mainTableFilterConfig" />,
      confirmLoading: loadingSave,
      className: styles.filterConfigModal,
      size: 'large',
    };
    return (
      <div className={styles.wrap}>
        <div onClick={this.handleOpenModal}>
          {this.props.children}
        </div>
        <CreateModal {...modalProps}>
          <CSpin spinning={loadingList}>
            <ListTable
              {...this.props}
              listData={listData}
              updateWrapState={this.updateWrapState}
            />
          </CSpin>
        </CreateModal>
      </div>
    );
  }
}
export default FilterConfig;