/*
 * @Author: jwk
 * @Date:   2020-07-07 09:10:20
 * @Desc: bpmn审批面板
 */
import React, { Component } from 'react';
import { Form, Select, Upload, AutoComplete, Radio, Col, Tag } from 'antd';
import { FormattedMessage } from 'react-intl';
import {
  CTextArea,
  CSelect,
  CMessage,
  SplitLine,
  CButton,
} from '@/components/common/BasicWidgets';
import FormItems from '@/components/common/FormItems/FormItems';
import DetailForm from '../DetailForm/DetailForm';
import DetailList from '../DetailList/DetailList';
import Zmage from 'react-zmage';
import query from '@/constants/query';
import { reduceSourceToFormData, reduceDataToJsonString, getCookie } from '@/utils/common';
import { BaseContext, VALID_REQUIRED_MESSAGE } from '@/constants/global';
import { getUserList } from '@/services/userManager';
import { setBpmData } from '@/services/global';
import Styles from './BPMAuditPanel.less';

const { Option } = Select;
const FormItem = Form.Item;
const level = { 1: 'bpmn.form.level.noranl', 2: 'bpmn.form.level.urgent' };
// 默认的表单布局
const initItemLayout = {
  labelCol: {
    sm: { span: 5 },
  },
  wrapperCol: {
    sm: { span: 19 },
  },
};

class BPMAuditPanel extends Component {
  static contextType = BaseContext;

  static getDerivedStateFromProps(nextProps, state) {
    if (JSON.stringify(nextProps.dataMap) !== JSON.stringify(state.dataMap)) {
      return {
        dataMap: nextProps.dataMap,
        select: '',
        fileKeys: [], // 文件集合
        toUserKeys: [], // 抄送人集合
      };
    }
    return null;
  }

  state = {
    dataMap: {},
    select: '',
    userList: [],
    fileList: [], // 文件集合
    toUserNames: [], // 抄送人集合
    toUserName: '', // 抄送人
  };

  // 写死逻辑，头部表单的控件都不允许编辑
  makeElementsDisabled = (elementMap, tabInfo) => {
    let elementList = elementMap[tabInfo.id];
    let newElementList = [];
    elementList.forEach(item => {
      item.readonly = 1;
      newElementList.push(item);
    });
    return {
      ...elementMap,
      [tabInfo.id]: newElementList,
    };
  };
  // 返回子面板列表上的控件map
  returnSubPanelElementList = () => {
    const { elementMap, tabList, tabInfo } = this.props;
    const { dataMap } = this.state;
    const elementList = elementMap[tabInfo.id] || [];
    const subPanel = elementList.find(item => item.basetype === 42);
    const { relationTabId } = subPanel;
    const listPanel = tabList.find(item => item.id === relationTabId); // 获取子面板关联的面板信息
    const listElement = elementMap[relationTabId];
    const listData = reduceDataToJsonString(listElement, dataMap.listData);
    return { listPanel, listData };
  };
  // 下拉选择
  changeSelect = (value) => {
    this.setState({
      select: value,
      fileList: [], // 文件集合
      toUserNames: [], // 沟通集合
      toUserName: '', // 抄送人
      rejectToNode: '', // 驳回节点
    }, () => {
      const { form } = this.props;
      form.setFieldsValue({ urgentLevel: '', rejectToNode: '', suggestion: '' });
    });
  };
  // 上传文件
  onChange = ({ file }) => {
    const { status } = file;
    const { langLib } = this.context;
    const { fileList } = this.state;
    // 上传中
    if (status === 'uploading') {
    } else if (status === 'error') {
      // 上传异常
      CMessage(langLib['file.error'], 'error');
    } else if (status === 'done' && file.response) {
      if (!file.response.success) {
        CMessage(langLib['file.error'], 'error');
        return;
      }
      CMessage(langLib['file.success'], 'success');
      fileList.push(file);
      this.setState({ fileList });
      // 文件上传完成
      return;
    }
  };
  // 删除文件
  removeFile = (obj) => {
    const { fileList } = this.state;
    let index = fileList.findIndex(item => item.uid === obj.uid);
    if (index === -1) return;
    fileList.splice(index, 1);
    this.setState({ fileList });
  };
  // 获取用户列表
  showUserList = (kewords = '') => {
    let params = {
      pageNum: 1,
      pageSize: 10,
      username: kewords,
    };
    getUserList(params).then(res => {
      this.setState({
        userList: res.list || [],
      });
    });
  };
  // 根据抄送人的类型设置数据
  checkUsers = (value, options, type) => {
    if (type === 'toUserKeys') {
      const { toUserNames } = this.state;
      const { key, props } = options;
      if (toUserNames.find(item => item.value === key)) return;
      toUserNames.push(props);
      this.setState({ toUserNames });
    } else {
      this.setState({ toUserNames: [], toUserName: value });
    }
  };
  // 删除选择的人员
  removeUser = (index) => {
    const { toUserNames } = this.state;
    toUserNames.splice(index, 1);
    this.setState({ toUserNames });
  };
  getFormConfigs = () => {
    const { select, dataMap, userList, toUserNames, fileList } = this.state;
    const { formData = {} } = dataMap;
    if (!select) return [];
    const { rejectAbleNodes = [] } = formData;
    let tagHtml = !!toUserNames.length && toUserNames.map((item, index) => <Tag key={`${item.value}`} closable
                                                                                onClose={() => this.removeUser(index)}>{item.children}</Tag>);
    const uploadProps = { // 上传资料
      action: query.FILE_UPLOAD,
      listType: 'text',
      headers: {
        token: getCookie('token'),
      },
      data: { basetype: 1 },
      name: 'file',
      onChange: this.onChange,
      onRemove: this.removeFile,
    };
    const suggestion = { // 意见
      key: 'suggestion',
      colSpan: 24,
      label: <FormattedMessage id="bpmn.form.suggestion"/>,
      config: {
        initialValue: '',
        rules: [{
          required: true,
          message: VALID_REQUIRED_MESSAGE,
        }],
      },
      component: (
        <CTextArea/>
      ),
    };
    const upload = {  // 上传资料
      key: 'fileKeys',
      colSpan: 24,
      label: <FormattedMessage id="global.uploadFile"/>,
      config: {
        initialValue: '',
      },
      component: <Upload {...uploadProps} className="upload ant-btn-default ant-btn"> <FormattedMessage
        id="global.uploadFile"/></Upload>,
    };
    const rejectToNode = {  // 驳回节点
      key: 'toNodeKey',
      colSpan: 12,
      label: <FormattedMessage id="bpmn.form.reject.toNode"/>,
      config: {
        initialValue: '',
        rules: [{
          required: true,
          message: VALID_REQUIRED_MESSAGE,
        }],
      },
      component: <CSelect>{rejectAbleNodes.map(item => <Option value={item.dataKey}
                                                               key={item.dataKey}>{item.dataValue}</Option>)}</CSelect>,
    };
    const ccPerson = { // 抄送人
      key: select === 'ASSIGN' ? 'toUserKey' : 'toUserKeys',
      colSpan: 24,
      label: <FormattedMessage id="bpmn.form.ccperson"/>,
      component: <div><AutoComplete
        onSearch={(kewords) => this.showUserList(kewords)}
        onSelect={(value, option) => this.checkUsers(value, option, select === 'ASSIGN' ? 'toUserKey' : 'toUserKeys')}
        style={{ 'width': '100%' }}
        onFocus={() => this.showUserList()}
      >
        {userList.map(item => <Option key={item.account} value={item.account || ''}>{item.username}</Option>)}
      </AutoComplete>
        <div className={Styles.tags}>{tagHtml}</div>
      </div>,

    };
    const urgentLevel = { // 紧急程度
      key: 'urgentLevel',
      label: <FormattedMessage id="bpmn.form.level"/>,
      colSpan: 12,
      component: (
        <Radio.Group>
          {Object.keys(level).map(item => <Radio value={item} key={item}><FormattedMessage
            id={`${level[item]}`}/></Radio>)}
        </Radio.Group>
      ),
    };
    const rejectArr = [];
    if (select === 'REJECT') {
      rejectArr.push(rejectToNode);
    } else if (select === 'ASSIGN') {
      rejectArr.push(ccPerson, urgentLevel);
    } else if (select === 'COPY' || select === 'COMMUNICATE') {
      rejectArr.push(ccPerson, urgentLevel);
    }
    let publicConfig = [...rejectArr, suggestion, upload];
    return publicConfig;
  };
  handleSubmit = () => {
    const { langLib } = this.context;
    const { form, dataMap, userInfo } = this.props;
    const { id, instanceId, todoType } = dataMap.formData;
    form.validateFields((err, values) => {
      if (err) return;
      let data = {
        instanceId,
        taskId: id,
        todoType,
        dealUser: userInfo.account,
        businessCode: 'BPM-API-deal-task-0001',
      };
      Object.keys(values).forEach(item => {
        let regNumber = /\d+/; // 验证0-9的任意数字最少出现1次。
        let regString = /[a-zA-Z]+/; // 验证大小写26个字母任意字母最少出现1次。
        if (!(regNumber.test(item) && regString.test(item))) { // 去掉values里面带a的字段
          if (item === 'fileKeys') {
            data[item] = this.state.fileList.map(item => {
              if (item.response.success) {
                return item.response.data[0].id;
              }
            });
          } else if (item === 'toUserKeys') {
            data[item] = this.state.toUserNames.map(item => item.value);
          } else if (item === 'toUserKey') {
            data[item] = this.state.toUserName;
          } else {
            data[item] = values[item];
          }
        }
      });
      setBpmData({
        paramMap: data,
      }).then(res => {
        this.props.afterSave(true);
        CMessage(langLib['message.save.success']);
      });
    });
  };

  render() {
    const { setPopupTabInfo, updataState, selectedListArr, tabInfo, elementMap, form, tabList, triggerMap, functionData, reduceFormData, btnGroups } = this.props;
    const { getFieldDecorator } = form;
    const { dataMap } = this.state;
    const { formData = {} } = dataMap;
    const aformData = reduceSourceToFormData(elementMap[tabInfo.id], formData);
    const newFormData = reduceFormData(elementMap[tabInfo.id], aformData); // 刚开发遗留的大坑
    const newElementMap = this.makeElementsDisabled(elementMap, tabInfo);
    const { listPanel, listData } = this.returnSubPanelElementList();
    const { dealTypeOptions = [] } = formData;
    const config = {
      rules: [{ required: true, message: VALID_REQUIRED_MESSAGE }],
    };
    const SelectOptin = dealTypeOptions.map(item => <Option value={item.dataKey}
                                                            key={item.dataKey}>{item.dataValue}</Option>);
    const formProps = {
      tabInfo,
      elementMap: newElementMap,
      formData: newFormData,
      form,
      tabList,
      triggerMap,
      functionData,
    };
    const listProps = {
      hasPagination: false, // 不需要分页
      formData: { datalist: listData, total: listData.length },
      functionData,
      tabInfo: listPanel,
      btnGroups,
      selectedListArr,
      elementMap,
      updataState,
      setPopupTabInfo,
    };
    return <div>
      <SplitLine title={<FormattedMessage id="bpmn.title.basic"/>}/>
      <DetailForm {...formProps}/>
      <SplitLine title={<FormattedMessage id="bpmn.title.history"/>}/>
      <div className={Styles.DetailListHeight}>
        <DetailList {...listProps}/>
      </div>
      <SplitLine title={<FormattedMessage id="bpmn.title.url"/>}/>
      <Zmage
        className={Styles.imgSty}
        src={`${formData.processPicRestfulUrl || ''}`}
      />
      <SplitLine title={<FormattedMessage id="bpmn.title.operate"/>}/>
      <Col className={Styles.typeBox} span={12}>
        <FormItem
          {...initItemLayout}
          key={'dealType'}
          label={<FormattedMessage id="bpmn.title.type"/>}
        >
          {getFieldDecorator('dealType', { ...config })(<CSelect className={Styles.selectType}
                                                                 onChange={(value) => this.changeSelect(value)}>
            {SelectOptin}
          </CSelect>)}
        </FormItem>
      </Col>
      <FormItems
        formConfigs={this.getFormConfigs()}
        form={form}
        loading={false}
      />
      <div className={Styles.btnBox}>
        <CButton onClick={this.handleSubmit} type="primary" className={Styles.btn}>保存</CButton>
      </div>
    </div>;
  }
}

export default Form.create()(BPMAuditPanel);
