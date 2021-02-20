/*
 * @Author: Fus
 * @Date:   2019-08-13 10:19:07
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2019-11-04 16:21:52
 * @Desc: 框架配置
 */
import { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'dva';
import { Select, Form } from 'antd';
import { CSelect, SplitLine, SearchSelect, CButton, CMessage } from '@/components/common/BasicWidgets';
import { BaseContext } from '@/constants/global';
import FormItems from '@/components/common/FormItems/FormItems';
import { FRAME_PAGE_TYPE, DATA_RESPONSE_TYPE } from '@/constants/pageConfig';
import phone from '@/assets/phone.png';
import styles from './FrameConfig.less';

const { Option } = Select;

// 框架类型
const frameTypeOption = Object.keys(FRAME_PAGE_TYPE).map(item => <Option value={item} key={`frameType${item}`}><FormattedMessage id={FRAME_PAGE_TYPE[item]} /></Option>);
// 数据响应类型
const dataResponseTypeOptions = Object.keys(DATA_RESPONSE_TYPE).map(item => <Option value={item} key={`dataResponseType${item}`}><FormattedMessage id={DATA_RESPONSE_TYPE[item]} /></Option>);

@connect(state => ({
  bundleConfig: state.bundleConfig,
}))
class FrameConfig extends Component {
  static contextType = BaseContext
  state = {
  }
  setRelateTables = (key, selectedRows = []) => {
    const tableObj = selectedRows[0] || {};
    this.props.form.setFieldsValue({
      [key]: tableObj.tableName,
    });
  }
  // 数据变更
  handelChangeData = (key, val) => {
    const { frameDetail } = this.props.bundleConfig;
    this.context.dispatch({
      type: 'bundleConfig/updateState',
      payload: {
        frameDetail: {
          ...frameDetail,
          [key]: val,
        },
      },
    });
  }
  // 表单配置项
  getFormItems = () => {
    const { frameDetail = {} } = this.props.bundleConfig;
    return [
      {
        key: 'basicLine-base',
        comType: 'static',
        colSpan: 24,
        component: <SplitLine title={<FormattedMessage id="splitLine.title.dataSource" />} />,
      // }, {
      //   key: 'datasource1',
      //   label: <FormattedMessage id="framePage.form.groupTable" />,
      //   config: {
      //     initialValue: frameDetail.datasource1,
      //   },
      //   component: (
      //     <SearchSelect
      //       key="mobileFrameDataSource1"
      //       modalContentType="relateTable"
      //       showType="list"
      //       otherQueryParams={{ initialData: 0 }}
      //       setSelected={selectedRows => this.setRelateTables('datasource1', selectedRows)}
      //     />
      //   ),
      }, {
        key: 'datasource2',
        label: <FormattedMessage id="framePage.form.dataTable" />,
        config: {
          initialValue: frameDetail.datasource2,
        },
        component: (
          <SearchSelect
            key="mobileFrameDataSource2"
            modalContentType="relateTable"
            showType="list"
            otherQueryParams={{ initialData: 0 }}
            setSelected={selectedRows => this.setRelateTables('datasource2', selectedRows)}
          />
        ),
      // }, {
      //   key: 'dataResponseType',
      //   label: <FormattedMessage id="framePage.form.dataResponseType" />,
      //   config: {
      //     initialValue: frame.dataResponseType ? `${frame.dataResponseType}` : '',
      //   },
      //   component: (
      //     <CSelect onChange={val => this.handelChangeData('dataResponseType', val)}>
      //       {dataResponseTypeOptions}
      //     </CSelect>
      //   ),
      },
    ];
  }
  render() {
    const { langLib } = this.context;
    const { form, handleSaveFrame, saveLoading } = this.props;
    return (
      <div className={styles.wrap}>
        <div className={styles.contentWrap}>
          <div className={styles.frameType}>
            <img src={phone} className={styles.img} alt={langLib['frameType.img.alt']} />
          </div>
          <div className={styles.content}>
            <FormItems
              form={form}
              formConfigs={this.getFormItems()}
              loading={false}
              className={styles.form}
            />
          </div>
        </div>
        <div className={styles.footer}>
          <CButton type="primary" onClick={handleSaveFrame} loading={saveLoading}>
            <FormattedMessage id="global.save" />
          </CButton>
        </div>
      </div>
    );
  }
}
export default FrameConfig;
