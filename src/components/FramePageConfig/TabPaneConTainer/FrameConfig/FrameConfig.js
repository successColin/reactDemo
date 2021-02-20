/*
 * @Author: Fus
 * @Date:   2019-08-13 10:19:07
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2019-12-16 14:45:45
 * @Desc: 框架配置
 */
import { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'dva';
import { Select, Form } from 'antd';
import { CSelect, SplitLine, SearchSelect, CButton, CMessage } from '@/components/common/BasicWidgets';
import { BaseContext } from '@/constants/global';
import FormItems from '@/components/common/FormItems/FormItems';
import { DATA_RESPONSE_TYPE, NODE_FORMAT_TYPE } from '@/constants/pageConfig';
import frame_1 from '@/assets/frame_1.png';
import frame_2 from '@/assets/frame_2.png';
import frame_3 from '@/assets/frame_3.png';
import frame_4 from '@/assets/frame_4.png';
import styles from './FrameConfig.less';
const frameImg = { frame_1, frame_2, frame_3, frame_4 };

const { Option } = Select;

// 数据响应类型
const dataResponseTypeOptions = Object.keys(DATA_RESPONSE_TYPE).map(item => <Option value={+item} key={`dataResponseType${item}`}><FormattedMessage id={DATA_RESPONSE_TYPE[item]} /></Option>);
// 节点类型
const nodeFormatOptions = Object.keys(NODE_FORMAT_TYPE).map(item => <Option value={+item} key={`nodeFormat${item}`}><FormattedMessage id={NODE_FORMAT_TYPE[item]} /></Option>);

@connect(state => ({
  framePage: state.framePage,
}))
class FrameConfig extends Component {
  static contextType = BaseContext
  state = {
  }
  setSelected = (key, selectedRows = [], fieldName = 'tableName') => {
    const tableObj = selectedRows[0] || {};
    const val = tableObj[fieldName] || '';
    this.handelChangeData(key, val);
  }
  // 数据变更
  handelChangeData = (key, val) => {
    this.context.dispatch({
      type: 'framePage/updateFrameData',
      payload: {
        [key]: val,
      },
    });
  }
  // 表单配置项
  getFormItems = () => {
    const { frame = {}, frameTypeDto = {} } = this.props.framePage;
    const { basetype } = frameTypeDto;
    const configs = [
      {
        key: 'basicLine-base',
        comType: 'static',
        colSpan: 24,
        component: <SplitLine title={<FormattedMessage id="splitLine.title.dataSource" />} />,
      }, {
        key: 'datasource1',
        label: <FormattedMessage id="framePage.form.groupTable" />,
        config: {
          initialValue: frame.datasource1,
        },
        ignore: !(basetype === 1 || basetype === 6),
        component: (
          <SearchSelect
            modalContentType="relateTable"
            showType="list"
            otherQueryParams={{ initialData: 0 }}
            setSelected={selectedRows => this.setSelected('datasource1', selectedRows)}
          />
        ),
      }, {
        key: 'datasource2',
        label: <FormattedMessage id="framePage.form.dataTable" />,
        config: {
          initialValue: frame.datasource2,
        },
        component: (
          <SearchSelect
            modalContentType="relateTable"
            showType="list"
            otherQueryParams={{ initialData: 0 }}
            setSelected={selectedRows => this.setSelected('datasource2', selectedRows)}
          />
        ),
      }, {
        key: 'dataResponseType',
        label: <FormattedMessage id="framePage.form.dataResponseType" />,
        config: {
          initialValue: frame.dataResponseType || 1,
        },
        ignore: !(basetype === 1 || basetype === 6),
        component: (
          <CSelect onChange={val => this.handelChangeData('dataResponseType', val)}>
            {dataResponseTypeOptions}
          </CSelect>
        ),
      }, {
        key: 'exint1',
        label: <FormattedMessage id="framePage.form.nodeFormat" />,
        config: {
          initialValue: frame.exint1 || 1,
        },
        ignore: !(basetype === 1 || basetype === 6),
        component: (
          <CSelect onChange={val => this.handelChangeData('exint1', val)}>
            {nodeFormatOptions}
          </CSelect>
        ),
      }, {
        key: 'groupIconId',
        label: <FormattedMessage id="framePage.form.groupIconId" />,
        config: {
          initialValue: frame.groupIconId || '',
        },
        ignore: !(basetype === 1 || basetype === 6),
        component: (
          <SearchSelect
            modalContentType="icon"
            showType="icon"
            setSelected={selectedRows => this.setSelected('groupIconId', selectedRows, 'id')}
          />
        ),
      }, {
        key: 'dataIconId',
        label: <FormattedMessage id="framePage.form.dataIconId" />,
        config: {
          initialValue: frame.dataIconId || '',
        },
        ignore: !(basetype === 1 || basetype === 6),
        component: (
          <SearchSelect
            modalContentType="icon"
            showType="icon"
            setSelected={selectedRows => this.setSelected('dataIconId', selectedRows, 'id')}
          />
        ),
      }, {
        key: 'groupColumn',
        label: <FormattedMessage id="framePage.form.groupColumn" />,
        config: {
          initialValue: frame.groupColumn || '',
        },
        ignore: !(basetype === 1 || basetype === 6),
        component: (
          <SearchSelect
            modalContentType="tableColumn"
            showType="list"
            otherQueryParams={{ tableName: frame.datasource2 }}
            selectConfig={{
              isMulti: false,
              keyName: 'columnName',
            }}
            setSelected={selectedRows => this.setSelected('groupColumn', selectedRows, 'columnName')}
          />
        ),
      },
    ];
    return configs;
  }
  // 更新数据层
  updateState = (frame) => {
    this.context.dispatch({
      type: 'framePage/updateState',
      payload: { frame },
    });
  }
  render() {
    const { langLib } = this.context;
    const { framePage, form, handleSaveFrame, saveLoading, functionData } = this.props;
    const { frameTypeDto = {} } = framePage;
    const { getFieldDecorator } = form;
    const { canmodify } = functionData.attributes;

    const imgSrc = frameImg[`frame_${frameTypeDto.basetype}`] || frame_1;
    return (
      <div className={styles.wrap}>
        <div className={styles.contentWrap}>
          <div className={styles.frameType}>
            <Form.Item label="">
              {getFieldDecorator('frameTypeId', {
                initialValue: frameTypeDto.basetype,
              })(
                <CSelect disabled className={styles.select} onChange={val => this.handelChangeData('basetype', val)}>
                  <Option value={frameTypeDto.id}>{frameTypeDto.name}</Option>
                </CSelect>
              )}
            </Form.Item>
            <img src={imgSrc} className={styles.img} alt={langLib['frameType.img.alt']} />
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
          {canmodify ? <CButton type="primary" onClick={handleSaveFrame} loading={saveLoading}>
            <FormattedMessage id="global.ok" />
          </CButton> : null}
        </div>
      </div>
    );
  }
}
export default FrameConfig;
