import { Component, Fragment } from 'react';
import { FormattedMessage } from 'react-intl';
import { Popover, Select, Checkbox, Radio, Button, Column, Table, message } from 'antd';
import { SketchPicker } from 'react-color';
import {
  CButton,
  CTextArea,
  CSelect,
  CInput,
  SearchSelect,
  SplitLine,
  CTable,
  CSearch,
} from '@/components/common/BasicWidgets';
import FormItems from '@/components/common/FormItems/FormItems';
import { BaseContext, VALID_REQUIRED_MESSAGE } from '@/constants/global';
import CModal from '../../common/CreateModal/CreateModal';
import styles from './DetailContent.less';

const { Option } = Select;

let pickedColor = '';
const itemLayout = {
  labelCol: {
    sm: { span: 24 },
  },
  wrapperCol: {
    sm: { span: 24 },
  },
};

class settingConfig extends Component {
  static contextType = BaseContext;
  state = {
    visiblePageConfig: false,
    colorCode: '',
    activeDetail: {},
    id: '',
    currentI: 1,
    currentII: 1,
    currentIII: 1,
  };
  // 根据选择的关联表，带出字段、编码、名称等
  setRelateTables = selected => {
    const detial = selected[0] || {};
    let Obj = {};
    Object.keys(detial).forEach((item) => {
      Obj[item] = detial[item];
    });
    Obj.defaultframeName = detial.name;
    this.props.form.setFieldsValue(Obj);
    this.props.setDefaultframeId(Obj.id);
  };
  // 管理表
  setTableName = selected => {
    const { tableName } = selected[0] || {};
    this.props.form.setFieldsValue({
      tableName: tableName,
    });
  };
  // 修改颜色值
  handleSaveColor = (fromType, value) => {
    const color = pickedColor.hex;
    const { activeDetail, updateColor } = this.props;
    // 通过拾色器选色
    // let colorCode = activeDetail.colorCode ? `${activeDetail.colorCode},${color}` : color;
    let colorCode = color || '';
    // 输入框直接修改
    if (fromType === 'input') colorCode = value;
    this.setState({ visibleColorPicker: false });
    if (!color) return;
    let detail = activeDetail;
    detail.colorCode = colorCode;
    updateColor(detail);
  };

  getIconId = (selected) => {
    const { id } = selected[0] || {};
    this.props.form.setFieldsValue({ 'iconId': id });
  };
  getRelationTableName = (selected) => {
    const { tableName } = selected[0] || {};
    this.props.form.setFieldsValue({ 'relationTableName': tableName });
  };

  getTypeName = (selected) => {
    const { id, name } = selected[0] || {};
    this.props.form.setFieldsValue({ 'typeId': id, 'typeName': name });
  };
  // 获取表单项配置
  getFormConfigs = () => {
    const {
      activeDetail = {},
      activeTreeNodeDetail = {},
      actionType,
      updateFrameState,
      treeData,
    } = this.props;
    const { isGroup, type } = activeTreeNodeDetail;
    let showGroup = isGroup;
    if (actionType === 'addElement') showGroup = false;
    const { basetype = 'select' } = activeDetail;
    const publicProps = {};
    const { colorCode } = activeDetail;
    const { visibleColorPicker } = this.state;
    // 分割线 - 基本属性
    const basicLine = {
      key: 'basicLine-base',
      comType: 'static',
      colSpan: 24,
      component: <SplitLine title={<FormattedMessage id="splitLine.title.basic"/>}/>,
    };
    // 基本信息
    let publicBasicConfig = [];
    if (type === 'ERRORCODEI') {
      publicBasicConfig = [
        basicLine, {
          key: 'name',
          colSpan: 12,
          label: <FormattedMessage id="errorCodeI.name"/>,
          config: {
            initialValue: activeDetail.name || '',
          },
          component: <CInput disabled={true}/>,
        }, {
          key: 'keycode',
          colSpan: 12,
          label: <FormattedMessage id="errorCodeI.keycode"/>,
          config: {
            initialValue: activeDetail.keycode || '',
          },
          component: <CInput disabled={true}/>,
        },
      ];
    } else if (type === 'ERRORCODEII') {
      publicBasicConfig = [
        basicLine, {
          key: 'name',
          colSpan: 12,
          label: <FormattedMessage id="errorCodeII.name"/>,
          config: {
            initialValue: activeDetail.name || '',
          },
          component: <CInput disabled={true}/>,
        }, {
          key: 'keycode',
          colSpan: 12,
          label: <FormattedMessage id="errorCodeII.keycode"/>,
          config: {
            initialValue: activeDetail.keycode || '',
          },
          component: <CInput disabled={true}/>,
        },
      ];
    } else if (type === 'ERRORCODEIII') {
      publicBasicConfig = [
        basicLine, {
          key: 'name',
          colSpan: 12,
          label: <FormattedMessage id="errorCodeIII.name"/>,
          config: {
            initialValue: activeDetail.name || '',
          },
          component: <CInput disabled={true}/>,
        }, {
          key: 'keycode',
          colSpan: 12,
          label: <FormattedMessage id="errorCodeIII.keycode"/>,
          config: {
            initialValue: activeDetail.keycode || '',
          },
          component: <CInput disabled={true}/>,
        },
      ];
    } else {
      publicBasicConfig = [
        basicLine, {
          key: 'name',
          colSpan: 12,
          label: <FormattedMessage id="errorCode.name"/>,
          config: {
            initialValue: activeDetail.name || '',
          },
          component: <CInput/>,
        }, {
          key: 'keycode',
          colSpan: 12,
          label: <FormattedMessage id="errorCode.keycode"/>,
          config: {
            initialValue: activeDetail.keycode || '',
          },
          component: <CInput disabled={true}/>,
        }, { // 组织机构
          key: 'id',
          // label: <FormattedMessage id="user.form.userDesignerId"/>,
          colSpan: 12,
          config: {
            initialValue: activeDetail.id,
          },
          component: (
            <CInput style={{ 'display': 'none' }}/>
          ),
        },
      ];
    }

    // 其他信息
    let propConfig = [];
    return [
      ...publicBasicConfig,
      ...propConfig,
    ];
  };

  // 取消关联故障现象
  cancelFunction = e => {
    const { hideModal } = this.props;
    hideModal();
  };

  // 确认关联故障现象
  confirmFunction = e => {
    const { activeTreeNodeDetail, handleSaveRelation, relationTableName } = this.props;
    const { id, type, errorcodeGroupId } = activeTreeNodeDetail;

    if (!this.state.id) {
      const { langLib } = this.context;
      message.error(langLib['message.please.choose']);
      return;
    }
    let param = {
      'mainTableId': id,
      'mainTableName': type,
      'relationTableId': this.state.id,
      'relationTableName': relationTableName,
      'errorcodeGroupId': e === 1 ? id : errorcodeGroupId,
    };
    handleSaveRelation(param);
  };


  render() {
    const { fetchErrorCodeIII, fetchErrorCodeII, fetchErrorCodeI, form, loading, errorCodeIDetail, errorCodeIIDetail, errorCodeIIIDetail, visibleErrorCodeI, visibleErrorCodeII, visibleErrorCodeIII } = this.props;
    const rowRadioSelection = {
      type: 'radio',
      columnTitle: '选择',
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({ id: selectedRowKeys.id });
      },
      onSelect: (selectedRowKeys, selectedRows) => {
        this.setState({ id: selectedRowKeys.id });
      },
      getCheckboxProps: record => ({
        disabled: record.name === 'Disabled User', // Column configuration not to be checked
        name: record.name,
      }),
    };
    const paginationPropsI = {
      total: errorCodeIDetail.length,
      current: this.state.currentI,
      onChange: (page, pageSize) => {
        this.setState({
          currentI: page,
        });
      },
      hideOnSinglePage: true,
    };
    const paginationPropsII = {
      total: errorCodeIIDetail.length,
      current: this.state.currentII,
      onChange: (page, pageSize) => {
        this.setState({
          currentII: page,
        });
      },
      hideOnSinglePage: true,
    };
    const paginationPropsIII = {
      total: errorCodeIIIDetail.length,
      current: this.state.currentIII,
      onChange: (page, pageSize) => {
        this.setState({
          currentIII: page,
        });
      },
      hideOnSinglePage: true,
    };
    const { langLib } = this.context;
    const { Column, ColumnGroup } = Table;
    // 故障现象
    const ErrorCodeITitle = <Fragment>
      <FormattedMessage id="errorCodeI.relation.title"/>
      <CSearch
        className={styles.csearchWrap}
        onSearch={headerKeywords => fetchErrorCodeI(headerKeywords)}
        onChange={e => !e.target.value && fetchErrorCodeI(e.target.value)}
      />
    </Fragment>;
    // 故障原因
    const ErrorCodeIITitle = <Fragment>
      <FormattedMessage id="errorCodeII.relation.title"/>
      <CSearch
        className={styles.csearchWrap}
        onSearch={headerKeywords => fetchErrorCodeII(headerKeywords)}
        onChange={e => !e.target.value && fetchErrorCodeII(e.target.value)}
      />
    </Fragment>;
    // 故障措施
    const ErrorCodeIIITitle = <Fragment>
      <FormattedMessage id="errorCodeIII.relation.title"/>
      <CSearch
        className={styles.csearchWrap}
        onSearch={headerKeywords => fetchErrorCodeIII(headerKeywords)}
        onChange={e => !e.target.value && fetchErrorCodeIII(e.target.value)}
      />
    </Fragment>;
    return (
      <div>
        <FormItems
          formConfigs={this.getFormConfigs()}
          form={form}
          loading={loading}
        />
        <CModal
          title={ErrorCodeITitle}
          visible={visibleErrorCodeI}
          size="default"
          style={{ height: '520px' }}
          // onOk={this.confirmFunction.bind(this)}
          onCancel={this.cancelFunction.bind(this)}
          centered="true"
          destroyOnClose="true"
          footer={[
            <Button key="cancel" loading={loading} type="default" onClick={() => this.cancelFunction()}>
              {langLib['confirm.cancel']}
            </Button>, <Button key="submit" loading={loading} type="primary" onClick={() => this.confirmFunction(1)}>
              {langLib['confirm.ok']}
            </Button>]}
        >
          <CTable dataSource={errorCodeIDetail} rowSelection={rowRadioSelection} filterMultiple="false"
                  pagination={paginationPropsI}>
            <Column title="故障现象编码" dataIndex="keycode" key="keycode"/>
            <Column title="故障现象名称" dataIndex="name" key="name"/>
          </CTable>
        </CModal>
        <CModal
          title={ErrorCodeIITitle}
          visible={visibleErrorCodeII}
          size="default"
          style={{ height: '520px' }}
          // onOk={this.confirmFunction.bind(this)}
          onCancel={this.cancelFunction.bind(this)}
          centered="true"
          destroyOnClose="true"
          filterMultiple="false"
          footer={[
            <Button key="cancel" loading={loading} type="default" onClick={() => this.cancelFunction()}>
              {langLib['confirm.cancel']}
            </Button>, <Button key="submit" loading={loading} type="primary" onClick={() => this.confirmFunction()}>
              {langLib['confirm.ok']}
            </Button>]}
        >
          <CTable dataSource={errorCodeIIDetail} rowSelection={rowRadioSelection} filterMultiple="false"
                  pagination={paginationPropsII}>
            <Column title="故障原因编码" dataIndex="keycode" key="keycode"/>
            <Column title="故障原因名称" dataIndex="name" key="name"/>
          </CTable>
        </CModal>
        <CModal
          title={ErrorCodeIIITitle}
          visible={visibleErrorCodeIII}
          size="default"
          // onOk={this.confirmFunction.bind(this)}
          onCancel={this.cancelFunction.bind(this)}
          style={{ height: '520px' }}
          centered="true"
          destroyOnClose="true"
          filterMultiple="false"
          footer={[
            <Button key="cancel" loading={loading} type="default" onClick={() => this.cancelFunction()}>
              {langLib['confirm.cancel']}
            </Button>, <Button key="submit" loading={loading} type="primary" onClick={() => this.confirmFunction()}>
              {langLib['confirm.ok']}
            </Button>]}
        >
          <CTable dataSource={errorCodeIIIDetail} rowSelection={rowRadioSelection} filterMultiple="false"
                  pagination={paginationPropsIII}>
            <Column title="故障措施编码" dataIndex="keycode" key="keycode"/>
            <Column title="故障措施名称" dataIndex="name" key="name"/>
          </CTable>
        </CModal>
      </div>
    );
  }
}

export default settingConfig;
