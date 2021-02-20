import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Input, message, Form } from 'antd';
import { CButton, CSpin } from '@/components/common/BasicWidgets';
import { BaseContext } from '@/constants/global';
import FormItems from '@/components/common/FormItems/FormItems';
import CreateModal from '@/components/common/CreateModal/CreateModal';
import VisualGroup from '@/components/VisualMapConfig/VisualGroup/VisualGroup';
import { SketchPicker } from 'react-color';
import { connect } from 'dva';
import { insertVisualConfig, updateVisualConfig, getVisualConfig } from '@/services/visualMap';

const { Search } = Input;

@connect((state) => ({
  activeTabData: state.tabs.activeTabData,
  userDesignerId: state.visualState.userDesignerId,
  visualMapID: state.visualState.visualMapID,
  isSave: state.visualState.isSave,
  zoomConfig: state.visualState.zoomConfig,
}))

class ZoomConfig extends React.Component {
  static contextType = BaseContext;

  constructor(props) {
    super(props);
    this.state = {
      showEntity: false,
      showRecord: false,
      showColor: false,
      showTab: false,
      loading: false,
      temporaryData: {},
      isSave: props.isSave,
      colorType: '',
      configData: {
        visualMapId: props.visualMapID,
      },
      tabsParam: {
        functionId: props.activeTabData.functionData.id,
        planned: 10,
        userDesignerId: props.userDesignerId,
      },
    };
  }

  componentWillReceiveProps(nextProps) {
    console.log('componentWillReceiveProps');
    // if (nextProps.blockInfo.blockId && nextProps.blockInfo.blockId !== this.state.configData.id) {
    //   this.fetchData(nextProps.blockInfo);
    //   return;
    // }
    // if (!nextProps.blockInfo.blockId && !this.state.configData.relationTableName && !this.state.configData.relationTabName) {
    //   this.setState({
    //     configData: {
    //       visualMapId: this.props.visualMapID,
    //     },
    //   });
    // }
  }

  componentDidMount() {
    // let { blockInfo } = this.props;
    // this.fetchData(blockInfo);
  }


  setVisualState(payload) {
    const { dispatch } = this.context;
    dispatch({
      type: 'visualState/updateState',
      payload: payload,
    });
  }

  // DOM销毁时
  componentWillUnmount() {
  }

  // 选择实体
  setTemporaryData = (params = {}) => {
    const { zoomConfig } = this.props;
    let param = {
      relationTableNameId: params.relationTableNameId,
      relationtablename: params.relationTableName,
    };
    this.setVisualState({ zoomConfig: { ...zoomConfig, ...param } });
    this.props.form.resetFields(['relationtablename']);
  };

  // 选择记录
  selectPositionId = (params) => {
    const { zoomConfig } = this.props;
    let param = {
      relationId: params.relationId,
      relationname: params.recordName,
    };
    this.setVisualState({ zoomConfig: { ...zoomConfig, ...param } });
    this.props.form.resetFields(['relationname']);
  };

  setConfigData = (visible) => {
    this.setState({ [visible]: false });
  };

  openRecordModal = () => {
    const { langLib } = this.context;
    const { relationtablename } = this.props.zoomConfig;
    if (relationtablename) {
      this.setState({ showRecord: true });
    } else {
      message.warning(langLib['visual.entity.table']); // lang:请先选择实体表
    }
  };

  getFormConfigs = () => {
    const { langLib } = this.context;
    const { zoomConfig } = this.props;
    return [
      {
        key: 'relationtablename',
        label: langLib['visual.related.entities'], // lang: '关联实体'
        colSpan: 24,
        config: {
          rules: [
            { required: true, message: langLib['visual.select.associated'] }, // lang: '请选择关联实体'
          ],
          initialValue: zoomConfig.relationtablename,
        },
        component: (
          <Search
            readOnly
            onSearch={() => this.setState({ showEntity: true })}
            style={{ width: '100%' }}
          ></Search>
        ),
      }, {
        key: 'relationname',
        label: langLib['visual.relational.record'], // lang:'关联记录'
        colSpan: 24,
        config: {
          rules: [
            { required: true, message: langLib['visual.select.record'] }, // lang:'请选择关联记录'
          ],
          initialValue: zoomConfig.relationname,
        },
        component: (
          <Search
            readOnly
            onSearch={this.openRecordModal}
            style={{ width: '100%' }}
          ></Search>
        ),
      },
    ];
  };

  // 数据提交
  onSubmit = e => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) return;
      console.log(err, values);
      const { zoomConfig } = this.props;
      this.setVisualState({ zoomConfig, isZoomConfigVisible: false });
    });
  };

  // 数据清空
  onClean = () => {
    this.props.form.resetFields();
    this.setVisualState({ zoomConfig: {} });
  };


  render() {
    const { langLib } = this.context;
    const { relationtablename, colorCode, color, relationTableNameId, relationId } = this.props.zoomConfig;
    const { showEntity, showRecord, showColor, showTab, tabsParam, loading, colorType } = this.state;
    const { form } = this.props;
    console.log(this.props.zoomConfig,'this.props.zoomConfig')
    return (
      <div className="blockConfig">
        <CSpin spinning={loading}>
          <div className="header">
            <h2>
              <FormattedMessage id="visual.zoom.config"/>{/* lang: 热区设置 */}
            </h2>
          </div>
          <div className="content">
            <FormItems formConfigs={this.getFormConfigs()} form={form} loading={false}/>
          </div>
          <div className="footer">
            <CButton type="default" onClick={() => this.onClean()}>
              <FormattedMessage id="visual.empty"/>{/* lang: 清空 */}
            </CButton>
            <CButton type="primary" onClick={() => this.onSubmit()}>
              <FormattedMessage id="visual.config.save"/>{/* lang: 保存 */}
            </CButton>
          </div>
        </CSpin>
        <CreateModal
          visible={showEntity}
          title={langLib['visual.select.entity'] /* 选择实体 */}
          onCancel={() => this.setState({ showEntity: false })}
          onOk={() => this.setConfigData('showEntity')}
        >
          <VisualGroup showType="tablelist" setTemporaryData={this.setTemporaryData} otherParams={{ initialData: 0 }}
                       selectedRowKeys={relationTableNameId}></VisualGroup>
        </CreateModal>
        <CreateModal
          visible={showRecord}
          title={langLib['visual.modal.select.record'] /* "选择记录" */}
          onCancel={() => this.setState({ showRecord: false })}
          onOk={() => this.setConfigData('showRecord')}
        >
          <VisualGroup showType="recordlist" setTemporaryData={this.selectPositionId}
                       otherParams={{ tableName: relationtablename }} selectedRowKeys={relationId}></VisualGroup>
        </CreateModal>
      </div>
    );
  };
}

export default Form.create()(ZoomConfig);
