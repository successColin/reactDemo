import React, { Component } from 'react';
import { Card, Row, Col } from 'antd';
import { FormattedMessage } from 'react-intl';
import ReactToPrint from 'react-to-print';
import moment from 'moment';
import { CButton, CDatePicker } from '@/components/common/BasicWidgets';
import FormItems from '@/components/common/FormItems/FormItems';
import { VALID_REQUIRED_MESSAGE } from '@/constants/global';
import NormalSearchSelect from '@/components/userManager/component/NormalSearchSelect/NormalSearchSelect';
import Styles from './SearchQuery.less';
import { jsFunctions } from '@/constants/jsTriggerFunctions';

const dateFormat = 'YYYY-MM-DD HH:mm:ss';

class SearchQuery extends Component {
  constructor() {
    super();
    this.state = {
      start: this.getInitCurrentYear(),
      end: this.getInitCurrentDay(),
    };
  }

  componentDidMount() {
    // this.init();
  }

  init = () => {
    const { form } = this.props;
    form.setFieldsValue({
      startDate: moment(this.getInitCurrentYear()),
      endDate: moment(this.getInitCurrentDay()),
    });
  };

  getInitCurrentYear = () => {
    // 获取今年第一天
    let date = new Date();
    let year = date.getFullYear();
    let firstMonth = year + '-' + '01' + '-' + '01 00:00:00';
    return firstMonth;
  };
  getInitCurrentDay = () => {
    // 获取当前日期
    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    if (month < 10) {
      month = '0' + month;
    }
    if (day < 10) {
      day = '0' + day;
    }
    ;
    let currentdate = year + '-' + month + '-' + day + ' 00:00:00';
    return currentdate;
  };


  handleSetSelectSearchValue = (selected = []) => {
    const { form } = this.props;
    if (selected.length) {
      form && form.setFieldsValue({ 'IGNORE_FORM_ITEM_nodeId': selected[0].name, 'nodeId': selected[0].id });
    }
  };
  changeTime = (time, key) => {
    this.setState({
      [key]: time,
    });
  };
  getFormConfig = () => {
    const { form } = this.props;
    const { start, end } = this.state;
    const jsTriggerParamObj = { startTime: moment(start), endTime: moment(end) };
    const publicBasicConfig = [
      {
        key: 'startDate',
        colSpan: 8,
        label: <FormattedMessage id="global.starttime"/>,
        config: {
          rules: [{
            required: false,
            message: VALID_REQUIRED_MESSAGE,
          }],
          initialValue: moment(start),
        },
        component: <CDatePicker allowClear={true}
                                showTime={true}
                                disabledDate={current => jsFunctions.getDatePickerRange(current, jsTriggerParamObj)}
                                onChange={(val) => this.setState({ start: val })}
                                disabledTime={current => jsFunctions.getDatePickerRange(current, jsTriggerParamObj)}
                                format={dateFormat}

        />,

      }, {
        key: 'endDate',
        colSpan: 8,
        label: <FormattedMessage id="global.endtime"/>,
        config: {
          rules: [{
            required: false,
            message: VALID_REQUIRED_MESSAGE,
          }],
          initialValue: moment(end),
        },
        component: (<CDatePicker
          allowClear={true}
          onChange={(val) => this.setState({ end: val })}
          showTime={true}
          format={dateFormat}
          disabledDate={current => jsFunctions.getDatePickerRange(current, jsTriggerParamObj)}
          disabledTime={current => jsFunctions.getDatePickerRange(current, jsTriggerParamObj)}/>),
      }, {
        key: 'nodeId',
        colSpan: 8,
        label: '位置',
        component: (
          <NormalSearchSelect
            form={form}
            type="position"
            setSelected={selecteds => this.handleSetSelectSearchValue(selecteds)}
          />
        ),
        hasHidden: true,
        config: {
          rules: [{
            required: false,
            message: VALID_REQUIRED_MESSAGE,
          }],
          initialValue: '',
        },
      },
    ];

    return [
      ...publicBasicConfig,
    ];
  };
  rest = () => {
    this.init();
    setTimeout(() => {
      this.props.submit();
    }, 0);
  };

  render() {
    const { form, rest, submit, exportPdf } = this.props;
    return <Card className={Styles.searchWrap}>
      <Row>
        <Col span={18}>
          <FormItems
            formConfigs={this.getFormConfig()}
            form={form}
            loading={false}
          />
        </Col>
        <Col span={6}>
          <div className={Styles.searchBtnWrap}>
            <CButton type="primary" onClick={submit}>查询</CButton>
            <CButton onClick={this.rest}>重置</CButton>
            <CButton onClick={exportPdf}><span
              className={`iconExport iconfont custom-color ${Styles.export}`}></span>导出</CButton>
            {/*<ReactToPrint*/}
            {/*  trigger={() => <CButton><span*/}
            {/*    className={`iconExport iconfont custom-color ${Styles.export}`}></span>导出</CButton>}*/}
            {/*  content={() => this.props.dom}*/}
            {/*  copyStyles={true}*/}
            {/*/>*/}
          </div>
        </Col>

      </Row>
    </Card>;
  }
}

export default SearchQuery;
