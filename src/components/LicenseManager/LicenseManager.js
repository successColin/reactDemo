import React, { Component } from 'react';
import { message, Form } from 'antd';
import CMessage from '@/components/common/BasicWidgets/Widgets/CMessage/CMessage';
import DefaultFrame from '../Frames/DefaultFrame/DefaultFrame';
import { BaseContext } from '../../constants/global';
import FooterButton from '../common/FooterButton/FooterButton';
import FormDetial from './component/formDetial';
import cSpin from '../../components/common/BasicWidgets/Widgets/CSpin/CSpin';
import { getCompanyList, createLicFile, uploadLicFile, checkLicFile, getLicFileDetail } from '../../services/licenseManager';
import Styles from '@/components/CodingManager/CodingManger.less';


class LicenseManagerPage extends Component {
  static contextType = BaseContext;

  constructor(props) {
    super();
    this.state = {
      list: [], // 列表
      record: {}, // 实体值
      detial: {}, // 详情
      loading: false,
      loadingStatus: { // loading状态
        saveBtn: false, // 保存按钮
        getDetail: false, // 点击树节点获取详情
        getTree: false, // 获取树数据
      },
      licLinePramDtos: [], // 框架列表数据数据
      licName: '',
      flag: '',
    };
  }

  componentDidMount() {
    getCompanyList({}).then((res) => {
      this.setState({
        list: res,
        loading: true,
        record: res[0],
      }, () => {

        getLicFileDetail({ 'companyId': res[0].id }).then((data) => {
          this.setState({
            detial: data.licPramDto,
            loading: false,
            licLinePramDtos: data.licLinePramDtos,
            licName: '',
            flag: data.flag,
          });
        }).catch(err => {
          this.setState({
            loading: false,
          });
        });
      });
    });
  }

  /**
   * 列表某條數據的具體詳情
   * @param id
   */
  getListDetial = (record, n) => {
    this.props.form.resetFields();
    this.setState({ record, loading: true }, () => {
      getLicFileDetail({ 'companyId': record.id }).then((data) => {
        if (n) {
          this.setState({
            detial: data.licPramDto,
            loading: false,
            licLinePramDtos: data.licLinePramDtos,
            flag: data.flag,
          });
        } else {
          this.setState({
            detial: data.licPramDto,
            loading: false,
            licLinePramDtos: data.licLinePramDtos,
            licName: '',
            flag: data.flag,
          });
        }

      }).catch(err => {
        this.setState({
          loading: false,
        });
      });
    });
  };

  setList = () => {
    const { list } = this.state;
    return list.map((item, index) => {
      return (<li
        key={item.id}
        className={`${this.state.record.id === item.id ? 'licenseManagerOn' : ''} li`}
        onClick={() => this.getListDetial(item)}
              >
        <span className={`${Styles.iconStyle} custom-color iconfont iconTable`}></span>
        <span>{item.name || ''}</span>
      </li>);
    });
  };

  leftList = () => {
    return <ul className={Styles.listBox}>
      {this.setList()}
    </ul>;
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
  // 更新文件名称
  updateLicName = (name) => {
    this.setState({
      licName: name,
    });
  }
  // 点击保存
  onSubmit = () => {
    this.props.form.validateFields((errs, values) => {
      if (errs) return;
      this.setLoadingStatus('saveBtn', true);
      this.handleSave(values);
    });
  };
  // 保存
  handleSave = (values) => {
    const { langLib } = this.context;
    const { detial } = this.state;
    let params = Object.assign({}, detial, values);
    if (detial.id) {
      uploadLicFile(params).then(res => {
        CMessage(langLib['message.save.success']);
        this.setLoadingStatus('saveBtn', false);
        // this.fetchTree();
      }, err => this.setLoadingStatus('saveBtn', false));
    } else {
      params.planned = 1;
      createLicFile(params).then(res => {
        message.success(langLib['message.save.success']);
        this.setLoadingStatus('saveBtn', false);
        // this.fetchTree();
      }, err => this.setLoadingStatus('saveBtn', false)); ;
    }

  };

  render() {
    const { loadingStatus, detial, loading, licLinePramDtos, record, licName, flag } = this.state;
    const { form } = this.props;
    const btnConfigs = [{
      type: 'primary',
      onClick: this.onSubmit,
      loading: loadingStatus.saveBtn,
    }];
    const tabDefaultConfig = {
      loading: loadingStatus.getDetail, // 点击树节点获取详情
      data: detial,
      form: form,
      licLinePramDtos: licLinePramDtos,
      getListDetial: this.getListDetial,
      record: record,
      updateLicName: this.updateLicName,
      licName: licName,
      flag: flag,
    };
    const sider = this.leftList();
    let content = <cSpin spinning={loading}><FormDetial tabDefaultConfig={tabDefaultConfig}/></cSpin>;
    let footer = <FooterButton btnConfigs={btnConfigs}/>;
    return (
      <DefaultFrame
        sider={sider}
        content={content}
        // footer={footer}
      />
    );
  }
}

const LicenseManager = Form.create({})(LicenseManagerPage);
export default LicenseManager;
