import React, { Component } from 'react';
import { Col, Icon, Pagination, Row, Modal, Select, Input } from 'antd';
import { connect } from 'dva';
import CTable from '@/components/common/BasicWidgets/Widgets/CTable/CTable';
import CreateModal from '@/components/common/CreateModal/CreateModal';
import ContentContainer from '../ContentContainer';
import { FormattedMessage } from 'react-intl';
import { BTN_ELEMENT_TYPE, HIDE_IN_LIST_ELEMENT_TYPE } from '@/constants/element';
import Styles from '../DetailList/DetailList.less';
import CMessage from '@/components/common/BasicWidgets/Widgets/CMessage/CMessage';
import { CSearch, CSpin, CInput } from '@/components/common/BasicWidgets';
import Zmage from 'react-zmage';
import { getList, updateMore, del, handleSave } from '@/services/leftListFrame';
import DetailList from '@/components/Frames/LeftListFrame/ContentContainer/DetailList/DetailList';
import { getValueFromGlobalVariables, jsonParse, getDefaultConfirmProps, parseDecimal } from '@/utils/common';
import { BaseContext } from '@/constants/global';
import ListBtn from '@/components/Frames/FullListFrame/ContentContainer/ListButton/FooterButton';
import ModalBox from '@/components/common/ReminderBox/ReminderBox';

const initQueryParams = {
  pageNum: 1,
  pageSize: 10,

};
const { confirm } = Modal;
const InputGroup = Input.Group;
const { Option } = Select;
const { Search } = Input;

@connect(state => ({
  functionData: state.tabs.activeTabData.functionData,
  // userInfo: state.user.userInfo,
}))

class PopupList extends Component {
  static contextType = BaseContext;

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      elementMap: [],
      formData: {}, // 获取面板的数据
      basicData: [],// 初始数据
      relationTabInfo: {},
      tabList: props.tabList || [],
      popupListDataResult: [],
      pageNum: 1,
      pageSize: 10,
      selectedListArr: [],
      ele: {}, // 关联的按钮元素
      queryParams: initQueryParams,
      loading: false,
      selected: [],
      calendarList: [], // 查询条件
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      formData: nextProps.formData,
      selected: nextProps.selectedListArr,
      basicData: nextProps.formData,
    });
  }

  // 计算宽度
  conutWidth = () => {
    const { tabInfo, elementMap } = this.props;
    if (JSON.stringify(elementMap) === '{}') return;
    let totalWidth = 0;
    let elementObj = elementMap[tabInfo.id];
    let realDomWidth = this.refs.getContentWidth && this.refs.getContentWidth.clientWidth || 0;
    let tableColumes = elementObj.filter((item) => {
      return !HIDE_IN_LIST_ELEMENT_TYPE.includes(item.basetype) && item.visiabled;
    }) || [];
    tableColumes.forEach(item => {
      if (item.columnSpan && item.columnSpan > 100) {
        totalWidth += (Number(item.columnSpan) % 100 / 100 * realDomWidth);
      } else {
        totalWidth += 100;
      }
    });
    return totalWidth;
  };
  // 修改值
  changeValue = (value, index, item, record) => {
    const { id } = item;
    record[id] = JSON.stringify({ id: value, name: value });
    record[`a${id}`] = value;
    const { formData } = this.state;
    let newFormData = JSON.parse(JSON.stringify(formData));
    newFormData.datalist[index] = record;
    this.setState({ formData: newFormData });
  };
  // 失去焦点修改值
  updateValue = (eleObj, record, value, index) => {
    const { tabInfo, elementMap } = this.props;
    const { basicData } = this.state;
    const { langLib } = this.context;
    if (JSON.stringify(elementMap) === '{}') return;
    let elementObj = elementMap[tabInfo.id];
    let idEleObj = elementObj.find(item => item.relationColumnName === 'id');
    if (!idEleObj) return;
    let that = this;
    const { relationTableName, id } = idEleObj;
    const oldRecord = basicData.datalist[index];
    let oldValue = JSON.parse(oldRecord[`${eleObj.id}`]).id;
    if (oldValue === value) return; // 新值和老值做对比，相同不允许编辑
    let { close } = ModalBox.confirm({
      ...getDefaultConfirmProps(langLib),
      title: langLib['message.sure.update'],
      onOk() {
        let params = {
          static_tableName: relationTableName,
          id: record[`a${id}`],
          [eleObj.relationColumnName]: parseDecimal(value),
        };
        handleSave(params).then(res => {
          const { queryParams, calendarList } = that.state;
          const { updataPageIndexOrSize } = that.props;
          CMessage(langLib['message.save.success'], 'success');
          updataPageIndexOrSize({ queryParams, calendarList });
          closeModal();
        });
      },
      onCancel: () => {
        const { queryParams, calendarList } = that.state;
        const { updataPageIndexOrSize } = that.props;
        updataPageIndexOrSize({ queryParams, calendarList });
        closeModal();
      },
    });
    const closeModal = () => {
      close();
    };
  };
  // 生成表头
  getTableColumns = () => {
    const { tabInfo, elementMap } = this.props;
    if (JSON.stringify(elementMap) === '{}') return;
    let elementObj = elementMap[tabInfo.id];
    let realDomWidth = this.refs.getContentWidth && this.refs.getContentWidth.clientWidth || 0;

    let tableColumes = elementObj.filter((item) => {
      return !HIDE_IN_LIST_ELEMENT_TYPE.includes(item.basetype) && item.visiabled;
    }) || [];
    return tableColumes.map((item, index) => {
      return {
        zid: index,
        title: item.displayName,
        dataIndex: item.id,
        key: item.id,
        width: (item.columnSpan && item.columnSpan > 100) ? (item.columnSpan % 100 / 100 * realDomWidth) + 'px' : '',
        render: (text, record) => {
          const { relationTabId, id, relationColumnName, defaultValue, basetype, elementFormat } = item;
          const content = record[`a${id}`] && record[`a${id}`].indexOf('1970-01-01') > -1 ? '' : (parseDecimal(record[`a${id}`]) || defaultValue);
          // 有关联弹出面板的控件
          if (relationTabId) {
            return (
              <a title={content} onClick={(e) => this.props.setPopupTabInfo(item, record)}>
                {content}
              </a>
            );
          }
          if (basetype === 8 && elementFormat === 2 && content) {
            const splitIndex = content.indexOf('_');
            const fileUrl = content.substring(splitIndex + 1, content.length);
            return <div style={{ 'width': '86px', 'height': '86px', 'display': 'flex', 'alignItems': 'center' }}><Zmage
              style={{ 'width': '100%' }}
              src={fileUrl}/></div>;
          }
          return <span title={content}>{content}</span>;
        },
      };
    });
  };
  // 生成可编辑表头
  getEditTableColumns = () => {
    const { tabInfo, elementMap } = this.props;
    if (JSON.stringify(elementMap) === '{}') return;
    let elementObj = elementMap[tabInfo.id];
    let realDomWidth = this.refs.getContentWidth && this.refs.getContentWidth.clientWidth || 0;

    let tableColumes = elementObj.filter((item) => {
      return !HIDE_IN_LIST_ELEMENT_TYPE.includes(item.basetype) && item.visiabled;
    }) || [];
    let columns = tableColumes.map((item, index) => {
      return {
        zid: index,
        title: item.displayName,
        dataIndex: item.id,
        key: item.id,
        width: (item.columnSpan && item.columnSpan > 100) ? (item.columnSpan % 100 / 100 * realDomWidth) + 'px' : '',
        render: (text, record, index) => {
          const { relationTabId, id, relationColumnName, defaultValue, readonly, basetype, elementFormat } = item;
          const content = record[`a${id}`] && record[`a${id}`].indexOf('1970-01-01') > -1 ? '' : (parseDecimal(record[`a${id}`]) || '');
          if (basetype === 1 && !readonly) {
            const content2 = record[`a${id}`] && record[`a${id}`].indexOf('1970-01-01') > -1 ? '' : (record[`a${id}`] || '');
            return <CInput value={content2} key={`${item.id}_${index}`} onBlur={(e) => {
              this.updateValue(item, record, e.target.value, index);
            }} onChange={(e) => {
              this.changeValue(e.target.value, index, item, record);
            }}/>;
          }
          // 有关联弹出面板的控件
          if (relationTabId) {
            return (
              <a title={content} onClick={(e) => this.props.setPopupTabInfo(item, record)}>
                {content}
              </a>
            );
          }
          if (basetype === 8 && elementFormat === 2 && content) {
            const splitIndex = content.indexOf('_');
            const fileUrl = content.substring(splitIndex + 1, content.length);
            return <div style={{ 'width': '86px', 'height': '86px', 'display': 'flex', 'alignItems': 'center' }}><Zmage
              style={{ 'width': '100%' }}
              src={fileUrl}/></div>;
          }
          return <span title={content}>{content}</span>;
        },
      };
    });
    let multiJumpBtn = elementObj.find(item => item.basetype === 43 && item.visiabled); // 多菜单跳转
    let multiTabBtn = elementObj.find(item => item.basetype === 44 && item.visiabled);
    const { multiJump, multiTabJump } = this.props;
    let btnColums = {
      title: <FormattedMessage id="global.operator"/>,
      dataIndex: 'operatorcheck',
      key: 'operatorcheck',
      width: 300,
      render: (text, record) => {
        return <div className="custom-color">
          {!!multiJumpBtn && <span className={Styles.columsSpan} onClick={() => {
            multiJump(multiJumpBtn, record);
          }}>{multiJumpBtn.displayName} </span>}
          {!!multiTabBtn && <span className={Styles.columsSpan} onClick={() => {
            multiTabJump(multiTabBtn, record);
          }}>{multiTabBtn.displayName} </span>}
        </div>;
      },
    };
    if (!multiJumpBtn && !multiTabBtn) return columns;
    columns.push(btnColums);
    // }
    return columns;
  };
  // 生成按钮
  renderBtnGroup = () => {
    const { tabInfo, elementMap, handleClickBtn, normalBtnInList, functionData } = this.props;
    const { canadd, candelete, candesign, canexport, canmodify, canview, canprint } = functionData.attributes;

    let elementObj = elementMap[tabInfo.id];
    let btnArr = elementObj.filter((item) => {
      return (BTN_ELEMENT_TYPE.includes(item.basetype) && item.visiabled);
    }) || [];
    return btnArr.map((item) => {
      const { basetype } = item;
      switch (basetype) {
        case 4:
          return (
            canadd ? <div className={Styles.divFlex} key={item.id} onClick={() => handleClickBtn(item)}>
              <div className={Styles.addNewBtn}>
                <Icon className={`${Styles.addnewBtnIco} custom-color`} type="plus-square"/>
                <span>{item.displayName}</span>
              </div>
            </div> : null);
        case 5:
          return (canmodify ? <div className={Styles.divFlex} key={item.id} onClick={() => handleClickBtn(item)}>
            <div className={Styles.addNewBtn}>
              <span className={`${Styles.commonIconStyle} custom-color iconEdit iconfont`}></span>
              <span>{item.displayName}</span>
            </div>
          </div> : null);
        case 6:
          return (candelete ? <div className={Styles.divFlex} key={item.id} onClick={() => this.btnClick(item)}>
            <div className={Styles.addNewBtn}>
              <span className={`${Styles.commonIconStyle} custom-color icondelete iconfont`}></span>
              <span>{item.displayName}</span>
            </div>
          </div> : null);
        case 18:
          return (canadd ? <div className={Styles.divFlex} key={item.id} onClick={() => this.btnClick(item)}>
            <div className={Styles.addNewBtn}>
              <Icon className={`${Styles.addnewBtnIco} custom-color`} type="plus-square"/>
              <span>{item.displayName}</span>
            </div>
          </div> : null);
        case 24:
          return (canmodify ? <div className={Styles.divFlex} key={item.id} onClick={() => this.btnClick(item)}>
            <div className={Styles.addNewBtn}>
              <Icon className={`${Styles.addnewBtnIco} custom-color`} type="plus-square"/>
              <span>{item.displayName}</span>
            </div>
          </div> : null);
        case 30:
          return (canprint ?
            <div key={item.id} className={Styles.divFlex} onClick={() => handleClickBtn(item)}>
              <div className={Styles.addNewBtn}>
                <span className={`${Styles.commonIconStyle} custom-color iconExport iconfont`}></span>
                <span>{item.displayName}</span>
              </div>
            </div> : null);
        default:
          return null;
      }
    });
  };
  btnClick = (ele) => {
    const { basetype } = ele;
    const { handleClickBtn } = this.props;
    switch (basetype) {
      case 4:
        return this.add(ele);
      case 5:
        return this.eddit(ele);
      case 6:
        return this.delete(ele);
      case 18:
        return this.relationTable(ele);
      case 24:
        return handleClickBtn(ele);
      default:
        return null;
    }
  };

  // 删除
  delete = (ele) => {
    const { langLib } = this.context;
    const { selected, tabList } = this.state;
    const { elementMap, tabInfo } = this.props;
    const { relationTableName } = ele;
    let elementObj = elementMap[tabInfo.id];
    let idEle = elementObj.find(item => item.relationColumnName === 'id');
    let that = this;
    if (selected.length) {
      let { close } = ModalBox.confirm({
        ...getDefaultConfirmProps(langLib),
        content: '',
        onOk() {
          let params = {
            tableName: relationTableName,
            ids: selected.map(item => JSON.parse(item[`${idEle.id}`]).id).join(','),
          };
          del(params).then(res => {
            that.props.updataState({
              selectedListArr: [],
              pageIndex: 1,
            }, () => {
              closeModal();
              that.props.updataPageIndexOrSize();
            });
          });
        },
        onCancel: () => closeModal(),
      });
      const closeModal = () => {
        close();
      };
      // confirm({
      //   ...getDefaultConfirmProps(langLib),
      //   content: '',
      //   className: 'customConfirmColor',
      //   onOk() {
      //     let params = {
      //       tableName: relationTableName,
      //       ids: selected.map(item => JSON.parse(item[`${idEle.id}`]).id).join(','),
      //     };
      //     del(params).then(res => {
      //       that.props.updataState({
      //         selectedListArr: [],
      //         pageIndex: 1,
      //       }, () => {
      //         that.props.updataPageIndexOrSize();
      //       });
      //     });
      //   },
      //   onCancel() {
      //   },
      // });
    } else {
      CMessage(langLib['message.please.choose'], 'error');
    }
  };
  // 点击按钮弹框选择数据
  relationTable = (ele) => {
    const { relationTabId } = ele;
    if (relationTabId) { // 关联了面板
      const { elementMap, tabList } = this.props;
      let relationTab = elementMap[relationTabId];
      let tabInfo = tabList.find(item => item.id === relationTabId);
      this.setState({ relationTab, visible: true, relationTabInfo: tabInfo, ele }, () => {
        this.fetchPopupListData({});
      });
    }
  };
  // 获取弹出面板的数据
  fetchPopupListData = ({ queryParams = initQueryParams, calendarList }) => {
    const { relationTabInfo } = this.state;
    const { detailListProps, advancedQueryMap, userInfo, elementMap, activeTreeNode, tabList } = this.props;
    const { pageSize, pageNum } = queryParams;
    // const { elementMap, tabInfo, treeNodeData } = detailListProps;
    if (!relationTabInfo.id) return;
    const { id: tabId, relationTableName: tabSource } = relationTabInfo;
    const elementList = elementMap[tabId].map(item => {
      const { relationColumnName: name, basetype: baseType, mainColumnName, mainTableName, elementMultiRelation, id: elementId, relationColumnType, elementFormat } = item;
      return {
        elementId, name, baseType, mainColumnName, mainTableName, elementMultiRelation, relationColumnType,
        elementFormat,
      };
    });
    const queryList = advancedQueryMap[relationTabInfo.id] || [];
    // let leftListTabInfo = tabList.find(item => item.showType === 3);
    // let leftListIdEle = elementMap[leftListTabInfo.id].find(item => item.relationColumnName === 'id'); // 左侧列表的id字段
    // const nodeId = jsonParse(activeTreeNode[leftListIdEle.id]).id;
    const globalMap = {};
    queryList.forEach(item => {
      const { asqlValueType, asqlValue } = item;
      // 值类型为【变量】时，需要将变量对应的值传给后台
      if (asqlValueType === 2) {
        // @@BusinessID 取左侧树的主业务数据（因为左侧树无法配置）
        if (asqlValue === '@@BusinessID') {
          // globalMap[item.asqlValue] = nodeId;
        } else {
          // 当前时间、当前用户
          const globalVar = getValueFromGlobalVariables({
            globalVar: asqlValue,
            userInfo,
            // treeNodeData,
          });
          // 或用户自定义的变量
          // (在关联新增按钮的弹出面板上，只有上一个面板为表单时，才可以获取自定义的变量)
          // （若上一个面板为列表，则无法定位到定义的变量具体哪条数据值）
          // 业务关联文档展示类型却是默认第一个面板为列表的，故无需在该组件中加入自定义变量
          globalMap[item.asqlValue] = globalVar || '';
        }
      }
    });
    const params = {
      elementList,
      tabId,
      tabSource,
      pageNum,
      pageSize,
      globalMap,
      calendarList,
    };
    // this.setLoadingStatus('popupList', true);
    getList(params).then(popupListDataResult => {
      this.setState({ popupListDataResult, loading: false });
      // this.setLoadingStatus('popupList', false);
      // }, err => this.setLoadingStatus('popupList', false));
    }, err => console.log(err));
  };
  // 点击行
  onClickRow = (record, selectedRows) => {
    this.props.updataState({
      selectedListArr: selectedRows,
    });
  };
  handleSave = () => {
    const { langLib } = this.context;
    const { ele, selectedRows, editType, selectedListArr } = this.state;
    const { tabId, relationTabId } = ele;
    const { elementMap, tabList, tabInfo, fromType, prevListRowData, prevTabInfo, originElementMap } = this.props;
    if (fromType !== 'inPopup') return;
    let table = tabList.find((item) => item.id === tabId);
    let popListIdEle = originElementMap[relationTabId].find(item => item.relationColumnName === 'id'); // 关联面板的id字段
    // let leftListTabInfo = tabList.find(item => item.showType === 3);
    // let leftListIdEle = elementMap[leftListTabInfo.id].find(item => item.relationColumnName === 'id'); // 左侧列表的id字段
    let preIdOBj = originElementMap[prevTabInfo.id].find(item => item.relationColumnName === 'id');
    let activeRelationColumnValue = prevListRowData[`a${preIdOBj.id}`];
    let activeRelationColumn = table.relationColumn;
    let relationColumnName = ele.relationColumnName;
    if (!selectedListArr.length) {
      CMessage(langLib['message.please.choose'], 'error');
      return;
    }
    let arr = selectedListArr.map((item) => {
      let obj = {
        [relationColumnName]: JSON.parse(item[popListIdEle.id]).id,
        static_tableName: ele.relationTableName,
        [activeRelationColumn]: activeRelationColumnValue,
        // ...item,
      };
      return obj;
    });
    let params = {
      static_list: arr,
    };
    updateMore(JSON.stringify(params)).then(res => {
      this.setState({ visible: false, selectedListArr: [] }, () => {
        this.props.updataState({
          selectedListArr: [],
          pageIndex: 1,
        }, () => {
          this.props.updataPageIndexOrSize();
        });
      });
    });
  };
  // 状态更新
  updataState = (obj = {}, callback) => {
    this.setState({
      ...obj,
    }, () => {
      if (callback) {
        callback();
      }
    });
  };
  reduceDataSource = () => {
    let formData = this.state.formData, dataSourceArr = [];
    let dataSource = new Object(formData).datalist || [];
    let { total, pageNum, pageSize } = new Object(formData);
    const { tabInfo, elementMap } = this.props;
    const { id } = tabInfo;
    let elementList = elementMap[id];
    let newDataSource = [];
    dataSource.forEach((item, index) => {
      let newItem = JSON.parse(JSON.stringify(item));
      for (let key in item) {
        if (Number(key).toString() !== 'NaN') {
          newItem[`a${key}`] = JSON.parse(item[key]).name;
          newItem.zindex = (pageNum - 1) * pageSize + index;
        } else {
          let obj = elementList.find((value) => {
            return value.relationColumnName === key;
          });
          if (obj) {
            newItem[`a${obj.id}`] = JSON.parse(item[key]).name;
            newItem.zindex = (pageNum - 1) * pageSize + index;
          }
        }
        if (key === 'id') {
          newItem.id = JSON.parse(item[key]).name;
        }
      }
      let data = {
        ...item,
        ...newItem,
      };
      newDataSource.push(data);
    });
    return newDataSource;
  };
  // 点击行
  clickRow = (record) => {
    return {
      onClick: () => {
        let { selected } = this.state;
        const { matchTabList, fetchListData, tabInfo, elementMap } = this.props;
        let tabInfoIdEle = elementMap[tabInfo.id].find(item => item.relationColumnName === 'id'); // 左侧列表的id字段

        if (selected.find(item => item[tabInfoIdEle.id] === record[tabInfoIdEle.id])) {
          selected.splice(selected.findIndex((item) => item[tabInfoIdEle.id] === record[tabInfoIdEle.id]), 1);
        } else {
          selected.push(record);
        }
        this.props.updataState({
          selectedListArr: [...selected],
        });
      },
    };
  };
  doSearch = () => {
    this.props.updataPageIndexOrSize();
  };

  render() {
    let totalWidth = this.conutWidth();
    const { matchTabList, updataPageIndexOrSize, tabInfo, elementMap } = this.props;
    const { selected = [], loading, visible, relationTabInfo, tabList, triggerMap, pageNum, pageSize, popupListDataResult, queryParams, formData } = this.state;
    let columns = this.getTableColumns();
    // 判断是否可以行编辑
    if (tabInfo.canLineEdit === 1) {
      columns = this.getEditTableColumns();
    }
    let dataSource = this.reduceDataSource();
    let elementObj = tabInfo && elementMap[tabInfo.id] || [];
    let searchArr = elementObj.filter((item) => {
      return (item.basetype === 14 && item.visiabled);
    }) || [];
    let btnArr = elementObj.filter((item) => {
      return (BTN_ELEMENT_TYPE.includes(item.basetype) && item.visiabled);
    }) || [];
    let tabInfoIdEle = JSON.stringify(elementMap) !== '{}' && elementMap[tabInfo.id].find(item => item.relationColumnName === 'id'); // 左侧列表的id字段
    const pagination = {
      total: formData.total,
      current: formData.pageNum,
      pageSize: formData.pageSize,
      showSizeChanger: true,
      onChange: (pageNum, newPageSize) => {
        this.setState({
          queryParams: {
            ...queryParams,
            pageNum,
            pageSize: newPageSize,
            loading: true,
          },
        }, () => {
          this.props.updataState({
            selectedListArr: [],
            pageIndex: pageNum,
            pageSize: newPageSize,
          }, () => {
            updataPageIndexOrSize();
          });
        });
      },
      onShowSizeChange: (current, size) => {
        this.setState({
          queryParams: {
            ...queryParams,
            pageNum: 1,
            pageSize: size,
            loading: true,
          },
        }, () => {
          this.props.updataState({
            selectedListArr: [],
            pageIndex: 1,
            pageSize: size,
          }, () => {
            updataPageIndexOrSize();
          });
        });
      },
      showTotal: (total, range) => {
        return (
          <div><FormattedMessage id="global.total"/>{total}</div>
        );
      },
      pageSizeOptions: ['10', '20', '50', '100', '200', '500', '1000'],
    };
    const rowSelection = {
      type: 'checkbox',
      selectedRowKeys: selected.map(item => item[tabInfoIdEle.id]),
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
    let quickQuerySelect = elementObj.filter((item) => {
      return item.quickQuery === 1;
    }).map((items) => {
      return (<Option key={items.id} value={items.id}>{items.displayName}</Option>);
    });
    let elementObj1 = relationTabInfo && elementMap[relationTabInfo.id] || [];
    let btnGroup = elementObj1.filter((item) => {
      return (BTN_ELEMENT_TYPE.includes(item.basetype) && item.visiabled);
    }) || [];
    let topBtn = btnGroup.length ? <ListBtn
      {...this.props}
      handleClickBtn={this.props.handleClickBtn}
    /> : null;
    return <div style={{ 'height': 'calc(100%)' }} ref="getContentWidth">
      <Row style={{ 'padding': '0 0 0 10px', 'maxHeight': '42px' }}>
        <Col span={17}>
          {btnArr.length ? this.renderBtnGroup() : null}
        </Col>
        <Col span={7}>
          {searchArr.length ?
            <div style={{ 'marginTop': '5px', 'paddingRight': '10px', 'height': '37px' }}>
              <InputGroup compact>
                <Select defaultValue="" style={{ 'width': '34%' }}
                        onChange={(value) => {
                          this.props.updataState({
                            searchSelected: value,
                          });
                        }}>
                  <Option key={''} value=""><FormattedMessage id="role.table.all"/></Option>
                  {quickQuerySelect}
                </Select>
                <CSearch
                  style={{ 'width': '66%' }}
                  onSearch={(value) => {
                    this.props.updataState({
                      searchVal: value,
                    }, () => {
                      this.doSearch();
                    });
                  }}
                  onChange={(e) => {
                    this.props.updataState({
                      searchVal: e.target.value,
                    });
                  }}
                />
              </InputGroup>
            </div> : null}
        </Col>
      </Row>
      <CTable
        className={btnArr.length || searchArr.length ? Styles.tableHeight1 : Styles.tableHeight2}
        pagination={pagination}
        columns={columns}
        dataSource={dataSource}
        rowSelection={rowSelection}
        onClickRow={this.onClickRow}
        loading={loading}
        onRow={this.clickRow}
        scroll={{ x: totalWidth >= 1000 ? totalWidth : 'max-content', y: 92 }}
        rowKey={record => tabInfoIdEle && record[tabInfoIdEle.id]}
      />
      <CreateModal
        visible={visible}
        title={relationTabInfo.name}
        onOk={() => this.handleSave()}
        size="large"
        onCancel={() => this.setState({ visible: false })}
      >
        <DetailList
          {...this.props}
          btnGroups={topBtn}
          tabInfo={relationTabInfo}
          formData={popupListDataResult}
          updataState={this.updataState}
          updataPageIndexOrSize={this.fetchPopupListData}
        />
      </CreateModal>
    </div>;
  }
}

export default PopupList;

