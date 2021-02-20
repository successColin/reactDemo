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
}))

class BlockConfig extends React.Component {
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
    if (nextProps.blockInfo.blockId && nextProps.blockInfo.blockId !== this.state.configData.id) {
      this.fetchData(nextProps.blockInfo);
      return;
    }
    if (!nextProps.blockInfo.blockId && !this.state.configData.relationTableName && !this.state.configData.relationTabName) {
      this.setState({
        configData: {
          visualMapId: this.props.visualMapID,
        },
      });
      this.setVisualState({ isZoomConfigVisible: false });
    }
  }

  componentDidMount() {
    let { blockInfo } = this.props;
    this.fetchData(blockInfo);
  }

  componentDidUpdate(prevProps) {
    let { blockInfo } = this.props;
    console.log(prevProps, blockInfo, this.state, 'componentDidUpdate');
    if (!blockInfo.blockId && this.state.configData.blockId) {
      this.setState({
        configData: {
          visualMapId: this.props.visualMapID,
        },
      });
    }
  }

  // componentDidUpdate(prevProps) {
  //   let { blockInfo } = this.props;
  //   console.log(prevProps,blockInfo,this.state)
  //   if (prevProps.blockInfo.blockId !== blockInfo.blockId) {
  //     this.fetchData(blockInfo);
  //   }
  // }

  setVisualState(payload) {
    const { dispatch } = this.context;
    dispatch({
      type: 'visualState/updateState',
      payload: payload,
    });
  }

  fetchData = blockInfo => {
    const { langLib } = this.context;
    if (!blockInfo.blockId) {
      this.setState({ loading: false });
    } else {
      this.setState({ loading: true });
      this.setVisualState({ isZoomConfigVisible: false });
      getVisualConfig(blockInfo.blockId).then(res => {
        if (!res) {
          message.error(langLib['visual.data.error']); // lang：数据错误，请删除该区块重新绘制！
          this.setState({ loading: false });
        } else {
          let { id, visualMapId, relationId, relationTabId, relationTableName, colorCode } = res;
          let configData = { ...blockInfo, id, visualMapId, relationId, relationTabId, relationTableName, colorCode };
          this.setState({ loading: false, configData });
        }
      }, err => this.setState({ loading: false }));
    }
  };

  // DOM销毁时
  componentWillUnmount() {
  }

  setTemporaryData = (params) => {
    this.setState({ temporaryData: params });
  };

  setConfigData = (visible) => {
    let { configData, temporaryData } = this.state;
    configData = { ...configData, ...temporaryData };
    this.setState({ configData, [visible]: false });
  };

  openRecordModal = () => {
    const { langLib } = this.context;
    const { relationTableName } = this.state.configData;
    if (relationTableName) {
      this.setState({ showRecord: true });
    } else {
      message.warning(langLib['visual.entity.table']); // lang:请先选择实体表
    }
  };

  handleChangeComplete = (type, colorObj) => {
    let { configData } = this.state;
    configData = { ...configData, [type]: colorObj.hex, [`${type}rgb`]: colorObj.rgb };
    this.setState({ configData });
  };

  saveVisualConfig = () => {
    let { configData } = this.state;
    let { recordName, relationTabName, color, colorrgb, colorCodergb } = configData;
    this.setState({ loading: true });
    let saveVisual = !!configData.id ? updateVisualConfig : insertVisualConfig;
    saveVisual(configData).then(res => {
      let { id, visualMapId, relationId, relationTabId, relationTableName, colorCode } = res;
      configData = { ...configData, id, visualMapId, relationId, relationTabId, relationTableName, colorCode };
      this.setState({ loading: false, configData });
      this.props.setBlockInfo({ id: res.id, recordName, relationTabName, color, colorrgb, colorCodergb });
    }, err => this.setState({ loading: false }));
  };

  openTabModal = () => {
    const { langLib } = this.context;
    let { tabsParam } = this.state;
    let { userDesignerId } = this.props;
    if (!userDesignerId) {
      message.warning(langLib['visual.user.group']); // lang:所选图层分组未关联设计用户组
      return;
    }
    tabsParam = { ...tabsParam, userDesignerId };
    this.setState({ showTab: true, tabsParam });
  };

  // 进入子图
  onEnterChildVisual = () => {
    const { langLib } = this.context;
    let { configData } = this.state;
    if (!configData.id) {
      message.warning(langLib['visual.save']); // lang:请先保存区块配置，再新建子图
    } else if (!this.props.isSave) {
      message.warning(langLib['visual.save.layer']); // lang: 请先保存当前图层
    } else {
      this.setVisualState({ controlStatus: 'addChildVisual', visualLoading: true, zoomConfig: {} });
    }
  };

  getFormConfigs = () => {
    const { langLib } = this.context;
    const { configData } = this.state;
    let { blockInfo } = this.props;
    this.props.form.resetFields();
    let colorColunm = blockInfo.type !== 'image' ? [
      // {
      //   key: 'color',
      //   label: langLib['visual.hot.color'], // '热区颜色'
      //   colSpan: 24,
      //   config: {
      //     initialValue: configData.color,
      //   },
      //   component: (
      //     <Search
      //       readOnly
      //       onSearch={() => this.setState({ showColor: true, colorType: 'color' })}
      //       style={{ width: '100%' }}
      //     ></Search>
      //   ),
      // }, {
      //   key: 'colorCode',
      //   label: langLib['visual.hot.flashes.color'], // lang:'热区闪烁颜色'
      //   colSpan: 24,
      //   config: {
      //     initialValue: configData.colorCode,
      //   },
      //   component: (
      //     <Search
      //       readOnly
      //       onSearch={() => this.setState({ showColor: true, colorType: 'colorCode' })}
      //       style={{ width: '100%' }}
      //     ></Search>
      //   ),
      // },
    ] : [];
    return [
      {
        key: 'relationTableName',
        label: langLib['visual.related.entities'], // lang: '关联实体'
        colSpan: 24,
        config: {
          rules: [
            { required: true, message: langLib['visual.select.associated'] }, // lang: '请选择关联实体'
          ],
          initialValue: configData.relationTableName,
        },
        component: (
          <Search
            readOnly
            onSearch={() => this.setState({ showEntity: true })}
            style={{ width: '100%' }}
          ></Search>
        ),
      }, {
        key: 'recordName',
        label: langLib['visual.relational.record'], // lang:'关联记录'
        colSpan: 24,
        config: {
          rules: [
            { required: true, message: langLib['visual.select.record'] }, // lang:'请选择关联记录'
          ],
          initialValue: configData.recordName,
        },
        component: (
          <Search
            readOnly
            onSearch={this.openRecordModal}
            style={{ width: '100%' }}
          ></Search>
        ),
      }, {
        key: 'relationTabName',
        label: langLib['visual.associated.panel'], // lang: '关联面板'
        colSpan: 24,
        config: {
          rules: [
            { required: true, message: langLib['visual.select.association.panel'] }, // lang: '请选择关联面板'
          ],
          initialValue: configData.relationTabName,
        },
        component: (
          <Search
            readOnly
            onSearch={this.openTabModal}
            style={{ width: '100%' }}
          ></Search>
        ),
      },
      ...colorColunm,
    ];
  };

  // 数据提交
  onSubmit = e => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.saveVisualConfig();
      } else {
        for (let key in err) {
          let msg = err[key].errors[0].message;
          message.warning(msg);
          break;
        }
      }
    });
  };

  // 数据清空
  onClean = () => {
    let { blockInfo } = this.props;
    let configData = { visualMapId: this.props.visualMapID, id: blockInfo.blockId };
    this.setState({ configData });
  };

  render() {
    const { langLib } = this.context;
    const { relationTableName, colorCode, color, relationTableNameId, relationId, relationTabId } = this.state.configData;
    console.log(relationTableName, 'relationTableName');
    const { showEntity, showRecord, showColor, showTab, tabsParam, loading, colorType } = this.state;
    const { form } = this.props;
    const CSketchPicker = type => {
      let sketchColor = type === 'colorCode' ? colorCode : color;
      return (
        <div className="sketch-picker-box">
          <SketchPicker color={sketchColor || ''}
                        onChangeComplete={colorObj => this.handleChangeComplete(type, colorObj)}/>
          <CButton type="primary" onClick={() => this.setState({ showColor: false })}>
            <FormattedMessage id="visual.close"/>{/* lang: 关闭 */}
          </CButton>
        </div>
      );
    };

    return (
      <div className="blockConfig">
        <CSpin spinning={loading}>
          <div className="header">
            <h2>
              <FormattedMessage id="visual.hotspot.set"/>{/* lang: 热区设置 */}
            </h2>
            <CButton type="default" style={{ width: '49%', marginRight: '1%' }} onClick={this.onEnterChildVisual}>
              <span className="right-arrow custom-color">→</span>
              <span>
                <FormattedMessage id="visual.enter.edit"/>{/* lang: 进入编辑 */}
              </span>
            </CButton>
            <CButton type="default" style={{ width: '49%', marginLeft: '1%' }}
                     onClick={() => this.setVisualState({ controlStatus: 'delete' })}>
              <span className="right-arrow iconfont icon-layer-delete custom-color"></span>
              <span>
                <FormattedMessage id="visual.delete.hotspot"/>{/* lang: 删除热区 */}
              </span>
            </CButton>
          </div>
          <div className="content">
            <FormItems formConfigs={this.getFormConfigs()} form={form} loading={false}/>
          </div>
          <div className="footer">
            <CButton type="default" onClick={this.onClean}>
              <FormattedMessage id="visual.empty"/>{/* lang: 清空 */}
            </CButton>
            <CButton type="primary" onClick={this.onSubmit}>
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
          <VisualGroup showType="recordlist" setTemporaryData={this.setTemporaryData}
                       otherParams={{ tableName: relationTableName }} selectedRowKeys={relationId}></VisualGroup>
        </CreateModal>
        <CreateModal
          visible={showTab}
          title={langLib['visual.moadl.associated.panel'] /* "选择关联面板" */}
          onCancel={() => this.setState({ showTab: false })}
          onOk={() => this.setConfigData('showTab')}
        >
          <VisualGroup showType="tablist" setTemporaryData={this.setTemporaryData} otherParams={tabsParam}
                       selectedRowKeys={relationTabId}></VisualGroup>
        </CreateModal>
        {showColor && CSketchPicker(colorType)}
      </div>
    );
  };
}

export default Form.create()(BlockConfig);
