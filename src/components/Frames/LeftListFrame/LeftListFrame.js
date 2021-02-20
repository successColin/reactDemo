import { Component } from 'react';
import { connect } from 'dva';
import { BaseContext } from '@/constants/global';
import { CMessage } from '@/components/common/BasicWidgets';
import ResizableContainer from '@/components/common/ResizableContainer/ResizableContainer';
import LeftList from './LeftList/LeftList';
import ContentContainer from './ContentContainer/ContentContainer';
import {
  getPageSelectOptions,
} from '@/services/frame';
import { getPcPageConfig, getList, getFormDetial, delList } from '@/services/leftListFrame';
import {
  getValueFromGlobalVariables,
  jsonParse,
  matchGlobalVars,
  validTriggerMatch,
} from '@/utils/common';
import { BTN_ELEMENT_TYPE, NO_SUBMIT_ELEMENT_TYPE } from '@/constants/element';
import { getParamList } from '@/services/framePage';
import styles from './LeftListFrame.less';

@connect(state => ({
  functionData: state.tabs.activeTabData.functionData,
  userInfo: state.user.userInfo,
  tabs: state.tabs,
  user: state.user,
}))
class TreeFrame extends Component {
  static contextType = BaseContext;
  state = {
    isClick: false, // 是否是点击获取详情
    advancedQueryMap: {}, // 过滤条件
    isNew: false, // 是否是新增
    listTab: [], // 列表面板数据
    showCreate: false, // 是否显示创建按钮
    element: [], // 元素列表
    leftList: [], // 左侧列表数据
    leftStatusList: [], // 左侧列表状态值列表
    pageNum: 0,
    total: 0, // 列表总条数
    fileRelationList: {}, // 上传文件
    filesData: {},
    pageIndex: 1, // 右侧列表
    pageLength: 10, // 右侧列表
    elementMap: {}, // 面板内元素map（内容以：{tabId: [元素列表]}形式）
    activeTreeNode: {}, // 选中节点对象
    isShow: true, // 基本信息默认显示
    treeData: [], // 树数据
    actionType: '', // 树右键操作类型
    originNode: {}, // antd TreeNode对象
    frameData: {}, // 框架数据
    triggerMap: {}, // 触发器数据
    isMultiTable: false, // 是否为多表组成的
    originElementMap: {}, // 初始接口返回的元素map（用于触发器回置）
    tabInfo: {}, // 当前面板信息
    tabList: [], // 面板列表（全部的面板）
    matchTabList: [], // 当前节点的面板列表（区分组和非组的面板）
    tabDropDownList: {}, // 当前面板下的下拉数据(内容以{表名: [下拉数据]})形式）
    tabData: { // 面板内数据 (tabId对应数据的map)
    },
    originTabData: { // 面板内初始数据 (tabId对应数据的map)
    },
    filterMap: {}, // 下拉列表过滤器
    loadingStatus: { // 各loading状态
      tree: false, // 树
      page: false, // 界面配置
      data: false, // 界面数据
    },
    keyword: '', // 查找的内容
    fileInputData: [], // 菜单输入参数
    filePassList: {}  //图片参数的值
  };

  componentDidMount() {
    const { functionData, userInfo } = this.props;
    getParamList({ functionId: functionData.id }).then(res => {
      this.setState({
        fileInputData: res,
      }, () => {
        this.fetchPage();
      });
    });
  }

  // 获取面板配置
  fetchPage = () => {
    console.log('获取配置');
    const { langLib } = this.context;
    this.setLoadingStatus('page', true);
    const { functionData } = this.props;
    getPcPageConfig({ functionId: functionData.id }).then(res => {
      const { tabList, framePramDto, triggerMap, elementMap, advancedQueryMap, filterMap } = res;
      if (!framePramDto || !tabList.length || JSON.stringify(elementMap) === '{}') {
        CMessage(langLib['message.error.noPageConfig'], 'error');
        this.setLoadingStatus('page', false);
        return;
      }
      let id;
      let listTab;
      if (tabList.length) {
        listTab = tabList.filter((item) => {
          return item.showType === 3;
        });
        const matchTabList = tabList.filter(item => item.basetype === 1 && item.showType !== 3) || [];
        const tabInfo = matchTabList.find(item => item.mainTab === 1) || matchTabList[0] || {};
        this.setState({
          listTab,
          matchTabList,
          tabInfo,
          tabList,
        });
        id = listTab[0].id;
      }
      let isBaseType = elementMap && elementMap[id].filter((item) => {
        return item.basetype === 4;
      }) || [];
      let isOne = tabList.length && tabList.filter((item) => {
        return item.id === id;
      })[0].sno === 1;

      this.setState({
        showCreate: isBaseType.length > 0 && isOne,
        element: isBaseType,
        elementMap,
        triggerMap,
        advancedQueryMap,
        filterMap,
        originElementMap: JSON.parse(JSON.stringify(elementMap)),
      });

      this.getLeftList();
      // this.fetchTabDropDownList();
      this.setLoadingStatus('page', false);
    }, err => this.setLoadingStatus('page', false));
  };
  /**
   * 获取列表
   */
  getLeftList = () => {
    let { pageNum } = this.state;
    this.setState({
      pageNum: ++pageNum,
    }, () => {
      this.renderLeftList();
    });
  };
  renderLeftList = () => {
    let { listTab, elementMap, keyword, advancedQueryMap, tabInfo, activeTreeNode, total } = this.state;
    const { userInfo, tabs } = this.props;
    let id = listTab[0].id;
    let elementList = elementMap && elementMap[id].filter((item) => {
      return item.basetype !== 4;
    }).map(item => {
      let obj;
      if (item.basetype === 9) {
        obj = {
          name: item.relationColumnName,
          baseType: item.basetype,
          relationColumnType: item.relationColumnType,
          elementFormat: item.elementFormat,
          mainColumnName: item.mainColumnName,
          mainTableName: item.mainTableName,
          elementId: item.id,
          elementMultiRelation: item.elementMultiRelation,
        };
      } else {
        obj = {
          elementId: item.id,
          relationColumnName: item.relationColumnName,
          relationTableName: item.relationTableName,
          relationColumnType: item.relationColumnType,
          elementMultiRelation: item.elementMultiRelation,
          name: item.relationColumnName,
          baseType: item.basetype,
          mainColumnName: item.mainColumnName,
          mainTableName: item.mainTableName,
        };
      }
      return obj;
    });
    let quickQuerySelect = elementMap && elementMap[id].filter((item) => {
      return item.quickQuery === 1;
    });
    const globalMap = {}; // 面板组合条件
    const globalQueryMap = {}; // 面板过滤条件ASQL
    const queryList = advancedQueryMap[id] || [];
    queryList.forEach(item => {
      const { asqlValueType, asqlValue, queryType, apiSql } = item;
      if (queryType === 1) {
        // 值类型为【变量】时，需要将变量对应的值传给后台
        if (asqlValueType === 2) {
          // @@BusinessID 取左侧树的主业务数据（因为左侧树无法配置）
          if (asqlValue === '@@BusinessID') {
            // globalMap[item.asqlValue] = JSON.parse(activeTreeNode[idEle.id]).name;
          } else {
            // 当前时间、当前用户
            const globalVar = getValueFromGlobalVariables({
              globalVar: asqlValue,
              userInfo,
            });
            // 或用户自定义的变量
            // (在关联新增按钮的弹出面板上，只有上一个面板为表单时，才可以获取自定义的变量)
            // （若上一个面板为列表，则无法定位到定义的变量具体哪条数据值）
            // const customVar = fromType === 'inPopup' ? getValueFromCustomVariables({
            //   type: 'filterCond',
            //   prevListRowData,
            //   elementList: elementMap[prevTabInfo.id],
            //   filterCondValue: asqlValue,
            // }) : '';
            // console.log(customVar, 'aaa customVar');
            globalMap[item.asqlValue] = globalVar;
          }
        }
      } else if (queryType === 2) {
        if (!apiSql) return;
        const varNameList = matchGlobalVars(apiSql);
        varNameList.forEach(varName => {
            if (varName === '@@BusinessID') {
              // globalQueryMap[varName] = JSON.parse(activeTreeNode[idEle.id]).name;
            } else {
              // 当前时间、当前用户
              let globalVar = getValueFromGlobalVariables({
                globalVar: varName,
                userInfo,
                globalMapType: 'globalMapType',
              });
              // 或用户自定义的变量
              // (在关联新增按钮的弹出面板上，只有上一个面板为表单时，才可以获取自定义的变量)
              // （若上一个面板为列表，则无法定位到定义的变量具体哪条数据值）
              // const customVar = fromType === 'inPopup' ? getValueFromCustomVariables({
              //   type: 'filterCond',
              //   prevListRowData,
              //   elementList: elementMap[prevTabInfo.id],
              //   filterCondValue: asqlValue,
              // }) : '';
              // console.log(customVar, 'aaa customVar');
              if (globalVar) {
                globalQueryMap[varName] = globalVar;
              }
            }
          },
        );
      }
    });
    let params = {};
    const fileData = tabs.activeTabData.fileData || '';
    let filterSqlBaseType = fileData && queryList.filter(item => item.basetype === 3 && fileData.jumpTag === item.jumpFunctionId) || [];
    const { fileInputData } = this.state;
    let jumpTag = {
      jumpTag: fileData ? fileData.jumpTag : null,
    };
    if (filterSqlBaseType.length && filterSqlBaseType[0].filterSql) {
      const filterSql = filterSqlBaseType[0].filterSql;
      const varNameList = matchGlobalVars(filterSql);
      console.log(varNameList,'varNameList',filterSqlBaseType)
      varNameList.forEach(varName => {
        if (varName === '@@BusinessID') {

        } else {
          // 当前时间、当前用户
          let globalVar = getValueFromGlobalVariables({
            globalVar: varName,
            userInfo,
            globalMapType: 'globalMapType',
          });
          if (globalVar.value) {
            globalQueryMap[varName] = globalVar;
          } else {
            let obj = fileInputData.find(item => item.name === varName);
            if (obj && fileData[varName]) {
              let normalData = jsonParse(fileData[varName], 'object');
              console.log(normalData)
              globalQueryMap[varName] = normalData;
            }
          }
        }
      });
    }

    if (keyword) {
      let calendarList = quickQuerySelect.map(item => {
        return {
          field: item.mainColumnName || item.relationColumnName,
          value: keyword,
          tableName: item.mainTableName || item.relationTableName,
          elementId: item.id,
        };
      });
      params = {
        tabId: id,
        elementList,
        tabSource: listTab[0].relationTableName,
        pageSize: 10 * this.state.pageNum,
        pageNum: 1,
        calendarList,
        globalQueryMap,
        globalMap,
        ...jumpTag,
      };
    } else {
      params = {
        tabId: id,
        elementList,
        tabSource: listTab[0].relationTableName,
        pageSize: 10 * this.state.pageNum,
        pageNum: 1,
        globalQueryMap,
        globalMap,
        ...jumpTag,
      };
    }
    this.setLoadingStatus('tree', true);
    // form.resetFields();
    getList(params).then(res => {
      res.datalist = res.datalist.length ? res.datalist : [];
      // let newActiveTreeNode = JSON.parse(JSON.stringify(activeTreeNode));
      this.setState({
        leftList: res.datalist,
        total: res.total,
        isShow: res.datalist.length ? true : false,
        // activeTreeNode: {},
      }, () => {
        if (res.datalist.length) {
          if (JSON.stringify(activeTreeNode) === '{}' || total > res.total || total < res.total) {
            this.updateSelectList(res.datalist[0]);
          } else {
            this.updateSelectList(activeTreeNode);
          }
        }
      });
      // if (this.state.pageNum === 1 && res.datalist.length) {
      //   this.updateSelectList(res.datalist[0]);
      // }
      this.setLoadingStatus('tree', false);
    }, err => {
      this.setLoadingStatus('tree', false);
    });
  };


  /**
   * 选中左侧列表获取详情
   * @param obj
   */
  updateSelectList = (obj) => {
    const { form } = this.props;
    const { tabList } = this.state;
    // form && form.resetFields();
    this.setState({
      activeTreeNode: obj,
      isNew: false,
      isClick: true,
      tabData: {},
      fileRelationList: {},
      filePassList: {},
      tabInfo: tabList.find(item => item.mainTab && item.showType !== 3),
    }, () => {
      this.contentContainerRef && this.contentContainerRef.getData();
      this.contentContainerRef && this.contentContainerRef.resetFieldForm();
      this.contentContainerRef && this.contentContainerRef.updataState({ selectedListArr: [] });
    });
  };
  // 数据处理
  reduceData = (objRes = {}, tabInfo = {}) => {
    const { elementMap, triggerMap, form } = this.state;
    let { formData } = this.state;
    const elementList = elementMap[tabInfo.id] || [];
    let data = {};
    for (let key in objRes) {
      if (Number(key).toString() !== 'NaN') {
        let obj = elementList.find((value) => {
          return value.id === Number(key);
        });
        let newKey = 'a' + key;
        data[newKey] = objRes[key];
      } else {
        let control = elementList.find((item) => item.relationColumnName === key);
        if (control) {
          let newKey = 'a' + control.id;
          data[newKey] = objRes[key];
        }
      }
    }
    return data;
  };
  // 更新分页
  updataPageIndexOrSize = (pageIndex, pageSize) => {
    this.setState({
      pageIndex,
      pageLength: pageSize,
    }, () => {
      this.getRelationList();
    });
  };
  // 获取关联列表
  getRelationList = () => {
    const { tabInfo = {}, elementMap = {}, activeTreeNode, tabData, tabList = [], matchTabList, pageIndex, pageLength } = this.state;
    const tabId = tabInfo.id;
    const elementList = elementMap[tabId] && elementMap[tabId].filter(item => !BTN_ELEMENT_TYPE.includes(item.basetype)).map(item => {
      if (item.basetype === 9) {
        return {
          name: item.relationColumnName,
          baseType: item.basetype,
          relationColumnType: item.relationColumnType,
          elementFormat: item.elementFormat,
          mainColumnName: item.mainColumnName,
          mainTableName: item.mainTableName,
          elementId: item.id,
          elementMultiRelation: item.elementMultiRelation,
        };
      } else {
        return {
          relationColumnName: item.relationColumnName,
          relationTableName: item.relationTableName,
          name: item.relationColumnName,
          relationColumnType: item.relationColumnType,
          baseType: item.basetype,
          mainColumnName: item.mainColumnName,
          mainTableName: item.mainTableName,
          elementId: item.id,
          elementMultiRelation: item.elementMultiRelation,
        };
      }
    });
    if (!elementList || !elementList.length) return;
    const params = {
      tabSource: tabInfo.relationTableName,
      elementList,
      pageNum: pageIndex,
      pageSize: pageLength,
      tabId: tabId,
      calendarList: [{ field: tabInfo.relationColumn, value: JSON.parse(activeTreeNode.id).name }],
    };
    getList(JSON.stringify(params)).then(res => {
      this.setState({
        tabData: {
          ...tabData,
          [tabId]: res,
        },
      });
      this.setLoadingStatus('data', false);
    }, err => this.setLoadingStatus('data', false));
  };
  // 获取面板下的下拉数据
  fetchTabDropDownList = () => {
    const { tabInfo = {}, elementMap } = this.state;
    const elementList = elementMap[tabInfo.id] || [];
    // 下拉框控件列表
    const dropDownList = elementList.filter(item => item.basetype === 2 && !!item.mainTableName).map(item => ({ dataSource: item.mainTableName }));
    if (dropDownList.length === 0) return;
    getPageSelectOptions({ dropDownList }).then(tabDropDownList => {
      this.setState({
        tabDropDownList,
      });
    });
  };
  // 再进进入面板时，验证触发器是否匹配
  checkTriggerResult = () => {
    const { tabInfo, tabData, elementMap, triggerMap } = this.state;
    const activeTabData = tabData[tabInfo.id];
    const elementList = elementMap[tabInfo.id];
    const newElementList = [...elementList];
    elementList.forEach(item => {
      const { relationColumnName } = item;
      // 该元素有配置触发器
      const targetEleList = triggerMap[item.id] || [];
      if (targetEleList.length) {
        targetEleList.forEach(tarItem => {
          const { beginTriggerNum, endTriggerNum, relationElementId, relationElementRequisite, relationElementReadonly, relationElementVisible, relationElementValue } = tarItem;
          const matchEleIndex = newElementList.findIndex(item => item.id === relationElementId);
          const validMatch = validTriggerMatch(beginTriggerNum, endTriggerNum, `${activeTabData[relationColumnName]}`);
          // 控件的值与触发条件匹配，且有目标控件数据，则修改目标控件属性
          if (matchEleIndex !== -1 && validMatch) {
            newElementList.splice(matchEleIndex, 1, {
              ...newElementList[matchEleIndex],
              requisite: relationElementRequisite,
              readonly: relationElementReadonly,
              visiabled: relationElementVisible,
            });
          }
        });
      }
    });
    this.setState({
      elementMap: {
        ...elementMap,
        [tabInfo.id]: newElementList,
      },
    });
  };
  // 删除
  handleDel = (btn) => {
    const { langLib } = this.context;
    const { id } = JSON.parse(this.state.activeTreeNode.id);
    const { relationTableName } = btn;
    let params = {
      tableName: relationTableName,
      id,
    };
    delList(params).then(res => {
      CMessage(langLib['message.del.success']);
      this.setBtnLoading(btn, false);
      // this.setState({ tabData: {} }, () => form && form.resetFields());
      this.setState({
        leftList: [],
        pageNum: 1,
      }, () => {
        this.renderLeftList();
      });
    }, err => this.setBtnLoading(btn, false));
  };
  // 更新配置的按钮loading状态
  setBtnLoading = (btn, loading) => {
    const { tabInfo, elementMap } = this.state;
    const tabId = tabInfo.id;
    const elementList = elementMap[tabInfo.id] || [];
    const newElementList = [...elementList];
    const btnIndex = newElementList.findIndex(item => item.id === btn.id);
    newElementList.splice(btnIndex, 1, {
      ...btn,
      static_loading: loading,
    });
    this.setState({
      elementMap: {
        ...elementMap,
        [tabId]: newElementList,
      },
    });
  };

  // 更新主区块loading状态
  setLoadingStatus = (type, loading) => {
    const { loadingStatus } = this.state;
    this.setState({
      loadingStatus: {
        ...loadingStatus,
        [type]: loading,
      },
    });
  };
  // 更新该组件内状态
  setFrameState = (itemObj, callback) => {
    this.setState(itemObj, () => callback && callback());
  };
  add = () => {
    const { langLib } = this.context;
    const { tabInfo, matchTabList, elementMap, originElementMap } = this.state;
    let newTabInfo = tabInfo;
    newTabInfo = matchTabList.find(item => item.mainTab === 1) || {};
    const elementList = elementMap[newTabInfo.id] || [];
    let data = {};
    this.setState({
        tabInfo: newTabInfo,
        isNew: true,
        isClick: false,
        isShow: true,
        fileRelationList: {},
        filePassList: {},
        filesData: {},
        tabData: {
          [newTabInfo.id]: data,
        },
        originTabData: {
          [newTabInfo.id]: data,
        },
        activeTreeNode: {},
        elementMap: originElementMap,
      }, () => this.contentContainerRef.rest(),
    )
    ;
  };

  render() {
    const {
      loadingStatus, treeData, activeTreeNode, matchTabList = [], tabData = {}, tabInfo = {}, actionType, frameData, tabDropDownList, triggerMap, elementMap, originElementMap, showCreate, element, leftList,
      leftStatusList,
      listTab,
      pageNum,
      total,
      isNew,
      isClick,
      isShow,
      fileRelationList,
      filePassList,
      filesData,
      tabList,
      advancedQueryMap,
      filterMap,
      originTabData,
      pageLength,
    } = this.state;
    const { userInfo, tabs, functionData, user } = this.props;
    // 左侧树容器属性
    const leftTreeProps = {
      add: this.add,
      loading: loadingStatus.tree,
      showCreate,
      element,
      elementMap,
      listTab,
      leftStatusList,
      leftList,
      pageNum,
      pageSize: pageLength,
      total,
      frameData,
      activeTreeNode,
      updateSelectList: this.updateSelectList,
      setFrameState: this.setFrameState,
      // setActiveTreeNode: this.setActiveTreeNode,
      getLeftList: this.getLeftList,
    };
    // 内容容器属性
    const contentProps = {
      filterMap,
      tabList,
      isNew,
      isClick,
      leftStatusList,
      tabData,
      tabInfo,
      elementMap: elementMap,
      originElementMap: originElementMap,
      matchTabList,
      activeTreeNode,
      advancedQueryMap,
      // activeTabPage,
      actionType,
      // form,
      triggerMap,
      tabDropDownList,
      fileRelationList,
      filePassList,
      filesData,
      functionData,
      loading: loadingStatus.page || loadingStatus.data,
      setFrameState: this.setFrameState,
      fetchTabDropDownList: this.fetchTabDropDownList,
      updataPageIndexOrSize: this.updataPageIndexOrSize,
      reduceData: this.reduceData,
      renderLeftList: this.renderLeftList,
      setBtnLoading: this.setBtnLoading,
      fetchPage: this.fetchPage,
      userInfo,
      tabs,
      user,
      originTabData,
      ref: ref => this.contentContainerRef = ref,
    };
    return (
      <div className={styles.wrap}>
        <div className={styles.treeWrap}>
          <ResizableContainer>
            <LeftList {...leftTreeProps} />
          </ResizableContainer>
        </div>
        <div className={styles.contentWrap}>
          {/* {isShow ? (<Form> */}
          {/*  <ContentContainer {...contentProps} /> */}
          {/* </Form>) : null} */}
          {isShow ? (
            <ContentContainer  {...contentProps} />
          ) : null}
        </div>
      </div>
    );
  }
}

// export default Form.create()(TreeFrame);
export default TreeFrame;

