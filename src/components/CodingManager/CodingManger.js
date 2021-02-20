import React, { Component } from 'react';
import { message, Form, Spin } from 'antd';
import { connect } from 'dva';
import CMessage from '@/components/common/BasicWidgets/Widgets/CMessage/CMessage';
import DefaultFrame from '../Frames/DefaultFrame/DefaultFrame';
import { BaseContext } from '../../constants/global';
import FooterButton from '../common/FooterButton/FooterButton';
import FormDetial from './component/formDetial';
import cSpin from '../../components/common/BasicWidgets/Widgets/CSpin/CSpin';
import { getTableList, getCodeDetial, update, insert } from '../../services/codingManger';
import Styles from '@/components/CodingManager/CodingManger.less';

@connect(state => ({
  functionData: state.tabs.activeTabData.functionData,
}))
class CodingMangerPage extends Component {
  static contextType = BaseContext;

  constructor(props) {
    super();
    this.state = {
      list: [], // 列表
      record: {}, // 实体值
      detial: {}, // 详情
      loading: false,
      keywords: '', // 关键字
      loadingStatus: { // loading状态
        saveBtn: false, // 保存按钮
        getDetail: false, // 点击树节点获取详情
        getTree: false, // 获取树数据
      },
    };
  }

  componentDidMount() {
    this.fetchListData();
  }

  fetchListData = () => {
    const { keywords } = this.state;
    getTableList({ keywords }).then((res = []) => {
      this.setState({
        list: res,
        loading: true,
        record: res[0] || {},
      }, () => {
        if (!res.length) {
          this.setState({
            detial: {},
            loading: false,
          });
          return;
        }
        getCodeDetial(res[0].tableName).then((data) => {
          this.setState({
            detial: data,
            loading: false,
          });
        }).catch(err => {
          this.setState({
            loading: false,
          });
        });
      });
    });

  };

  /**
   * 列表某條數據的具體詳情
   * @param id
   */
  getListDetial = (record) => {
    this.props.form.resetFields();
    this.setState({ record, loading: true }, () => {
      getCodeDetial(record.tableName).then((data) => {
        this.setState({
          detial: data,
          loading: false,
        });
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
        className={`${this.state.detial.tableName === item.tableName ? 'licenseManagerOn' : ''} li`}
        onClick={() => this.getListDetial(item)}
      >
        <span className={`${Styles.iconStyle}  iconfont iconTable custom-color`}></span>
        <span>{item.tableName || ''}</span>
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
      update(params).then(res => {
        CMessage(langLib['message.save.success']);
        this.setLoadingStatus('saveBtn', false);
        // this.fetchTree();
      }, err => this.setLoadingStatus('saveBtn', false));
    } else {
      params.planned = 1;
      insert(params).then(res => {
        message.success(langLib['message.save.success']);
        this.setLoadingStatus('saveBtn', false);
        this.getListDetial(res);
      }, err => this.setLoadingStatus('saveBtn', false));
      ;
    }

  };

  render() {
    const { loadingStatus, detial, loading } = this.state;
    const { form, functionData } = this.props;
    const { canmodify, canadd } = functionData.attributes;
    const btnConfigs = [{
      type: 'primary',
      onClick: this.onSubmit,
      loading: loadingStatus.saveBtn,
    }];
    const tabDefaultConfig = {
      loading: loadingStatus.getDetail, // 点击树节点获取详情
      data: detial,
      form: form,
    };
    const sider = this.leftList();
    let content = <Spin spinning={loading}><FormDetial tabDefaultConfig={tabDefaultConfig}/></Spin>;
    let footer = canmodify && <FooterButton btnConfigs={btnConfigs}/>;
    return (
      <DefaultFrame
        sider={sider}
        content={content}
        footer={footer}
        config={{
          handleSearch: keywords => this.setState({ keywords }, () => this.fetchListData()),
        }}
      />
    );
  }
}

const CodingManger = Form.create({})(CodingMangerPage);
export default CodingManger;
