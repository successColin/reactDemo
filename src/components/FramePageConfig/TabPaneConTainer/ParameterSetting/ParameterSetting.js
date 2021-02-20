/*
 * @Author: jwk
 * @Date:   2020-04-21 20:19:07
 * @Desc: 输入参数
 */

import React, { Component } from 'react';
import { Icon } from 'antd';
import { FormattedMessage } from 'react-intl';
import { CButton, CInput, CMessage, CTable } from '@/components/common/BasicWidgets/index';
import { getParamList, updateParamList } from '@/services/framePage';
import styles from './ParameterSettings.less';
import { BaseContext } from '@/constants/global';

class ParameterSetting extends Component {
  static contextType = BaseContext;

  constructor(props) {
    super();
    this.state = {
      list: [], // 参数集合
    };
  }

  componentDidMount() {
    this.getParamList();
  }

  // 获取参数列表
  getParamList = () => {
    const { framePage, isApp = false } = this.props;
    let id = isApp ? framePage.bundleData.bundleId : framePage.functionId;
    let params = isApp ? { bundleId: id } : { functionId: id };
    getParamList(params).then(res => {
      this.setState({
        list: res || [],
      });
    });
  };


  // 新增变量参数
  addParam = () => {
    const { list } = this.state;
    const { framePage, isApp = false } = this.props;
    let id = isApp ? framePage.bundleData.bundleId : framePage.functionId;
    let length = list.length;
    let newList = [
      ...list, {
        memo: '',
        sno: length + 1,
        name: '',
        [`${isApp ? 'bundleId' : 'functionId'}`]: id,
      }];
    this.setState({
      list: newList,
    });
  };
  // 删除某行
  del = (index) => {
    const { list } = this.state;
    list.splice(index, 1);
    let newList = list.map((item, index) => {
      return {
        ...item,
        sno: index + 1,
      };
    });
    this.setState({
      list: newList,
    });
  };
  // 修改值
  changeValue = (e, index, type) => {
    let { list } = this.state;
    let newList = [...list];
    list[index][type] = e.target.value;
    this.setState({
      list: [...newList],
    });
  };
  // 增删改查
  insertOrUpdateParamList = (callback) => {
    const { list } = this.state;
    const { framePage, isApp = false } = this.props;
    let id = isApp ? framePage.bundleData.bundleId : framePage.functionId;
    let params = {
      list,
      [`${isApp ? 'bundleId' : 'functionId'}`]: id,
    };
    updateParamList(params).then(res => {
      const { langLib } = this.context;
      CMessage(langLib['message.save.success']);
      if (callback) {
        callback();
      }
    });
  };

  render() {
    const { list } = this.state;
    const { functionData } = this.props;
    const { canmodify, canadd, candelete } = functionData.attributes;

    const column = [{
      title: <FormattedMessage id="framePageConfig.parameter.settings.name"/>,
      dataIndex: 'name',
      key: 'name',
      render: (text, record, index) => {
        return <CInput key={`name_${index}`} value={text} onChange={(e) => this.changeValue(e, index, 'name')}/>;
      },
    }, {
      title: <FormattedMessage id="global.memoMsg"/>,
      dataIndex: 'memo',
      key: 'memo',
      render: (text, record, index) => {
        return <CInput key={`memo${index}`} value={text} onChange={(e) => this.changeValue(e, index, 'memo')}/>;
      },
    }, {
      title: <FormattedMessage id="global.operator"/>,
      dataIndex: 'operator',
      key: 'operator',
      width: 50,
      render: (text, record, index) => {
        return <div onClick={(e) => {
          this.del(index);
        }} className={styles.operator}><span className='iconfont icon-minus-border custom-color'></span></div>;
      },
    }];
    return (<div className={styles.wrap}>
      <div className={styles.btnbox}>
        {canadd ? <CButton onClick={() => {
          this.addParam();
        }}>
          <Icon className="custom-color" type="plus-square"/>
          <FormattedMessage id="global.new"/>
        </CButton> : null}
      </div>
      <div className={styles.tableBox}>
        <CTable
          columns={column}
          dataSource={list}
          pagination={false}
          rowKey={(record) => record.sno}
        />
      </div>
    </div>);
  }
}

export default ParameterSetting;
