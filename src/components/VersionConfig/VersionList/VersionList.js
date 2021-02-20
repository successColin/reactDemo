/*
 * @Author: Fus
 * @Date:   2020-02-07 09:38:36
 * @Desc: 版本列表
 */
import { Component, Fragment } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'dva';
import { Form, Modal } from 'antd';
import { CTable, CButton, CMessage } from '@/components/common/BasicWidgets';
import CreateModal from '@/components/common/CreateModal/CreateModal';
import { BaseContext } from '@/constants/global';
import DetailForm from '../DetailForm/DetailForm';
import {
  saveSystemVersion,
  getSystemVersionList,
  getSystemVersionDetail,
  deleteSystemVersion,
} from '@/services/versionConfig';
import { getDefaultConfirmProps, formatTime } from '@/utils/common';
import styles from './VersionList.less';
import ModalBox from '@/components/common/ReminderBox/ReminderBox';

@connect(state => ({
  functionData: state.tabs.activeTabData.functionData,
}))
class VersionList extends Component {
  static contextType = BaseContext;
  static defaultProps = {
    basetype: 1, // 版本类型（1-pc端，2-app端）
  };
  state = {
    visibleDetail: false, // 详情框是否显示
    listData: [], // 列表数据
    loadingGetDetail: false, // 获取详情
    loadingSaveDetail: false, // 保存详情
    loadingList: false, // 加载列表
    activeDetail: {}, // 当前行数据
    selectedRows: [], // 选中的数据
    total: 0, // 总数据
    queryParam: {
      pageSize: 10,
      pageNum: 1,
      basetype: 1,
    },
  };

  componentDidMount() {
    this.fetchList();
  }

  // 获取列表数据
  fetchList = () => {
    const { queryParam } = this.state;
    const { basetype } = this.props;
    this.setState({ loadingList: true });
    getSystemVersionList({ ...queryParam, basetype }).then(res => {
      const { list = [], total = 0 } = res;
      const listData = list.map((item, index) => ({ ...item, sno: index + 1 }));
      this.setState({
        loadingList: false,
        listData,
        total,
      });
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
    const { id } = selectedRows[0];
    this.setState({ loadingGetDetail: true, visibleDetail: true });
    getSystemVersionDetail({ id }).then(res => {
      this.setState({
        activeDetail: res,
        loadingGetDetail: false,
      });
    }, err => this.setState({ loadingGetDetail: false }));
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
        return deleteSystemVersion({ ids }).then(res => {
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
    //     return deleteSystemVersion({ ids }).then(res => {
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
    const { langLib, dispatch } = this.context;
    const { basetype } = this.props;
    const { activeDetail } = this.state;
    this.props.form.validateFields((errs, values) => {
      if (errs) return;
      const { id, sno } = activeDetail;
      const listLen = listData.length;
      const { upgradeTime } = values;
      const params = {
        ...activeDetail,
        ...values,
        basetype,
        upgradeTime: upgradeTime ? formatTime(upgradeTime) : '',
      };
      this.setState({ loadingSaveDetail: true });
      saveSystemVersion(params).then(res => {
        CMessage(langLib['message.save.success'], 'success');
        this.setState({ loadingSaveDetail: false, visibleDetail: false, activeDetail: {} });
        this.fetchList();
        if (basetype === 1) { // 更新头部的当前版本信息
          dispatch({
            type: 'global/updateState',
            payload: {
              systemVersion: res,
            },
          });

        }
      }, err => this.setState({ loadingSaveDetail: false }));
    });
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
  getColumns = () => {
    const renderTitText = text => <span title={text}>{text}</span>;
    return [{
      title: <FormattedMessage id="global.index"/>,
      dataIndex: 'sno',
      width: '10%',
      render: text => renderTitText(text),
    }, {
      title: <FormattedMessage id="global.keycode"/>,
      dataIndex: 'keycode',
      width: '10%',
      render: text => renderTitText(text),
    }, {
      title: <FormattedMessage id="versionConfig.version.name"/>,
      dataIndex: 'name',
      width: '20%',
      render: text => renderTitText(text),
    }, {
      title: <FormattedMessage id="versionConfig.version.version"/>,
      dataIndex: 'version',
      width: '10%',
      render: text => renderTitText(text),
    }, {
      title: <FormattedMessage id="versionConfig.version.upgradeTime"/>,
      dataIndex: 'upgradeTime',
      render: text => text ? renderTitText(formatTime(text)) : '',
      width: '20%',
    }, {
      title: <FormattedMessage id="versionConfig.version.memo"/>,
      dataIndex: 'memo',
      width: '30%',
      render: text => renderTitText(text),
    }];
  };

  render() {
    const { visibleDetail, listData, activeDetail, loadingSaveDetail, loadingList, loadingGetDetail, selectedRows, total, queryParam } = this.state;
    const { form, functionData } = this.props;
    const { canmodify, canadd, candelete } = functionData.attributes;
    const { pageNum, pageSize } = queryParam;
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
    const pagination = {
      total,
      current: pageNum,
      pageSize,
      onChange: (pageNum, newPageSize) => {
        this.setState({
          selectedRows: [],
          queryParam: {
            ...queryParam,
            pageNum,
            pageSize: newPageSize,
          },
        }, () => this.fetchList());
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
        <CTable
          className={styles.table}
          columns={this.getColumns()}
          pagination={pagination}
          dataSource={listData}
          loading={loadingList}
          rowSelection={rowSelection}
          onClickRow={this.onClickRow}
          rowKey="id"
        />
        <CreateModal
          visible={visibleDetail}
          title={(
            <Fragment>
              <FormattedMessage id={`global.${activeDetail.id ? 'edit' : 'new'}`}/>
              <FormattedMessage id="versionConfig.version.memo"/>
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
              loadingGetDetail={loadingGetDetail}
            />
          </Form>
        </CreateModal>
      </div>
    );
  }
}

export default Form.create()(VersionList);
