/*
 * @Author: jwk
 * @Date:   2020-06-02 15:40:23
 * @Desc: 存储过程
 */
import React, { Component } from 'react';
import { Icon, Select } from 'antd';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';
import FormItems from '@/components/common/FormItems/FormItems';
import CSelect from '@/components/common/BasicWidgets/Widgets/CSelect/CSelect';
import ModalBox from '@/components/common/ReminderBox/ReminderBox';
import Styles from './DataTable.less';
import { BaseContext, VALID_REQUIRED_MESSAGE } from '@/constants/global';
import { CInput, SplitLine } from '@/components/common/BasicWidgets';
import { deleteJobData } from '@/services/scheduledTasks';
import styles from '@/components/common/TabConfig/TabConfig.less';
import { getDefaultConfirmProps } from '@/utils/common';

const { Option } = Select;
let OptionNumList = [];
for (let i = 0; i < 10; i++) {
  OptionNumList.push(<Option value={i + 1} key={i}>{`${i + 1}`}</Option>);
}

class DataTable extends Component {
  static contextType = BaseContext;

  static getDerivedStateFromProps(nextProps, state) {
    if (JSON.stringify(nextProps.dataList) !== JSON.stringify(state.dataList)) {
      return {
        dataList: nextProps.dataList,
        isShow: false,
        detial: {},
      };
    }
    return null;
  }

  state = {
    num: 0,
    dataList: [], // 存储过程列表
    isShow: false,
    detial: {}, // 默认选中第一条
    loadingStatus: {}, // 按钮状态
  };

  componentDidMount() {
  }

  componentDidUpdate(prevProps, prevState) {
    // console.log(prevProps, prevState, 'DidUpdate');
    // const { dataList } = this.state;
    // console.log(dataList)
    // console.log(this.props, 'DidUpdate');
  }

  // 新增
  add = () => {
    const { updateState } = this.props;
    this.setState({
      isShow: true,
      detial: {},
      num: 0,
    }, () => {
      const { form } = this.props;
      form && form.resetFields();
    });
    updateState({
      chooseData: {},
    });
  };

  // 渲染列表
  renderList = () => {
    const { dataList = [], detial, loadingStatus } = this.state;
    const { functionData } = this.props;
    const { candelete } = functionData.attributes;
    return dataList.map(item => {
      const wrapCls = classNames({
        [Styles.bg]: detial.id === item.id,
        'custom-color': detial.id === item.id,
      });
      return (
        <div className={`${Styles.listContent} ${wrapCls} dataConfig`} key={item.id}>
          <span className={Styles.leftList} onClick={() => {
            this.handleClick(item);
          }} title={item.name}>{item.name}</span>
          {loadingStatus[item.id] ? <Icon className={Styles.lineHeight} type="loading"/> : (candelete ?
            <i onClick={() => {
              this.handleDel(item);
            }} className={`iconfont icon-del ${Styles.leftRight}`}/> : null)}
        </div>);
    });
  };
  // 选择触发器
  handleClick = (item) => {
    const { updateState, form } = this.props;
    form && form.resetFields();
    this.setState({
      detial: item,
      isShow: true,
      num: item.paramNum,
    });
    updateState({
      chooseData: item,
    });
  };
  // 删除触发器
  handleDel = (item) => {
    const { loadingStatus } = this.state;
    const { langLib } = this.context;
    let that = this;
    let { close } = ModalBox.confirm({
      ...getDefaultConfirmProps(langLib),
      onOk() {
        let params = {
          idsString: `${item.id}`,
        };
        that.setState({
          loadingStatus: {
            ...loadingStatus,
            [item.id]: true,
          },
        });
        deleteJobData(params).then(res => {
          const { getDataList } = that.props;
          getDataList();
          that.setState({
            loadingStatus: {
              ...loadingStatus,
              [item.id]: false,
            },
          });
          closeModal();
        });
      },
      onCancel: () => closeModal(),
    });
    const closeModal = () => {
      close();
    };
  };
  // 数据处理
  dealWidthList = (obj) => {
    let data = {};
    data.name = obj.name;
    data.paramNum = obj.paramNum;
    let arr = obj.scheduleJobMethodLines || [];
    if (!arr.length) return data;
    arr.forEach((item, index) => {
      data[`field_${index + 1}`] = item.param;
      data[`value_${index + 1}`] = item.val;
    });
    return data;
  };
  getFormConfigs = () => {
    const { detial } = this.state;
    let obj = this.dealWidthList(detial);
    const dataName = { // 存储过程名称
      key: 'name',
      colSpan: 12,
      label: <FormattedMessage id="tasks.modal.data.name"/>,
      config: {
        initialValue: obj.name || '',
        rules: [{
          required: false,
          message: VALID_REQUIRED_MESSAGE,
        }],
      },
      component: (
        <CInput/>
      ),
    };
    const paramNum = { // 参数数量
      key: 'paramNum',
      colSpan: 12,
      label: <FormattedMessage id="tasks.modal.data.paramNum"/>,
      config: {
        initialValue: obj.paramNum || '',
        rules: [{
          required: false,
          message: VALID_REQUIRED_MESSAGE,
        }],
      },
      component: (
        <CSelect onChange={value => this.setState({ num: value })}>{OptionNumList}</CSelect>
      ),
    };
// 分割线 - 元素属性
    const belongLine = {
      key: 'basicLine-props',
      comType: 'static',
      colSpan: 24,
      component: <div className={Styles.hr}/>,
    };
    let config = [dataName, paramNum, belongLine];
    const { num } = this.state;
    if (num) {
      for (let i = 1; i < num + 1; i++) {
        let fieldKey = `field_${i}`;
        let valueKey = `value_${i}`;
        config.push({ // 参数
          key: fieldKey,
          colSpan: 12,
          label: <span><FormattedMessage id="tasks.modal.data.param"/>{i}</span>,
          config: {
            initialValue: obj[fieldKey] || '',
            rules: [{
              required: false,
              message: VALID_REQUIRED_MESSAGE,
            }],
          },
          component: (
            <CInput/>
          ),
        }, { // 值
          key: valueKey,
          colSpan: 12,
          label: <span><FormattedMessage id="tasks.modal.data.value"/>{i}</span>,
          config: {
            initialValue: obj[valueKey] || '',
            rules: [{
              required: false,
              message: VALID_REQUIRED_MESSAGE,
            }],
          },
          component: (
            <CInput/>
          ),
        });
      }
    }
    return config;
  };

  render() {
    const { form, functionData } = this.props;
    const { canmodify, canadd, candelete } = functionData.attributes;
    const { isShow } = this.state;
    return (<div className={Styles.wrap}>
      <div className={Styles.wrapContent}>
        <div className={Styles.dataList}>
          {canadd ? <div className={Styles.btnNew} onClick={() => this.add()}>
            <Icon className={`${Styles.addnewBtnIco} custom-color`} type="plus-square"/>
            <FormattedMessage id="global.new"/>
          </div> : null}
          <div className={Styles.trggerListBox}>
            {this.renderList()}
          </div>

        </div>
        {isShow ? <div className={Styles.dataContent}>
          <div className={Styles.contentHeader}>
            <FormItems
              formConfigs={this.getFormConfigs()}
              form={form}
              loading={false}
            />
          </div>
        </div> : null}
      </div>
    </div>);
  }
}

export default DataTable;
