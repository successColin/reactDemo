import react, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { Tabs, Checkbox } from 'antd';
import FormConfigDetial from './fileDetial';
import { BaseContext } from '@/constants/global';
import CTable from '@/components/common/BasicWidgets/Widgets/CTable/CTable';
import {
  getAuthorityById,
  updateFunctionPermission,
  updateRowFunctionPermission,
  getAPPTree,
  columnCheckAll,
  insertFunctionPermission,
  rowCheckAll,
  insertAppPermission,
  updateAppPermisson,
} from '@/services/roleManger';
import styles from '../knowledgeBase.less';

const { TabPane } = Tabs;

class Ctab extends Component {
  constructor(pros) {
    super();
    this.state = {
      loading: false,
      activeDetail: {}, // 当前选中的角色
      dataSourcePC: [], // pc树
      dataSourceApp: [], // app树
    };
  }

  getDerivedStateFromProps(nextProps) {
    this.setState({
      activeDetail: nextProps.tabDefaultConfig.activeDetail,
    }, () => {
      // this.getPCauthority(nextProps.tabDefaultConfig.activeDetail.id);
      // this.getAPPauthority(nextProps.tabDefaultConfig.activeDetail.id);
    });
  }

  /**
   * 获取角色对应的权限
   */
  getPCauthority = (id) => {
    this.setState({ loading: true });
    let params = { relationId: id };
    getAuthorityById(params).then((res) => {
      this.setState({ loading: false, dataSourcePC: res });
    });
  };
  /**
   * 获取app权限树
   * @param id
   */
  getAPPauthority = (id) => {
    this.setState({ loading: true });
    let params = { relationId: id };
    getAPPTree(params).then((res) => {
      this.setState({
        loading: false,
        dataSourceApp: res,
      });
    });
  };
  CustomExpandIcon = (props) => {
    let icon;
    if (props.expanded) {
      icon = 'icon-arrow-open';
    } else if (!props.expanded && (props.record.children && props.record.children.length)) {
      icon = 'icon-arrow-right';
    } else if (!props.record.children) {
      icon = 'icon-line-tree';
    }
    return (
      <span
        className={`${icon} iconfont ${styles.openIcon}`}
        onClick={e => {
          e.preventDefault();
          props.onExpand(props.record, e);
        }}
      />
    );
  };
  /**
   * 全选
   * @param e
   */
  checkTypeAll = (e, type) => {
    const { id } = this.state.activeDetail;
    let data;
    if (type === 'all') {
      data = {
        relationId: id,
        canadd: e.target.checked ? 1 : 0,
        canmodify: e.target.checked ? 1 : 0,
        candelete: e.target.checked ? 1 : 0,
        canview: e.target.checked ? 1 : 0,
        canprint: e.target.checked ? 1 : 0,
        candesign: e.target.checked ? 1 : 0,
      };
    } else {
      data = {
        relationId: id,
        [type]: e.target.checked ? 1 : 0,
      };
    }
    updateRowFunctionPermission(data).then(res => {
      this.getPCauthority(id);
    });
  };
  /**
   * 单选
   */
  checkType = (e, record, type) => {
    const { id } = this.state.activeDetail;
    let data;
    if (type === 'all') {
      data = {
        relationId: id,
        functionId: record.id,
        canadd: e.target.checked ? 1 : 0,
        canmodify: e.target.checked ? 1 : 0,
        candelete: e.target.checked ? 1 : 0,
        canview: e.target.checked ? 1 : 0,
        canprint: e.target.checked ? 1 : 0,
        candesign: e.target.checked ? 1 : 0,
      };
    } else {
      data = {
        relationId: id,
        functionId: record.id,
        [type]: e.target.checked ? 1 : 0,
      };
    }
    if (!!!record.attributes || JSON.stringify(record.attributes) === '{}') {
      insertFunctionPermission(data).then(res => {
        this.getPCauthority(id);
      });
    } else {
      let params = Object.assign({ ...record.attributes }, data);
      updateFunctionPermission(params).then((res) => {
        this.getPCauthority(id);
      });
    }

  };
  /**
   * app全选
   * @param e
   * @param type
   */
  checkAppAll = (e, type) => {
    const { id } = this.state.activeDetail;
    let data;
    if (type === 'all') {
      data = {
        relationId: id,
        canadd: e.target.checked ? 1 : 0,
        canmodify: e.target.checked ? 1 : 0,
        candelete: e.target.checked ? 1 : 0,
        canview: e.target.checked ? 1 : 0,
        canprint: e.target.checked ? 1 : 0,
        candesign: e.target.checked ? 1 : 0,
      };
    } else {
      data = {
        relationId: id,
        [type]: e.target.checked ? 1 : 0,
      };
    }
    columnCheckAll(data).then(res => {
      this.getAPPauthority(id);
    });
  };
  /**
   * app单选
   * @param e
   * @param record
   * @param type
   */
  checkApp = (e, record, type) => {
    const { id } = this.state.activeDetail;
    console.log(record);
    let data;
    if (record.type === 'APP') {
      if (record.attributes && record.attributes.appId) {
        data = {
          relationId: id,
          canview: e.target.checked ? 1 : 0,
          appId: record.id,
          id: record.attributes.id,
        };
        updateAppPermisson(data).then(res => {
          this.getAPPauthority(id);
        });
      } else {
        data = {
          relationId: id,
          canview: e.target.checked ? 1 : 0,
          appId: record.id,
        };
        insertAppPermission(data).then(res => {
          this.getAPPauthority(id);
        });
      }
    } else {
      if (type === 'all') {
        data = {
          relationId: id,
          canadd: e.target.checked ? 1 : 0,
          canmodify: e.target.checked ? 1 : 0,
          candelete: e.target.checked ? 1 : 0,
          canview: e.target.checked ? 1 : 0,
          canprint: e.target.checked ? 1 : 0,
          candesign: e.target.checked ? 1 : 0,
          bundleId: record.id,
          id: record.attributes && record.attributes.id ? record.attributes.id : '',
        };
      } else {
        data = {
          relationId: id,
          bundleId: record.id,
          [type]: e.target.checked ? 1 : 0,
          id: record.attributes && record.attributes.id ? record.attributes.id : '',
        };
      }
      rowCheckAll(data).then(res => {
        this.getAPPauthority(id);
      });
    }
  };
  changeTab = (activeKey) => {
    const { activeDetail } = this.state;
    const { tabDefaultConfig } = this.props;
    if (activeKey === 'pc') {
      this.getPCauthority(activeDetail.id);
    } else if (activeKey === 'app') {
      this.getAPPauthority(activeDetail.id);
    }
    tabDefaultConfig.changeTab(activeKey);
  };

  render() {
    const { tabDefaultConfig } = this.props;
    const { activeDetail } = this.state;
    const pcColumns = [
      {
        title: <FormattedMessage id="role.table.function"/>,
        dataIndex: 'name',
        key: 'name',
        width: '36%',
      },
      {
        title: (
          <div><Checkbox onChange={e => this.checkTypeAll(e, 'canview')} className={styles.checkSty}/><FormattedMessage
            id="role.table.look"/></div>),
        dataIndex: 'canview',
        key: 'canview',
        filterMultiple: true,
        width: '8%',
        render: (text, record) => {
          return (<div><Checkbox checked={record.attributes && record.attributes.canview ? true : false}
                                 onChange={e => this.checkType(e, record, 'canview')}/></div>);
        },
      },
      {
        title: <div><Checkbox onChange={e => this.checkTypeAll(e, 'canadd')}
                              className={styles.checkSty}/><FormattedMessage id="role.table.add"/></div>,
        dataIndex: 'canadd',
        key: 'canadd',
        width: '8%',
        render: (text, record) => {
          return (<div><Checkbox checked={record.attributes && record.attributes.canadd ? true : false}
                                 onChange={e => this.checkType(e, record, 'canadd')}/></div>);
        },
      },
      {
        title: (<div>
          <Checkbox
            onChange={e => this.checkTypeAll(e, 'canmodify')}
            className={styles.checkSty}/>
          <FormattedMessage id="role.table.edit"/>
        </div>),
        dataIndex: 'canmodify',
        key: 'canmodify',
        width: '8%',
        render: (text, record) => {
          return (<div><Checkbox checked={record.attributes && record.attributes.canmodify ? true : false}
                                 onChange={e => this.checkType(e, record, 'canmodify')}/></div>);
        },
      },
      {
        title: (<div>
          <Checkbox
            onChange={e => this.checkTypeAll(e, 'candelete')}
            className={styles.checkSty}/>
          <FormattedMessage id="role.table.del"/>
        </div>),
        dataIndex: 'candelete',
        key: 'candelete',
        width: '8%',
        render: (text, record) => {
          return (<div><Checkbox checked={record.attributes && record.attributes.candelete ? true : false}
                                 onChange={e => this.checkType(e, record, 'candelete')}/></div>);
        },
      },
      {
        title: (<div>
          <Checkbox
            onChange={e => this.checkTypeAll(e, 'canprint')}
            className={styles.checkSty}/>
          <FormattedMessage id="role.table.print"/>
        </div>),
        dataIndex: 'canprint',
        key: 'canprint',
        width: '8%',
        render: (text, record) => {
          return (<div><Checkbox checked={record.attributes && record.attributes.canprint ? true : false}
                                 onChange={e => this.checkType(e, record, 'canprint')}/></div>);
        },
      },
      {
        title: (<div>
          <Checkbox
            onChange={e => this.checkTypeAll(e, 'candesign')}
            className={styles.checkSty}/>
          <FormattedMessage id="role.table.design"/>
        </div>),
        dataIndex: 'candesign',
        key: 'candesign',
        width: '8%',
        render: (text, record) => {
          return (<div><Checkbox checked={record.attributes && record.attributes.candesign ? true : false}
                                 onChange={e => this.checkType(e, record, 'candesign')}/></div>);
        },
      },
      {
        title: (<div>
          <Checkbox
            onChange={e => this.checkTypeAll(e, 'all')}
            className={styles.checkSty}/>
          <FormattedMessage id="role.table.all"/>
        </div>),
        dataIndex: 'canexport1',
        key: 'canexport1',
        width: '8%',
        render: (text, record) => {
          let flag;
          if (!!record.attributes) {
            const { candesign = 0, canadd = 0, canmodify = 0, candelete = 0, canview = 0, canprint = 0 } = record.attributes && record.attributes;
            flag = candesign && canadd && canmodify && candelete && canview && canprint ? true : false;
          } else {
            flag = flag;
          }
          return (
            <div><Checkbox checked={flag} onChange={e => this.checkType(e, record, 'all')}/></div>);
        },
      },
    ];
    const appColumns = [
      {
        title: <FormattedMessage id="role.table.function"/>,
        dataIndex: 'name',
        key: 'name',
        width: '36%',
      },
      {
        title: (
          <div><Checkbox onChange={e => this.checkAppAll(e, 'canview')} className={styles.checkSty}/><FormattedMessage
            id="role.table.look"/></div>),
        dataIndex: 'canview',
        key: 'canview',
        filterMultiple: true,
        width: '8%',
        render: (text, record) => {
          return (<div>{record.isGroup ? null :
            <Checkbox checked={record.attributes && record.attributes.canview ? true : false}
                      onChange={e => this.checkApp(e, record, 'canview')}/>}</div>);
        },
      },
      {
        title: <div><Checkbox onChange={e => this.checkAppAll(e, 'canadd')}
                              className={styles.checkSty}/><FormattedMessage id="role.table.add"/></div>,
        dataIndex: 'canadd',
        key: 'canadd',
        width: '8%',
        render: (text, record) => {
          return (<div>{record.isGroup || record.type === 'APP' ? null :
            <Checkbox checked={record.attributes && record.attributes.canadd ? true : false}
                      onChange={e => this.checkApp(e, record, 'canadd')}/>}</div>);
        },
      },
      {
        title: (<div>
          <Checkbox
            onChange={e => this.checkAppAll(e, 'canmodify')}
            className={styles.checkSty}/>
          <FormattedMessage id="role.table.edit"/>
        </div>),
        dataIndex: 'canmodify',
        key: 'canmodify',
        width: '8%',
        render: (text, record) => {
          return (<div>{record.isGroup || record.type === 'APP' ? null :
            <Checkbox checked={record.attributes && record.attributes.canmodify ? true : false}
                      onChange={e => this.checkApp(e, record, 'canmodify')}/>}</div>);
        },
      },
      {
        title: (<div>
          <Checkbox
            onChange={e => this.checkAppAll(e, 'candelete')}
            className={styles.checkSty}/>
          <FormattedMessage id="role.table.del"/>
        </div>),
        dataIndex: 'candelete',
        key: 'candelete',
        width: '8%',
        render: (text, record) => {
          return (<div>{record.isGroup || record.type === 'APP' ? null :
            <Checkbox checked={record.attributes && record.attributes.candelete ? true : false}
                      onChange={e => this.checkApp(e, record, 'candelete')}/>}</div>);
        },
      },
      {
        title: (<div>
          <Checkbox
            onChange={e => this.checkAppAll(e, 'canprint')}
            className={styles.checkSty}/>
          <FormattedMessage id="role.table.print"/>
        </div>),
        dataIndex: 'canprint',
        key: 'canprint',
        width: '8%',
        render: (text, record) => {
          return (<div>{record.isGroup || record.type === 'APP' ? null :
            <Checkbox checked={record.attributes && record.attributes.canprint ? true : false}
                      onChange={e => this.checkApp(e, record, 'canprint')}/>}</div>);
        },
      },
      {
        title: (<div>
          <Checkbox
            onChange={e => this.checkAppAll(e, 'candesign')}
            className={styles.checkSty}/>
          <FormattedMessage id="role.table.design"/>
        </div>),
        dataIndex: 'candesign',
        key: 'candesign',
        width: '8%',
        render: (text, record) => {
          return (<div>{record.isGroup || record.type === 'APP' ? null :
            <Checkbox checked={record.attributes && record.attributes.candesign ? true : false}
                      onChange={e => this.checkApp(e, record, 'candesign')}/>}</div>);
        },
      },
      {
        title: (<div>
          <Checkbox
            onChange={e => this.checkAppAll(e, 'all')}
            className={styles.checkSty}/>
          <FormattedMessage id="role.table.all"/>
        </div>),
        dataIndex: 'canexport1',
        key: 'canexport1',
        width: '8%',
        render: (text, record) => {
          let flag;
          if (!!record.attributes) {
            const { candesign = 0, canadd = 0, canmodify = 0, candelete = 0, canview = 0, canprint = 0 } = record.attributes && record.attributes;
            flag = candesign && canadd && canmodify && candelete && canview && canprint ? true : false;
          } else {
            flag = flag;
          }
          return (
            <div>{record.isGroup || record.type === 'APP' ? null :
              <Checkbox checked={flag} onChange={e => this.checkApp(e, record, 'all')}/>}</div>);
        },
      },
    ];
    const { loading, dataSourcePC, dataSourceApp } = this.state;
    const PCDeafaultConfig = {
      className: styles.tabHeight,
      columns: pcColumns,
      dataSource: dataSourcePC,
      pagination: false,
      loading: loading,
      rowKey: (record) => record.nodeKey,
      defaultExpandAllRows: true,
      expandIcon: this.CustomExpandIcon,
    };
    const APPDeafaultConfig = {
      className: styles.tabHeight,
      columns: appColumns,
      dataSource: dataSourceApp,
      pagination: false,
      loading: loading,
      rowKey: (record) => record.nodeKey,
      defaultExpandAllRows: true,
      expandIcon: this.CustomExpandIcon,
    };
    return (
      <Tabs
        defaultActiveKey={tabDefaultConfig.tabsActive}
        activeKey={tabDefaultConfig.tabsActive}
        animated={false}
        className={tabDefaultConfig.className}
        onChange={(activeKey) => this.changeTab(activeKey)}
      >
        <TabPane tab={<FormattedMessage id="splitLine.title.basic"/>} key="base">
          <FormConfigDetial tabDefaultConfig={tabDefaultConfig}/>
        </TabPane>
        <TabPane tab={<FormattedMessage id="role.tab.pc"/>} key="pc">
          <div className={styles.tabTitle}><FormattedMessage id="role.table.relation"/><span
            className={styles.tabTitleSpan}>【{activeDetail.name}】</span><FormattedMessage id="role.table.to"/></div>
          <CTable {...PCDeafaultConfig}/>
        </TabPane>
        <TabPane tab={<FormattedMessage id="role.tab.app"/>} key="app">
          <div className={styles.tabTitle}><FormattedMessage id="role.table.relation"/><span
            className={styles.tabTitleSpan}>【{activeDetail.name}】</span><FormattedMessage id="role.table.to"/></div>
          <CTable {...APPDeafaultConfig}/>
        </TabPane>
      </Tabs>)
      ;
  }
}

export default Ctab;
