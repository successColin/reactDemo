import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { Tabs, Checkbox, Row, Col, Modal, message } from 'antd';
import FormConfigDetial from './formDetial';
import { BaseContext } from '@/constants/global';
import TableList from './tableList';
import { getJavaDetialById } from '@/services/javaBean';

const { TabPane } = Tabs;
const { confirm } = Modal;

class Ctab extends Component {
  static contextType = BaseContext;

  constructor(props) {
    super();
    this.state = {
      loading: false,
      activeDetail: {}, // 当前选中的角色
      id: '',
      dataSoucre: [], // 表中字段列表
      tableLoading: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      activeDetail: nextProps.tabDefaultConfig.activeDetail,
    });
  }

  /**
   * 面板切换
   * @param active
   */
  changeTabActive = (active) => {
    this.props.tabDefaultConfig.changeTab(active);
    if (active === 'role') {
      this.getTableList();
    }
  };
  getTableList = () => {
    const { tableName } = this.state.activeDetail;
    this.setState({
      tableLoading: true,
    });
    let data = { tableName: tableName };
    getJavaDetialById(data).then(res => {
      this.setState({
        dataSoucre: res,
        tableLoading: false,
      }, err => {
        this.setState({
          tableLoading: false,
        });
      });
    });
  };

  render() {
    const { tabDefaultConfig } = this.props;
    const { loading, dataSourcePC, dataSourceApp, tree, dataSoucre, tableLoading, activeDetail } = this.state;
    const tableConfig = {
      dataSoucre,
      loading: tableLoading,
      activeDetail,
      getTableList: this.getTableList,
    };
    return (
      <Tabs
        defaultActiveKey={tabDefaultConfig.tabsActive}
        activeKey={tabDefaultConfig.tabsActive}
        animated={false}
        className={`${tabDefaultConfig.className} userTabStyle`}
        onChange={(activeKey) => this.changeTabActive(activeKey)}
      >
        <TabPane tab={<FormattedMessage id="splitLine.title.basic"/>} key="base">
          <FormConfigDetial tabDefaultConfig={tabDefaultConfig}/>
        </TabPane>
        <TabPane tab={<FormattedMessage id="import.form.include"/>} key="role">
          <TableList {...tableConfig}/>
        </TabPane>
      </Tabs>)
      ;
  }
}

export default Ctab;
