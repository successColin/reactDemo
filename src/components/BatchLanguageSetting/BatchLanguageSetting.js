/*
 * @Author: jwk
 * @Date:   2020-03-17 9:20:23
 * @Desc: 语种列表
 */
import React, { Component, Fragment } from 'react';
import { Col, Row, Icon, Input, Select, Table, Pagination, Modal, Form } from 'antd';
import { connect } from 'dva';
import CModal from '@/components/common/CreateModal/CreateModal';
import LanguageGroupType from '@/components/LanguageGroupType/LanguageGroupType';
import { FormattedMessage } from 'react-intl';
import styles from './BatchLanguageSetting.less';
import HighFilter from './HighFilter/HighFilter';
import CMessage from '@/components/common/BasicWidgets/Widgets/CMessage/CMessage';
import { BaseContext } from '@/constants/global';
import { getDoBatchList, doBatchElement } from '@/services/language';
import { CButton, CSearch, CTable } from '@/components/common/BasicWidgets';

const InputGroup = Input.Group;
const { Search } = Input;
const { Option } = Select;
const { confirm } = Modal;
const SELECTOPTIONS = [ // 下拉框的值
  { key: '1', dom: <FormattedMessage id="pageConfig.col.showName"/> },
  { key: '2', dom: <FormattedMessage id="settingForm.placeholderText"/> },
  { key: '3', dom: <FormattedMessage id="settingForm.tooltipText"/> }];

@connect(state => ({
  functionData: state.tabs.activeTabData.functionData,
}))
class BatchLanguageSetting extends Component {
  static contextType = BaseContext;

  constructor(props) {
    super();
    this.state = {
      list: [],
      count: 0, // 列表数量
      visible: false,  // 新增弹框
      title: '', // 弹框名称
      pageSize: 10, // 默认分页10
      keyWords: '',
      pageNum: 1, // 默认第一页
      loading: false,
      selected: [], // 选中的行
      selectedRowKeys: [], // 勾选中的行
      selectedItems: [], // 勾选中的下拉框
      filterVisible: false, // 高级筛选
      searchValue: { keywords: '' },
      highFilter: {},
    };
  }

  componentDidMount() {
    this.getList();
  }

  // 获取数据
  getList = () => {
    const { pageSize, pageNum, searchValue, loading } = this.state;
    this.setState({ loading: true });
    getDoBatchList({ pageSize, pageNum, ...searchValue }).then((res = {}) => {
      this.setState({ loading: false, list: res.list || [], count: res.total });
    }, err => {
      this.setState({ loading: false });
    });
  };

  // 关联
  add = () => {
    const { selectedItems, selected } = this.state;
    if (!selectedItems.length || !selected.length) {
      const { langLib } = this.context;
      CMessage(langLib['message.error.msg'], 'error');
      return;
    }
    this.setState({
      visible: true,
      title: <FormattedMessage id="settingForm.relationLanguageTemplate"/>,
    });
  };

  // 单选
  onClickRow = (record, selectedRows) => {
    let { selected } = this.state;
    if (selectedRows) {
      if (selected.findIndex(item => item.elementid === record.elementid) !== -1) {
        selected.splice(selected.findIndex(item => item.elementid === record.elementid), 1);
      } else {
        selected.push(record);
      }
      this.setState({
        selected: [...selected],
      });
    }
  };
  // 全选或者反选
  onClickRowAll = (record, selectedRows, arr) => {
    let { selected } = this.state;
    if (record) {
      selectedRows.forEach(item => {
        let index = selected.findIndex(items => items.elementid === item.elementid);
        if (index === -1) {
          selected.push(item);
        }
      });
      this.setState({
        selected: [...selected],
      });
    } else {
      arr.forEach(item => {
        let index = selected.findIndex(items => items.elementid === item.elementid);
        if (index !== -1) {
          selected.splice(index, 1);
        }
      });
      this.setState({
        selected: [...selected],
      });
    }
  };
  // 点击行
  clickRow = (record) => {
    return {
      onClick: () => {
        let { selected } = this.state;
        if (selected.find((item) => item.elementid === record.elementid)) {
          selected.splice(selected.findIndex((item) => item.elementid === record.elementid), 1);
        } else {
          selected.push(record);
        }
        this.setState({
          selected: [...selected],
        });
      },
    };
  };

  // 切页
  changePage = (page, pageSize) => {
    this.setState({
      pageNum: page,
      pageSize,
    }, () => {
      this.getList();
    });
  };
  // 关联模板时选择的字段
  handleChange = (selectedItems) => {
    this.setState({
      selectedItems,
    });
  };
  // 点击保存时关联模板
  handleSave = (value) => {
    const { selected, selectedItems } = this.state;
    let params = {
      typeids: selectedItems,
      elements: selected,
      languagestemplateid: value.id,
      languagestemplatename: value.name,
    };
    doBatchElement(params).then(res => {
      this.setState({ visible: false, selectedItems: [], selected: [], pageNum: 1 }, () => {
        this.getList();
      });
    });
  };

  // 高级筛选
  doHighFilter = () => {
    this.props.form.validateFields((errs, values) => {
      if (errs) return;
      this.setState({
        pageNum: 1,
        searchValue: { queryMap: { ...values } },
        filterVisible: false,
        highFilter: values,
      }, () => {
        this.getList();
      });
    });
  };

  // 更新状态
  updateState = (obj, callback) => {
    this.setState({
      ...obj,
    }, () => {
      if (callback) {
        callback();
      }
    });
  };
  // 重置
  handleClear = () => {
    this.setState({
      highFilter: {},
    });
  };

  render() {
    const { highFilter, list, filterVisible, visible, title, pageSize, count, pageNum, loading, type, selected, selectedItems } = this.state;
    const { langLib } = this.context;
    const { form, functionData } = this.props;
    const { canmodify } = functionData.attributes;
    const columns = [
      {
        title: <FormattedMessage id="menu.table.sno"/>,
        dataIndex: 'sno',
        width: 80,
        render: (text, record, index) => {
          return <span>{(pageNum - 1) * pageSize + index + 1}</span>;
        },
      },
      {
        title: <FormattedMessage id="langauges.terminus"/>,
        dataIndex: 'type',
        width: 80,
      },
      {
        title: <FormattedMessage id="langauges.functionname"/>,
        dataIndex: 'functionname',
        width: 200,
      },
      {
        title: <FormattedMessage id="langauges.design"/>,
        dataIndex: 'userdesignername',
        width: 200,
      },
      {
        title: <FormattedMessage id="langauges.tab"/>,
        dataIndex: 'tabname',
        width: 200,
      },
      {
        title: <FormattedMessage id="pageConfig.col.showName"/>,
        dataIndex: 'displayname',
      },
      {
        title: <FormattedMessage id="settingForm.placeholderText"/>,
        dataIndex: 'placeholdertext',
      },
      {
        title: <FormattedMessage id="settingForm.tooltipText"/>,
        dataIndex: 'tooltiptext',
      },
    ];
    const modalProps = {
      title: title,
      visible: visible,
      size: 'large',
      className: styles.modal,
      footer: null,
      onCancel: () => {
        this.setState({ visible: false, selectedItems: [], selected: [] });
      },
    };

    const footer = (
      <Fragment>
        <CButton onClick={() => this.handleClear()}>
          <FormattedMessage id="global.reset"/>
        </CButton>
        <CButton onClick={() => this.setState({ filterVisible: false, selectedItems: [], selected: [] })}>
          <FormattedMessage id="global.cancel"/>
        </CButton>
        <CButton
          type="primary"
          onClick={() => this.doHighFilter()}
        >
          <FormattedMessage id="global.ok"/>
        </CButton>
      </Fragment>
    );
    const filterProps = {
      title: <FormattedMessage id="element.type.seniorFilter"/>,
      visible: filterVisible,
      className: styles.filterModal,
      onCancel: () => {
        this.setState({ filterVisible: false, selectedItems: [], selected: [] });
      },
      footer,
    };
    const LanguageGroupTypeProps = {
      type: 'addChooseBtn',
      chooseCallbackFun: this.handleSave,
      loading: loading,
      updateState: this.updateState,
    };
    const rowSelection = {
      type: 'checkbox',
      columnWidth: '50px',
      selectedRowKeys: selected.map(item => item.elementid),
      onSelectAll: (record, selected, selectedRows, nativeEvent) => {
        this.onClickRowAll(record, selected, selectedRows);
      },
      onSelect: (record, selected, selectedRows, nativeEvent) => {
        this.onClickRow(record, selectedRows);
      },
      onChange: (record, selected, selectedRows, nativeEvent) => {
        this.onClickRow(record, selectedRows);
      },
    };
    return <div className={`${styles.box} boxClass`}>
      <div className={`${styles.headerForm} headerFormClass`}>
        {canmodify ? <div className={styles.addNewBtn} onClick={() => this.add()}>
          <Icon className={`${styles.addnewBtnIco} custom-color`} type="plus-square"/>
          <FormattedMessage id="langauges.more.check"/>
        </div> : null}
        {canmodify ? <Select
          className={styles.multipleSty}
          mode="multiple"
          placeholder={langLib['language.placeholder.type']}
          value={selectedItems}
          onChange={this.handleChange}
        >
          {SELECTOPTIONS.map(item => (
            <Select.Option key={item.key} value={item.key}>
              {item.dom}
            </Select.Option>
          ))}
        </Select> : null}
        <InputGroup compact className={styles.highSearch}>
          <Search
            placeholder={langLib['form.placeholder.keywords']}
            onSearch={value => {
              this.setState({ pageNum: 1, searchValue: { keywords: value } }, () => {
                this.getList();
              });
            }}
            onChange={e => {
              let value = e.target.value;
              this.setState({ searchValue: { keywords: value } });
            }}
            style={{ width: 200 }}
          />
        </InputGroup>
        <div className={styles.filterSearch} onClick={() => this.setState({ filterVisible: true })}>
          <span className="icon-high_filter iconfont custom-color"></span>
          <FormattedMessage id="element.type.seniorFilter"/>
        </div>
      </div>
      <div style={{ 'height': 'calc(100% - 47px - 42px)' }}>
        <Table
          columns={columns}
          rowKey={record => record.elementid}
          dataSource={list}
          scroll={{ y: 'calc(100vh - 250px)' }}
          pagination={false}
          onRow={this.clickRow}
          loading={loading}
          rowSelection={rowSelection}
        />
      </div>
      <div className={`${styles.footer} footerClass`}>
        <Pagination
          pageSize={pageSize}
          onChange={this.changePage}
          showSizeChanger
          defaultCurrent={pageNum}
          // current={currentPage}
          total={count}
          pageSizeOptions={['10', '20', '50', '100', '200', '500', '1000']}
          showTotal={(total, range) => {
            return (
              <div><FormattedMessage id="global.total"/>{total}</div>
            );
          }}
          onShowSizeChange={this.changePage}
        />
      </div>
      <CModal {...modalProps}>
        <LanguageGroupType {...LanguageGroupTypeProps}/>
      </CModal>
      <CModal {...filterProps}>
        <HighFilter
          highFilter={highFilter}
          form={form}
        />
      </CModal>
    </div>;
  }
}


export default Form.create()(BatchLanguageSetting);
