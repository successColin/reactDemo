import React, { Component } from 'react';
import { Upload, Row, Col, Progress, Form, Pagination, Popover } from 'antd';
import CButton from '@/components/common/BasicWidgets/Widgets/CButton/CButton';
import CTable from '@/components/common/BasicWidgets/Widgets/CTable/CTable';
import moment from 'moment';
import { connect } from 'dva';
import secret from '@/constants/secret';
import Cmodal from '@/components/ImportTemplate/component/modalDetial';
import Styles from '../ImportTemplateFiles.less';
import { FormattedMessage } from 'react-intl';
import { downLoadExcel, doCheckExce, getDoProcess, doExcelToDB } from '@/services/importTemplate';
import query from '@/constants/query';
import CMessage from '@/components/common/BasicWidgets/Widgets/CMessage/CMessage';
import { BaseContext } from '@/constants/global';

@connect(state => ({
  functionData: state.tabs.activeTabData.functionData,
  userInfo: state.user.userInfo,
}))
class ImportDetial extends Component {
  static contextType = BaseContext;

  constructor() {
    super();
    this.state = {
      excleName: '', // 文件名称
      formdata: [], // 文件流
      isDisabled: true, // 是否允许点击
      total: 0, // excel总条数
      successCount: 0, // 成功条数
      errorCount: 0, // 错误条数
      dataSoucre: [], // 错误数据
      loading: false,
      visible: false,
      importName: '', // 是否是导入
      type: 'preview', // 是否是检测或者是导入
      importStart: false, // 开始导入
      title: '', // 弹框名称
      uploadData: {}, // 上传的数据
      errMsg: '', // 后台返回的报错信息
      endRow: '', // 终止行值
    };
  }

// 下载excel
  downLoadExcel = () => {
    const { activeDetail, userInfo } = this.props;
    const token = userInfo.token;
    if (JSON.stringify(activeDetail) !== '{}') {
      let url = query.DOWNLOAD_EXCEL + '?importmodelId=' + activeDetail.id + '&token=' + token;
      const aElement = document.createElement('a');
      document.body.appendChild(aElement);
      aElement.style.display = 'none';
      aElement.href = url;
      aElement.click();
      document.body.removeChild(aElement);
    }
  };
  upload = (e) => {
    const { langLib } = this.context;
    if (e.file.status === 'done' && e.file.response.success) {
      const { id } = this.props.activeDetail;
      let res = e.file.response.data[0];
      var arg1 = /\.xls{1}$/;
      if (e.file.name.match(arg1) === null) {
        CMessage(langLib['message.error.excle'], 'error');
        this.setState({
          isDisabled: true,
          excleName: '',
        });
      } else {
        this.setState({
          excleName: e.file.name,
          errMsg: '',
          isDisabled: false,
          uploadData: res,
          importName: '',
          importStart: false,
          dataSoucre: [],
          total: 0, // excel总条数
          successCount: 0, // 成功条数
          errorCount: 0, // 错误条数
        });
        this.props.changeNumber(0);
      }
    } else {
      this.setState({
        isDisabled: false,
      });
    }
  };
  getProcess = (params, data) => {
    getDoProcess(params).then((res) => {
      if (JSON.stringify(res) !== '{}') {
        let list = [];
        const { msg, errorMsg } = res;
        if (!msg) {
          clearInterval(this.interval);
          this.setState({
            loading: false,
          });
          return;
        }
        let time = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
        Object.keys(msg).forEach((item, index) => {
          list.push({
            name: msg[item],
            planDate: time,
            stutas: 1,
            message: '',
            id: index,
          });
        });
        this.setState({
          errorCount: res.errorCount,
          successCount: res.successCount,
          total: res.total,
          dataSoucre: list,
        });
        let errorCount = Number(res.errorCount);
        let successCount = Number(res.successCount);
        let total = Number(res.total);
        this.props.changeNumber(errorCount);
        if (errorMsg) {
          this.setState({
            errMsg: errorMsg,
            loading: false,
            endRow: '',
          });
          clearInterval(this.interval);
        }
        if (errorCount + successCount >= total) {
          const { type } = this.state;
          if (type === 'preview') {
            if (successCount === total) {
              this.setState({
                importName: 'import',
                loading: false,
                endRow: data.endLen,
              });
            } else {
              this.setState({
                importName: '',
                loading: false,
                endRow: '',
              });
            }
          } else {
            this.setState({
              importName: 'import',
              loading: false,
            });
          }
          clearInterval(this.interval);
        }
      } else {
        // this.setState({
        //   loading: false,
        // });
        // clearInterval(this.interval);
      }
    }, (err) => {
      this.setState({
        loading: false,
        endRow: '',
      });
      clearInterval(this.interval);
    });
  };

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  toggle = (type) => {
    let title;
    if (type === 'preview') {
      title = <FormattedMessage id="import.down.preview"/>;
    } else {
      title = <FormattedMessage id="import.down.import"/>;
    }
    this.setState({
      visible: !this.state.visible,
      type,
      title,
    });
  };
  // 校验或者导入
  handleOk = () => {
    const { type } = this.state;
    let data = this.props.form.getFieldsValue();
    const { id } = this.props.activeDetail;
    const { uploadData } = this.state;
    let realFilePath = uploadData.realFilePath;
    if (type === 'preview') {
      this.setState({
        total: 0, // excel总条数
        successCount: 0, // 成功条数
        errorCount: 0, // 错误条数
        dataSoucre: [], // 错误数据
        importStart: false, // 开始导入
      });
      let isFlag;
      if (data.code && data.code1) {
        isFlag = 3;
      } else if (data.code && !data.code1) {
        isFlag = 1;
      } else if (!data.code && data.code1) {
        isFlag = 2;
      } else {
        isFlag = 3;
      }
      let params = {
        importmodelId: id,
        filePath: realFilePath,
        fileId: uploadData.id,
        startLen: data.startLen,
        endLen: data.endLen,
        checked: isFlag,
      };
      doCheckExce(params);
      let param = '?importmodelval=check' + id;
      this.interval = setInterval(() => this.getProcess(param, params), 5000);
      this.setState({
        visible: !this.state.visible,
        errMsg: '',
        loading: true,
      });
    } else {
      this.setState({
        total: 0, // excel总条数
        successCount: 0, // 成功条数
        errorCount: 0, // 错误条数
        dataSoucre: [], // 错误数据
        importStart: true, // 开始导入
      });
      this.props.changeNumber(0);
      let params = {
        importmodelId: id,
        filePath: realFilePath,
        fileId: uploadData.id,
        startLen: data.startLen,
        endLen: data.endLen,
        updateOrSkip: data.updateOrSkip,
      };
      doExcelToDB(params);
      let param = '?importmodelval=import' + id;
      this.interval = setInterval(() => this.getProcess(param), 5000);
      this.setState({
        visible: !this.state.visible,
        errMsg: '',
        loading: true,
      });
    }
  };


  render() {
    const { excleName, isDisabled, successCount, errorCount, total, dataSoucre, loading, visible, type, title, importName, importStart, errMsg, endRow } = this.state;
    let arr = JSON.parse(JSON.stringify(dataSoucre));
    const { langLib } = this.context;
    const { form, pageNum, pageSize, userInfo,functionData } = this.props;
    const { canmodify } = functionData.attributes;
    let dataList = arr.slice((pageNum - 1) * pageSize, pageNum * pageSize);
    let process = total ? ((Number(successCount) * 100000 + Number(errorCount) * 100000) / Number(total) / 100000).toFixed(2) : 0;
    const token = userInfo.token;
    const columns = [
      {
        title: <FormattedMessage id="import.down.name"/>,
        dataIndex: 'name',
        key: 'name',
        width: 200,
      },
      {
        title: <FormattedMessage id="import.down.date"/>,
        dataIndex: 'planDate',
        key: 'planDate',
        width: 180,
      },
      {
        title: <FormattedMessage id="import.down.stutas"/>,
        dataIndex: 'stutas',
        key: 'stutas',
        width: 100,
        render: (text, record, index) => {
          return <span>{record.stutas === 1 ? (
              <span><span className={Styles.errSty}></span><FormattedMessage id="global.unnormal"/></span>) :
            <FormattedMessage id="global.normal"/>}</span>;
        },
      },
      {
        title: <FormattedMessage id="import.down.news"/>,
        dataIndex: 'message',
        key: 'message',
        width: 100,
      },
    ];
    const modalConfig = {
      visible: visible,
      size: 'default',
      onCancel: this.toggle,
      type: type,
      title,
      form,
      endRow,
      className: Styles.modalSty,
      onOk: this.handleOk,
    };
    return (<div className={Styles.boxConten}>
        <Row style={{ 'height': '32px', 'margin': '8px 0' }}>
          <Col span={3}>
            <CButton className={Styles.download} onClick={() => {
              this.downLoadExcel();
            }}>
              <span className="iconDown iconfont custom-color"></span>
              <FormattedMessage id="import.down.mobox"/>
            </CButton>
          </Col>
          <Col span={1}></Col>
          <Col span={6}>
            <Upload
              disabled={!!!canmodify}
              showUploadList={false}
              className={Styles.import}
              // beforeUpload={() => false}
              accept=".xls"
              onChange={(e) => this.upload(e)}
              action={query.UPLOAD}
              data={{ tableName: secret.encrypt('importmodel'), token: token }}
            >
              <CButton className={Styles.import}>
                <span className="iconUpload iconfont custom-color"></span>{excleName}
              </CButton>
            </Upload>
          </Col>
          <Col span={5}>

          </Col>
          <Col span={2}>
            <Popover overlayStyle={{ 'width': '50%', 'minHeight': '300px', 'padding': '5px' }} content={errMsg}
                     title={langLib['error.msg']} trigger="hover">
              {errMsg ? <span className={`iconfont icon-import-warning ${Styles.warnningLight}`}></span> : null}
            </Popover>
          </Col>
          <Col span={3}>
            <CButton className={Styles.preview} disabled={isDisabled}
                     onClick={() => this.toggle('preview')}>
              <span className={`iconfont iconPreview ${excleName ? 'importActive' : ''}`}></span>
              <FormattedMessage id="import.down.preview"/>
            </CButton>
          </Col>
          <Col span={1}></Col>
          <Col span={3}>
            <CButton className={`${Styles.importDate} importTemplate_import`} disabled={importName ? false : true}
                     onClick={() => this.toggle('import')}>
              <span className={`iconfont iconImport ${importName ? 'importActive' : ''}`}></span>
              <FormattedMessage id="import.down.import"/>
            </CButton>
          </Col>
        </Row>
        <div className={Styles.line}></div>
        <Row className={Styles.boxLine}>
          <Col span={6} className={Styles.process}>
            <p>{
              importStart ? <FormattedMessage id="import.content.importproces"/> :
                <FormattedMessage id="import.content.process"/>
            }
              <span className={Styles.speNumber}> {(process * 100).toFixed(0)}%</span>
            </p>
            <Progress strokeColor="#FAB71C" percent={process * 100} showInfo={false}/>
          </Col>
          <Col span={6}>
            <p><span className={Styles.speNumber}>{total} </span><FormattedMessage id="import.down.col"/></p>
            <p className={Styles.commonSpe}><FormattedMessage id="import.down.total"/></p>
          </Col>
          <Col span={6}>
            <p><span className={Styles.speNumber}>{successCount} </span><FormattedMessage id="import.down.col"/></p>
            <p className={Styles.commonSpe}>{importStart ? <FormattedMessage id="import.done.import"/> :
              <FormattedMessage id="import.down.check"/>}</p>
          </Col>
          <Col span={6}>
            <p><span className={Styles.errNumber}>{errorCount} </span><FormattedMessage id="import.down.col"/></p>
            <p className={Styles.commonSpe}>{importStart ? <FormattedMessage id="import.done.err"/> :
              <FormattedMessage id="import.down.err"/>}</p>
          </Col>
        </Row>
        <div className={Styles.ctableClass}>
          <CTable
            columns={columns}
            dataSource={dataList}
            loading={loading}
            pagination={false}
            rowKey={record => record.id}
          />
        </div>
        <Cmodal
          {...modalConfig}
        />
      </div>
    );
  }
}

export default Form.create()(ImportDetial);
