/*
 * @Author: Fus
 * @Date:   2020-02-04 10:10:07
 * @Desc: 第三方链接
 */
import { Component, Fragment } from 'react';
import { FormattedMessage } from 'react-intl';
import { Form, Modal } from 'antd';
import { connect } from 'dva';
import { CTable, CButton, CMessage } from '@/components/common/BasicWidgets';
import CreateModal from '@/components/common/CreateModal/CreateModal';
import DetailForm from './DetailForm/DetailForm';
import AdvanceTable from '@/components/common/AdvanceTable/AdvanceTable';
import FooterButton from '../FooterButton/FooterButton';
import { saveThirdLink, getThirdLinkList, deleteThirdLink, saveThirdLinkSno } from '@/services/mainPageConfig';
import { BaseContext } from '@/constants/global';
import { getDefaultConfirmProps } from '@/utils/common';
import styles from './ThirdUrl.less';
import ModalBox from '@/components/common/ReminderBox/ReminderBox';

@connect(state => ({
  mainPageConfig: state.global.mainPageConfig,
  functionData: state.tabs.activeTabData.functionData,
}))
class ThirdUrl extends Component {
  static contextType = BaseContext;
  state = {
    visibleDetail: false, // 详情弹窗是否显示
    listData: [], // 列表数据
    activeDetail: {}, // 当前行数据
    selectedRows: [], // 已选的行数据
    loadingSaveSno: false, // 保存排序
    loadingSaveDetail: false, // 保存按钮加载状态
    loadingList: false, // 列表数据加载状态
  };

  componentDidMount() {
    const { thirdLink } = this.props.mainPageConfig;
    this.setState({ listData: thirdLink });
  }

  // 获取列表数据
  fetchList = () => {
    this.context.dispatch({
      type: 'global/getMainPageThirdLink',
      payload: {
        callback: (listData) => {
          this.setState({ listData });
        },
      },
    });
  };
  // 点击编辑
  handleClickEdit = () => {
    const { selectedRows } = this.state;
    const { langLib } = this.context;
    const selectedLength = selectedRows.length;
    if (selectedLength === 0) {
      CMessage(langLib['message.error.noSelected'], 'error');
      return;
    } else if (selectedLength > 1) {
      CMessage(langLib['message.error.onlyOne'], 'error');
      return;
    }
    this.setState({ activeDetail: selectedRows[0], visibleDetail: true });
  };
  // 点击删除
  handleClickDel = () => {
    const { langLib } = this.context;
    const { selectedRows } = this.state;
    const ids = selectedRows.map(item => item.id).join(',');
    if (!selectedRows.length) {
      CMessage(langLib['message.error.noSelected'], 'error');
      return;
    }
    let { close } = ModalBox.confirm({
      ...getDefaultConfirmProps(langLib),
      onOk: () => {
        deleteThirdLink({ ids }).then(res => {
          CMessage(langLib['message.del.success']);
          this.fetchList();
          closeModal();
          this.setState({ selectedRows: [] });
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
    //     return deleteThirdLink({ ids }).then(res => {
    //       CMessage(langLib['message.del.success']);
    //       this.fetchList();
    //       this.setState({ selectedRows: [] });
    //     });
    //   },
    // });
  };
  // 保存弹框内容
  handleSave = () => {
    const { listData } = this.state;
    const { langLib } = this.context;
    const { activeDetail } = this.state;
    this.props.form.validateFields((errs, values) => {
      if (errs) return;
      const { id, sno } = activeDetail;
      const listLen = listData.length;
      const maxSno = listLen ? listData[listLen - 1].sno + 1 : 1;
      const params = {
        ...activeDetail,
        ...values,
        sno: id ? sno : maxSno,
      };
      this.setState({ loadingSaveDetail: true });
      saveThirdLink(params).then(res => {
        CMessage(langLib['message.save.success'], 'success');
        this.setState({ loadingSaveDetail: false, visibleDetail: false });
        this.fetchList();
      }, err => this.setState({ loadingSaveDetail: false }));
    });
  };
  // 保存排序
  handleSaveOrder = () => {
    const { listData } = this.state;
    const { langLib } = this.context;
    this.setState({ loadingSaveSno: true });
    saveThirdLinkSno({ pcHomePageThirdPartyLinksList: listData }).then(res => {
      CMessage(langLib['message.save.success'], 'success');
      this.setState({ loadingSaveSno: false, visibleDetail: false });
      this.fetchList();
    }, err => this.setState({ loadingSaveSno: false }));
  };
  // 点击行
  onClickRow = (record) => {
    const { selectedRows } = this.state;
    let newSelectedRows = [...selectedRows];
    const recordIndex = selectedRows.findIndex(item => item.id === record.id);
    if (recordIndex === -1) {
      newSelectedRows.push(record);
    } else {
      newSelectedRows.splice(recordIndex, 1);
    }
    this.setState({ selectedRows: newSelectedRows });
  };
  // 关闭弹框
  handleCancelModal = () => {
    this.setState({
      visibleDetail: false,
      activeDetail: {},
    });
  };

  // 获取列名
  getColumns = () => {
    return [
      {
        title: <FormattedMessage id="global.index"/>,
        dataIndex: 'sno',
      }, {
        title: <FormattedMessage id="global.name"/>,
        dataIndex: 'name',
      }, {
        title: 'URL',
        dataIndex: 'url',
      }, {
        title: <FormattedMessage id="global.memo"/>,
        dataIndex: 'memo',
      },
    ];
  };
  // 更新状态
  updateFrameState = (itemObj, callback) => {
    this.setState({ ...itemObj }, () => {
      callback && callback();
    });
  };

  render() {
    const { visibleDetail, listData, activeDetail, selectedRows, loadingSaveDetail, loadingSaveSno } = this.state;
    const { form, functionData } = this.props;
    const { canmodify, canadd, candelete } = functionData.attributes;
    const selectedRowKeys = selectedRows.map(item => item.id);
    const rowSelection = {
      selectedRowKeys,
      onSelectAll: (selected, selectedRows, changeRows) => {
        this.setState({ selectedRows });
      },
      onSelect: (record, selected, selectedRows, nativeEvent) => {
        this.setState({ selectedRows });
      },
      onChange: (record, selected, selectedRows, nativeEvent) => {
        this.setState({ selectedRows });
      },
    };
    return (
      <div className={styles.wrap}>
        <div className={styles.btnWrap}>
          {canadd ? <CButton onClick={() => this.setState({ visibleDetail: true })}>
            <i className="iconfont icon-add-border custom-color"/>
            <FormattedMessage id="global.add"/>
          </CButton> : null}
          {canmodify ? <CButton onClick={this.handleClickEdit}>
            <i className="iconfont iconEdit custom-color"/>
            <FormattedMessage id="global.edit"/>
          </CButton> : null}
          {candelete ? <CButton onClick={this.handleClickDel}>
            <i className="iconfont icondelete custom-color"/>
            <FormattedMessage id="global.del"/>
          </CButton> : null}
        </div>
        <AdvanceTable
          className={styles.table}
          columns={this.getColumns()}
          dataSource={listData}
          pagination={false}
          rowSelection={rowSelection}
          onClickRow={this.onClickRow}
          setParentState={({ dataSource }) => this.setState({ listData: dataSource })}
          showOperator={false}
          rowKey="id"
        />
        {canmodify ? <FooterButton
          loading={loadingSaveSno}
          handleSubmit={this.handleSaveOrder}
        /> : null}
        <CreateModal
          visible={visibleDetail}
          title={(
            <Fragment>
              <FormattedMessage id={`global.${activeDetail.id ? 'edit' : 'new'}`}/>
              <FormattedMessage id="mainPageConfig.tab.url"/>
            </Fragment>
          )}
          onOk={this.handleSave}
          onCancel={this.handleCancelModal}
          confirmLoading={loadingSaveDetail}
          destroyOnClose={true}
        >
          <Form>
            <DetailForm
              form={form}
              activeDetail={activeDetail}
              updateFrameState={this.updateFrameState}
          />
          </Form>
        </CreateModal>
      </div>
    );
  }
}

export default Form.create()(ThirdUrl);
