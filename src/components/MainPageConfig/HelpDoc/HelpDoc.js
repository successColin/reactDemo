/*
 * @Author: Fus
 * @Date:   2020-02-04 10:10:07
 * @Desc: 帮助文档
 */
import { Component, Fragment } from 'react';
import { FormattedMessage } from 'react-intl';
import { Form, Modal, Upload } from 'antd';
import { connect } from 'dva';
import { CSpin, CButton, CMessage } from '@/components/common/BasicWidgets';
import AdvanceTable from '@/components/common/AdvanceTable/AdvanceTable';
import FooterButton from '../FooterButton/FooterButton';
import { getHelpDocList, getHelpDocTypeId, saveHelpDocSno } from '@/services/mainPageConfig';
import { deleteFile } from '@/services/fileManger';
import { BaseContext } from '@/constants/global';
import query from '@/constants/query';
import { getDefaultConfirmProps, getCookie } from '@/utils/common';
import styles from './HelpDoc.less';
import ModalBox from '@/components/common/ReminderBox/ReminderBox';

@connect(state => ({
  mainPageConfig: state.global.mainPageConfig,
  functionData: state.tabs.activeTabData.functionData,
}))
class HelpDoc extends Component {
  static contextType = BaseContext;
  state = {
    listData: [], // 列表数据
    selectedRows: [], // 已选的行数据
    loadingUpload: false, // 上传文件状态
    loadingSaveSno: false, // 保存按钮加载状态
    loadingList: false, // 列表数据加载状态
  };

  componentDidMount() {
    const { helpDoc } = this.props.mainPageConfig;
    this.setState({ listData: helpDoc });
  }

  // 获取列表数据
  fetchList = () => {
    this.context.dispatch({
      type: 'global/getMainPageHelpDoc',
      payload: {
        callback: listData => {
          this.setState({ listData });
        },
      },
    });
    // this.setState({ loadingList: true });
    // const doFetch = () => {
    //   const { typeId } = this.state;
    //   getHelpDocList({ typeId }).then(listData => {
    //     this.setState({ listData, loadingList: false, typeId });
    //   }, err => this.setState({ loadingList: false }));
    // };
    // if (this.state.typeId) {
    //   doFetch();
    //   return;
    // }
    // getHelpDocTypeId({ keycode: 'HELPDOCUMENT' }).then(res => {
    //   const { id: typeId } = res;
    //   this.setState({ typeId }, () => {
    //     doFetch();
    //   });
    // }, err => this.setState({ loadingList: false }));
  };
  // 点击删除
  handleClickDel = () => {
    const { langLib } = this.context;
    const { selectedRows } = this.state;
    const idArr = selectedRows.map(item => ({ id: item.id }));
    if (!selectedRows.length) {
      CMessage(langLib['message.error.noSelected'], 'error');
      return;
    }
    let { close } = ModalBox.confirm({
      ...getDefaultConfirmProps(langLib),
      onOk: () => {
         deleteFile({ filesJson: JSON.stringify(idArr) }).then(res => {
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
    //     return deleteFile({ filesJson: JSON.stringify(idArr) }).then(res => {
    //       CMessage(langLib['message.del.success']);
    //       this.fetchList();
    //       this.setState({ selectedRows: [] });
    //     });
    //   },
    // });
  };
  // 保存排序
  handleSaveOrder = () => {
    const { listData } = this.state;
    const { langLib } = this.context;
    this.setState({ loadingSaveSno: true });
    saveHelpDocSno({ fileList: listData }).then(res => {
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
  // 文件上传
  onChangeFile = ({ file, fileList }) => {
    const { status } = file;
    const { langLib } = this.context;
    this.setState({ loadingUpload: true });
    if (status === 'error') { // 上传异常
      this.setState({ loading: false });
      CMessage(langLib['file.error'], 'error');
      this.setState({ loadingUpload: false });
      return;
    } else if (status === 'done' && file.response) {
      CMessage(langLib['file.success'], 'success');
      this.setState({ loadingUpload: false });
      this.fetchList();
    }
  };
  // 获取列名
  getColumns = () => {
    const token = getCookie('token');
    return [
      {
        title: <FormattedMessage id="global.index"/>,
        dataIndex: 'sno',
      }, {
        title: <FormattedMessage id="global.name"/>,
        dataIndex: 'displayFileName',
        render: (text, record) => {
          const { id } = record;
          return (
            <a href={`${query.DOWNLOAD_FILE}?id=${id}&token=${token}`}>
              {text}
            </a>
          );
        },
      }, {
        title: <FormattedMessage id="global.format"/>,
        dataIndex: 'format',
      },
    ];
  };

  render() {
    const { listData, selectedRows, loadingSaveSno, loadingUpload } = this.state;
    const { mainPageConfig, functionData } = this.props;
    const { canmodify, canadd, candelete } = functionData.attributes;
    const { helpDocTypeId: typeId } = mainPageConfig;
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
    const listLength = listData.length;
    const sno = listLength ? listData[listLength - 1].sno + 1 : 1;
    const uploadProps = {
      className: styles.upload,
      action: query.FILE_UPLOAD,
      showUploadList: false,
      // accept: '.pdf',
      data: { typeId, sno, token: getCookie('token') },
      onChange: this.onChangeFile,
    };
    return (
      <div className={styles.wrap}>
        <CSpin spinning={loadingUpload}>
          <div className={styles.btnWrap}>
            {canadd ? <Upload {...uploadProps}>
              <CButton>
                <i className="iconfont iconUpload custom-color"/>
                <FormattedMessage id="global.uploadBasic"/>
              </CButton>
            </Upload> : null}
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
            className={styles.footer}
          /> : null}
        </CSpin>
      </div>
    );
  }
}

export default Form.create()(HelpDoc);
