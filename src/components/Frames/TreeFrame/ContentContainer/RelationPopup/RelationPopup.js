/*
 * @Author: Fus
 * @Date:   2019-10-11 14:42:42
 * @Desc: 关联弹出面板
 */
import { Component } from 'react';
import { Modal } from 'antd';
import { connect } from 'dva';
import CreateModal from '@/components/common/CreateModal/CreateModal';
import DetailList from '../DetailList/DetailList';
import ButtonLine from '../ButtonLine/ButtonLine';
import { getTreeFrameListData, batchInsertOrUpdatePageData, deletePageData } from '@/services/frame';
import { CMessage } from '@/components/common/BasicWidgets';
import { jsonParse, parseListData, getDefaultConfirmProps, getValueFromGlobalVariables } from '@/utils/common';
import { BaseContext } from '@/constants/global';
import styles from './RelationPopup.less';

const initQueryParams = {
  pageNum: 1,
  pageSize: 10,
};
@connect(state => ({
  userInfo: state.user.userInfo,
}))
class RelationPopup extends Component {
  static contextType = BaseContext
  state = {
    listQueryParams: initQueryParams,
    visible: false, // 是否可见
    relationAddBtn: {}, // 关联面板的新增按钮
    selectedListData: {}, // 关联面板选中的数据行
    selectedPopupList: [], // 弹出面板选中的数据行
    popupTabInfo: {}, // 弹出面板信息
    popupListDataResult: {}, // 弹出面板数据
    loadingStatus: {
      popupList: false, // 获取弹出面板数据
      savePopup: false, // 保存新增的数据
    },
  }
  // 获取弹出面板的数据
  fetchPopupListData = ({ searchQueryList = [] }) => {
    const { popupTabInfo, listQueryParams } = this.state;
    const { detailListProps, advancedQueryMap, userInfo } = this.props;
    const { pageSize, pageNum } = listQueryParams;
    const { elementMap, tabInfo, treeNodeData } = detailListProps;
    if (!popupTabInfo.id) return;
    const { id: tabId, relationTableName: tabSource } = popupTabInfo;
    const elementList = elementMap[tabId].map(item => {
      const { relationColumnName: name, basetype: baseType, mainColumnName, mainTableName, elementMultiRelation, id: elementId, relationColumnType, elementFormat } = item;
      return {
        elementId, name, baseType, mainColumnName, mainTableName, elementMultiRelation, relationColumnType,
        elementFormat,
      };
    });
    const queryList = advancedQueryMap[popupTabInfo.id] || [];
    const { id: nodeId } = treeNodeData;
    const globalMap = {};
    queryList.forEach(item => {
      const { asqlValueType, asqlValue } = item;
      // 值类型为【变量】时，需要将变量对应的值传给后台
      if (asqlValueType === 2) {
        // @@BusinessID 取左侧树的主业务数据（因为左侧树无法配置）
        if (asqlValue === '@@BusinessID') {
          globalMap[item.asqlValue] = nodeId;
        } else {
          // 当前时间、当前用户
          const globalVar = getValueFromGlobalVariables({
            globalVar: asqlValue,
            userInfo,
            treeNodeData,
          });
          // 或用户自定义的变量
          // (在关联新增按钮的弹出面板上，只有上一个面板为表单时，才可以获取自定义的变量)
          // （若上一个面板为列表，则无法定位到定义的变量具体哪条数据值）
          // 业务关联文档展示类型却是默认第一个面板为列表的，故无需在该组件中加入自定义变量
          globalMap[item.asqlValue] = globalVar || '';
        }
      }
    });
    const params = {
      elementList,
      tabId,
      tabSource,
      pageNum,
      pageSize,
      globalMap,
      calendarList: searchQueryList,
    };
    this.setLoadingStatus('popupList', true);
    getTreeFrameListData(params).then(res => {
      const popupListDataResult = parseListData({
        elementList: elementMap[tabId],
        listDataObj: res,
      });
      this.setState({
        popupListDataResult,
        loading: false,
        selectedPopupList: [],
      });
      this.setLoadingStatus('popupList', false);
    }, err => this.setLoadingStatus('popupList', false));
  }
  // 点击关联新增按钮
  handleClickRelationAddBtn = (relationAddBtn) => {
    const { relationTabId } = relationAddBtn;
    let popupTabInfo = {};
    // 该按钮有配置弹出面板
    if (relationTabId) {
      const { detailListProps } = this.props;
      const { tabList, elementMap } = detailListProps;
      popupTabInfo = tabList.find(item => item.id === relationTabId);
    }
    this.setState({ visible: true, popupTabInfo, relationAddBtn }, () => {
      this.fetchPopupListData({});
    });
  }
  // 保存弹框中选择的数据
  handleSave = () => {
    const { selectedPopupList, relationAddBtn, popupTabInfo } = this.state;
    const { detailListProps } = this.props;
    const { langLib } = this.context;
    if (!selectedPopupList.length) {
      CMessage(langLib['message.please.choose'], 'error');
      return;
    }
    const { treeNodeData, tabInfo, fetchListData, elementMap } = detailListProps;
    const { relationColumn, relationTableName } = tabInfo;
    // 将选中的数据加入传参
    const { relationColumnName: addBtnRelationColumnName } = relationAddBtn;
    const static_list = selectedPopupList.map(item => ({
      static_tableName: relationTableName,
      [relationColumn]: treeNodeData.id,
      [addBtnRelationColumnName]: item.id && item.id.id || '',
    }));
    this.setLoadingStatus('savePopup', true);
    batchInsertOrUpdatePageData({ static_list }).then(res => {
      CMessage(langLib['message.save.success']);
      this.setLoadingStatus('savePopup', false);
      this.handleCloseModal();
      fetchListData({});
    }, err => this.setLoadingStatus('savePopup', false));
  }
  // // 删除选中的数据
  // handleDeleteBtn = (btn) => {
  //   const { relationTableName: tableName } = btn;
  //   const { selectedListData } = this.state;
  //   const { fetchListData } = this.props.detailListProps;
  //   const { langLib } = this.context;
  //   const { id: idStr } = selectedListData;
  //   const id = jsonParse(idStr).id;
  //   if (!id) {
  //     CMessage(langLib['message.error.noSelected'], 'error');
  //     return;
  //   }
  //   Modal.confirm({
  //     ...getDefaultConfirmProps(langLib),
  //     onOk: () => {
  //       return deletePageData({ tableName, id }).then(res => {
  //         CMessage(langLib['message.del.success']);
  //         fetchListData({});
  //       });
  //     },
  //   });
  // }
  // 关闭窗口
  handleCloseModal = () => {
    this.setState({
      visible: false,
      listQueryParams: initQueryParams,
      selectedPopupList: [],
      popupListDataResult: {},
    });
  }
  // 更新主区块loading状态
  setLoadingStatus = (type, loading) => {
    const { loadingStatus } = this.state;
    this.setState({
      loadingStatus: {
        ...loadingStatus,
        [type]: loading,
      },
    });
  }
  setRelationPopupState = (itemObj, callback) => {
    this.setState(itemObj, () => callback && callback());
  }
  render() {
    const { visible, popupTabInfo, loadingStatus, popupListDataResult, selectedPopupList, listQueryParams } = this.state;
    const { detailListProps, footerBtnProps } = this.props;
    const modalProps = {
      visible,
      confirmLoading: loadingStatus.savePopup,
      onCancel: this.handleCloseModal,
      onOk: this.handleSave,
      title: popupTabInfo.name,
      size: 'large',
    };
    const BtnLine = (
      <ButtonLine
        {...footerBtnProps}
        fromType="relationPopup"
        handleClickRelationAddBtn={this.handleClickRelationAddBtn}
        handleDeleteBtn={this.handleDeleteBtn}
      />
    );
    return (
      <div className={styles.wrap}>
        <div className={styles.listWrap}>
          <DetailList
            {...detailListProps}
            // setSelected={(selectedListData = {}) => this.setState({ selectedListData })}
            BtnLine={BtnLine}
          />
        </div>
        <CreateModal {...modalProps}>
          <div className={styles.modalContent}>
            <DetailList
              {...detailListProps}
              tabInfo={popupTabInfo}
              loading={loadingStatus.popupList}
              listDataObj={popupListDataResult}
              tableCls={styles.popupTable}
              listSelectedRows={selectedPopupList}
              fetchListData={this.fetchPopupListData}
              setSelected={selectedPopupList => this.setState({ selectedPopupList })}
              setContainerState={this.setRelationPopupState}
              listQueryParams={listQueryParams}
            />
          </div>
        </CreateModal>
      </div>
    );
  }
}
export default RelationPopup;