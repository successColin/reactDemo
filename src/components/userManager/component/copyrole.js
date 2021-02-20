import React, { Component } from 'react';
import { Col, Row, Input, Checkbox, Radio } from 'antd';
import Styles from './copyrole.less';
import { FormattedMessage } from 'react-intl';
import { CSearch } from '@/components/common/BasicWidgets';
import CTable from '@/components/common/BasicWidgets/Widgets/CTable/CTable';
import { getUserGroup, getUserList } from '@/services/userManager';
import { BaseContext } from '@/constants/global';
import styles from '@/components/userManager/userConfig.less';

const { Search } = Input;

class CopyRole extends Component {
  static contextType = BaseContext;

  constructor(props) {
    super(props);
    this.state = {
      showType: 'tree',
      userId: props.activeDetail.id,
      treeData: [], // 树用户数据
      listData: {}, // 列表用户数据
      keywords: '',
      loading: false,
      pageNum: 1,
      expandedRowKeys: [], // 展开的行
      pageSize: 10,
      selected: [],
      checkData: {
        functionRole: 0,
        dataRole: 0,
        coverOrAppend: 0,
      }, // 右侧选中的值
    };
  }

  componentWillReceiveProps(nextProps) {
    const { activeDetail } = nextProps;
    if (activeDetail.id !== this.state.userId) {
      this.setState({
        showType: 'tree',
        userId: activeDetail.id,
        keywords: '',
        selected: [],
        expandedRowKeys: [],
        checkData: {
          functionRole: 0,
          dataRole: 0,
          coverOrAppend: 0,
        },
      }, () => {
        // this.getData();
      });
    }
  }

  // componentDidMount() {
  //   this.getData('tree');
  // }

// 切换类型
  changeShowType = (type) => {
    this.setState({
      showType: type,
      selected: [],
      expandedRowKeys: [],
    }, () => {
      this.getData();
    });
  };
  // 获取
  getData = () => {
    const { showType, keywords, pageNum, pageSize } = this.state;
    this.setState({
      loading: true,
    });
    if (showType === 'tree') {
      let params = keywords ? { keywords } : { groupId: 0 };
      getUserGroup(params).then(res => {
        this.setState({
          treeData: res,
          loading: false,
          selected: [],
        });
      });
    } else {
      let params = {
        pageNum,
        pageSize,
        username: keywords,
      };
      getUserList(params).then(res => {
        this.setState({
          listData: res,
          loading: false,
          selected: [],
        });
      });
    }
  };
  // 箭头
  CustomExpandIcon = (props) => {
    let icon = null;
    if (props.expanded && Array.isArray(props.record.children) && props.record.children.length) {
      icon = 'icon-arrow-open';
    } else if (!props.expanded && props.record.childCount) {
      icon = 'icon-arrow-right';
    }
    return (
      <span
        className={`${icon} iconfont ${Styles.openIcon}`}
        onClick={e => {
          e.preventDefault();
          props.onExpand(props.record, e);
        }}
      />
    );
  };
  // 列表选中数据
  onClickRow = (record, selectedRows) => {
    const { updateFrameState } = this.props;
    this.setState({
      selected: selectedRows,
    }, () => {
      updateFrameState({ copyRoleSelect: this.state.selected });
    });


  };
  clickRow = (record) => {
    return {
      onClick: () => {
        let { selected } = this.state;
        const { updateFrameState } = this.props;
        // console.log(selected, record);
        if (selected.find((item) => item.id === record.id)) {
          selected.splice(selected.findIndex((item) => item.id === record.id), 1);
        } else {
          selected.push(record);
        }
        this.setState({
          selected,
        }, () => {
          updateFrameState({ copyRoleSelect: this.state.selected });
        });
      },
    };
  };
  checkRadio = (e, filed, type) => {
    const { checkData } = this.state;
    const { updateFrameState } = this.props;
    let value = type === 'Checkbox' ? e.target.checked ? 1 : 0 : e.target.value;
    this.setState({
      checkData: {
        ...checkData,
        [filed]: value,
      },
    }, () => {
      updateFrameState({ copyRoleData: this.state.checkData });
    });

  };
  checkRoleAll = (e, record) => {
    this.clickTreeRow(record, () => {
      this.Checkbox(e, record);
    }, 'check');
  };
  Checkbox = (e, record) => {
    const { langLib } = this.context;
    const isCheck = e.target.checked;
    let { treeData, selected } = this.state;
    if (isCheck) {
      if (selected.findIndex(v => {
        return v.id === record.id;
      }) === -1) {
        selected.push(record);
      }
    } else {
      selected.splice(selected.findIndex(v => {
        return v.id === record.id;
      }), 1);
    }
    this.getMenuBtnList(treeData, isCheck, record);
    this.setState({
      selected,
    }, () => {
      const { updateFrameState } = this.props;
      updateFrameState({ copyRoleSelect: this.state.selected });
    });
  };
  getMenuBtnList = (menuTreeList, isCheck, params, render) => {
    for (let item of menuTreeList) {
      if (item.nodeKey === params.nodeKey && item.isGroup === params.isGroup) {
        item.checked = isCheck;
        // if (!render) {
        //   if (Array.isArray(item.children) && item.children.length) {
        //     this.checkChildTrue(item.children, isCheck, params);
        //   }
        // }
      } else if (Array.isArray(item.children) && item.children.length) {
        this.getMenuBtnList(item.children, isCheck, params, render);
      }
    }
  };
  checkChildTrue = (menuTreeList, isCheck) => {
    let { selected = [] } = this.state;
    for (let item of menuTreeList) {
      item.checked = isCheck;
      if (isCheck) {
        if (selected.findIndex(v => {
          return v.id === item.id;
        }) === -1) {
          selected.push(item);
        }
      } else {
        selected.splice(selected.findIndex(v => {
          return v.id === item.id;
        }), 1);
      }
      this.setState({ selected }, () => {
        const { updateFrameState } = this.props;
        updateFrameState({ copyRoleSelect: this.state.selected });
      });
      if (Array.isArray(item.children) && item.children.length) {
        this.checkChildTrue(item.children, isCheck);
      }
    }
  };
  // 点击行，分2种情况，如果是选择之后点击行，展开的子节点根据是选择中展开，反之
  clickTreeRow = (record, callback, type) => {
    const { treeData, keywords, expandedRowKeys } = this.state;
    const { isGroup } = record;
    if (expandedRowKeys.includes(record.nodeKey)) {
      let index = expandedRowKeys.findIndex(item => item === record.nodeKey);

      expandedRowKeys.splice(index, 1);
      this.setState({ expandedRowKeys });
    } else {
      expandedRowKeys.push(record.nodeKey);
      this.setState({ expandedRowKeys });
    }
    if ((Array.isArray(record.children) && record.children.length)) {
      callback && callback();
      this.checkChildTrue(record.children, record.checked);
    } else {
      if (!type) {
        if (keywords) return;
        let params = { groupId: record.id };
        this.setState({ loading: true });
        getUserGroup(params).then(res => {
          record.children = res;
          this.setState({
            treeData,
            loading: false,
          }, () => {
            this.checkChildTrue(record.children, record.checked);
          });
        });
      } else {
        callback && callback();
      }
    }
    ;
  };


  render() {
    const { langLib } = this.context;
    const { showType, loading, listData, treeData, selected, checkData, userId, expandedRowKeys } = this.state;
    const functionColumns = [
      {
        title: <FormattedMessage id="role.table.function"/>,
        dataIndex: 'name',
        key: 'name',
        width: '80%',
      },
      {
        title: (
          <div><Checkbox onChange={e => this.checkRoleAll(e)}/></div>),
        dataIndex: 'caninherit',
        key: 'caninherit',
        width: '8%',
        render: (text, record) => {
          return (<div>{record.id === userId ? null :
            <Checkbox checked={record.checked} onChange={e => this.checkRoleAll(e, record)}/>}
          </div>);
        },
      },
    ];
    const listColumns = [
      {
        title: <FormattedMessage id="global.keycode"/>,
        dataIndex: 'keycode',
        render: text => <span title={text}>{text}</span>,
      }, {
        title: <FormattedMessage id="global.name"/>,
        dataIndex: 'username',
        render: text => <span title={text}>{text}</span>,
      }, {
        title: <FormattedMessage id="global.group"/>,
        dataIndex: 'groupName',
        render: text => <span title={text}>{text}</span>,
      },
      // {
      //   title: <FormattedMessage id="global.root"/>,
      //   dataIndex: 'rootname',
      //   render: text => <span title={text}>{text}</span>,
      // },
    ];
    const rowSelection = {
      type: 'checkbox',
      selectedRowKeys: selected.map(item => item.id),
      onSelectAll: (record, selected, selectedRows, nativeEvent) => {
        this.onClickRow(record, selected);
      },
      onSelect: (record, selected, selectedRows, nativeEvent) => {
        this.onClickRow(record, selectedRows);
      },
      onChange: (record, selected, selectedRows, nativeEvent) => {
        this.onClickRow(record, selectedRows);
      },
    };
    const pagination = {
      total: listData.total,
      current: listData.pageNum,
      pageSize: listData.pageSize,
      onChange: (pageNum, newPageSize) => {
        const { updateFrameState } = this.props;
        this.setState({
          pageNum,
          pageSize: newPageSize,
          selected: [],
        }, () => this.getData(showType));
        updateFrameState({ copyRoleSelect: this.state.selected });
      },
    };
    const DeafaultConfig = showType === 'tree' ? {
      columns: functionColumns,
      dataSource: treeData,
      loading: loading,
      defaultExpandAllRows: true,
      // expandRowByClick: true,
      expandedRowKeys,
      expandIcon: this.CustomExpandIcon,
      rowKey: record => record.nodeKey,
      showHeader: false,
      pagination: false,
      className: Styles.listTabSty1,
      onRow: record => {
        return {
          onClick: event => {
            this.clickTreeRow(record);
          }, // 点击行
          onDoubleClick: event => {
          },
          onContextMenu: event => {
          },
          onMouseEnter: event => {
          }, // 鼠标移入行
          onMouseLeave: event => {
          },
        };
      },
    } : {
      columns: listColumns,
      dataSource: (listData.list || []).filter(item => item.id !== userId) || [],
      loading: loading,
      rowKey: record => record.id,
      onRow: this.clickRow,
      rowSelection: rowSelection,
      pagination: pagination,
      className: Styles.listTabSty,
    };

    return (
      <div className={Styles.copyRole}>
        <div className={Styles.userList}>
          <div className={Styles.copyRoleHeader}>
            <Col span={16}>
              <span onClick={() => this.changeShowType('tree')}
                    className={`iconfont ${showType === 'tree' ? 'custom-color' : ''} icon-switch-tree ${Styles.userSwitchIcon}`}></span>
              <span onClick={() => this.changeShowType('list')}
                    className={`iconfont ${showType === 'list' ? 'custom-color' : ''} icon-switch-list ${Styles.userSwitchIcon}`}></span>
            </Col>
            <Col span={8} style={{ 'textAlign': 'right' }}>
              <Search
                placeholder={langLib['form.placeholder.keywords']}
                onSearch={value => this.getData()}
                value={this.state.keywords}
                onChange={e => this.setState({ keywords: e.target.value })}
                style={{ 'width': '190px', 'marginRight': '8px' }}
              />
            </Col>
          </div>
          <CTable {...DeafaultConfig}/>
        </div>
        <div className={Styles.userCheck}>
          <div className={Styles.copyRoleHeader1}>
            <FormattedMessage id="role.copy.setting"/>
          </div>
          <div className={Styles.checkboxList}>
            <Row className={Styles.rowHeight}>
              <Col span={20}> <FormattedMessage id="user.form.function"/></Col>
              <Col span={4}><Checkbox checked={checkData.functionRole}
                                      onChange={(e) => this.checkRadio(e, 'functionRole', 'Checkbox')}></Checkbox></Col>
            </Row>
            <Row className={Styles.rowHeight}>
              <Col span={20}> <FormattedMessage id="user.form.data"/></Col>
              <Col span={4}><Checkbox checked={checkData.dataRole}
                                      onChange={(e) => this.checkRadio(e, 'dataRole', 'Checkbox')}></Checkbox></Col>
            </Row>
            <Radio.Group style={{ 'width': '100%' }} onChange={(e) => this.checkRadio(e, 'coverOrAppend', 'Radio')}
                         value={checkData.coverOrAppend}>
              <Row className={Styles.rowHeight}>
                <Col span={20}> <FormattedMessage id="user.overlay.existing"/></Col>
                <Col span={4}><Radio value={0}></Radio></Col>
              </Row>
              <Row className={Styles.rowHeight}>
                <Col span={20}> <FormattedMessage id="user.additional.existing"/></Col>
                <Col span={4}><Radio value={1}></Radio></Col>
              </Row>
            </Radio.Group>
          </div>
        </div>
      </div>
    );
  }
}

export default CopyRole;
