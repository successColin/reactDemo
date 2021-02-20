/*
 * @Author: jwk
 * @Date:   2020-10-26 10:16:22
 * @Desc: 高级筛选
 */
import { Component, Fragment } from 'react';
import { FormattedMessage } from 'react-intl';
import { Tooltip, Row, Col, Drawer } from 'antd';
import { CButton, CInput } from '@/components/common/BasicWidgets';
import CreateModal from '@/components/common/CreateModal/CreateModal';
import {
  getPageSelectOptions,
  getSeniorFilterConfig,
  getSeniorFilterParams,
  doInsertParams,
  doGetParamsList,
} from '@/services/frame';
import FilterForm from './FilterForm/FilterForm';
import { SELECT_ELEMETN_TYPE } from '@/constants/element';
import Styles from './FilterForm/FilterForm.less';

class SeniorFilter extends Component {
  static defaultProps = {
    entryEleObj: {}, // 高级筛选控件对象
  };
  state = {
    showModal: false, // 筛选内容显示状态
    filterEles: [], // 高级筛选的控件数据
    loading: false, // 加载条件控件
    formData: {}, // 查询参数
    paramsList: [], // 查询列表
    drawerVisible: false, // 筛选历史
  };
  // 获取条件控件列表级最新的数据值
  fetchFilterEles = () => {
    const { entryEleObj, elementList } = this.props;
    const { tabId } = entryEleObj;
    this.setState({ loading: true });
    getSeniorFilterConfig({ tabId }).then(filterEles => {
      let newElementList = [];
      filterEles.forEach(item => {
        let ele = elementList.find(items => items.id === item.elementId);
        if (ele) {
          newElementList.push({
            ...item,
            elementPramDto: { ...ele },
          });
        }
      });
      getSeniorFilterParams({ searchTab: tabId }).then(res => {
        this.setState({
          loading: false,
          filterEles: newElementList,
          formData: JSON.stringify(res) === '{}' ? {} : JSON.parse(res.searchContent),
        }, () => {
          this.fetchTabDropDownData();
        });
      });
    }, err => this.setState({ loading: false }));
  };
  /**
   * 获取面板下的下拉数据
   *  @param {string} type 下拉类型 （normal-普通下拉，cascade-级联下拉）
   */
  fetchTabDropDownData = () => {
    const { filterEles } = this.state;
    const { tabInfo = {}, filterMap } = this.props;
    // 下拉框控件列表
    const dropDownList = filterEles.filter(item => (SELECT_ELEMETN_TYPE.includes(item.elementPramDto && item.elementPramDto.basetype) && !!item.elementPramDto.mainTableName))
      .map(item => ({
        dataSource: item.elementPramDto.mainTableName,
        elementId: item.elementPramDto.id,
        columnName: item.mainColumnName,
      }));
    const globalMap = {};
    if (!dropDownList.length) return;
    getPageSelectOptions({ dropDownList, globalMap }).then(res => {
      this.setState({
        tabDropDownData: res,
      });
    });
  };
  // 打开筛选内容
  handleOpenModal = () => {
    const { filterEles } = this.state;
    // if (!filterEles.length) {
    this.fetchFilterEles();
    // }
    this.setState({ showModal: true });
  };
  // 点击保存
  handleSearch = () => {
    const { formData: values, filterEles } = this.state;
    const { setContainerState, fetchListData, restSearchParams } = this.props;
    let data = {};
    filterEles.forEach(item => {
      const { relationColumnName, elementPramDto } = item;
      const { dataFormat, basetype, relationColumnType, id } = elementPramDto;
      if (basetype === 9 && dataFormat) {
        let startTime = values[`${id}_start`] ? values[`${id}_start`].id : '';
        let endTime = values[`${id}_end`] ? values[`${id}_end`].id : '';
        if (!(!startTime && !endTime)) {
          data[relationColumnName] = {
            static_connector: 7,
            static_value: startTime + ',' + endTime,
            static_type: relationColumnType,
          };
        }
      } else if (basetype === 45) {
        if (values[`${id}`] && values[`${id}`].id) {
          data[relationColumnName] = {
            static_connector: 8,
            static_value: values[`${id}`].id,
            static_type: relationColumnType,
          };
        }
      } else if (basetype === 9 && !dataFormat) {
        if (values[`${id}`] && values[`${id}`].id) {
          data[relationColumnName] = {
            static_connector: (values[`cond_${id}`] && values[`cond_${id}`].id) || 3,
            static_value: values[`${id}`].id,
            static_type: relationColumnType,
          };
        }
      } else if (basetype === 3) {
        if (values[`${id}`] && values[`${id}`].id) {
          data[relationColumnName] = {
            static_connector: (values[`cond_${id}`] && values[`cond_${id}`].id) || 3,
            static_value: values[`${id}`].id,
            static_type: relationColumnType,
          };
        }
      } else {
        if (values[`${id}`] && values[`${id}`].id) {
          data[relationColumnName] = {
            static_connector: (values[`cond_${id}`] && values[`cond_${id}`].id) || 3,
            static_value: typeof (values[`${id}`].id) === 'string' ? values[`${id}`].id.trim() : values[`${id}`].id,
            static_type: relationColumnType,
          };
        }
      }
    });
    const { tabInfo = {} } = this.props;
    let listQueryParams = {
      pageSize: 10,
      pageNum: 1,
    };
    let params = {
      seniorFilter: data,
      listQueryParams: listQueryParams,
    };
    restSearchParams();
    setContainerState(params, () => {
      fetchListData({});
      this.doInsert(values);
      this.setState({ showModal: false });
    });
  };
  // 插入查询
  doInsert = (values) => {
    const { entryEleObj, elementList } = this.props;
    const { tabId } = entryEleObj;
    const params = {
      searchTab: tabId,
      searchContent: JSON.stringify(values),
    };
    doInsertParams(params);
  };
  // 设置查询条件
  doChoose = (item) => {
    const { searchContent } = item;
    let search = JSON.parse(searchContent);
    this.setState({ formData: search, drawerVisible: false });
  };
  // 获取进行查询的五次记录
  getParamsList = () => {
    const { entryEleObj, elementList } = this.props;
    const { tabId } = entryEleObj;
    doGetParamsList({ searchTab: tabId }).then((res) => {
      this.setState({
        paramsList: JSON.stringify(res) !== '{}' ? res : [],
        drawerVisible: true,
      });
    });
  };
  // 渲染查询条件
  renderDetial = (item) => {
    const { searchContent } = item;
    let search = JSON.parse(searchContent);
    return Object.keys(search).map((key, index) => {
      if (key.indexOf('_') === -1 && search[key].id) {
        return (
          <Row gutter={[5]} key={index}>
            <Col className={Styles.leftClass} key={`${index + 1}`} span={6}>
              <span>{search[key].displayName ? search[key].displayName + ':' : ''}</span>
            </Col>
            <Col className={Styles.rightClass} key={`${index + 2}`} span={18}><span
              title={search[key].name}>{search[key].name}</span></Col>
          </Row>
        );
      } else if (key.indexOf('_start') !== -1) {
        let eleId = key.split('_')[0];
        return (
          <Row gutter={[5]} key={index}>
            <Col className={Styles.leftClass} key={`${index + 1}`} span={6}>
              <span>{search[key].displayName ? search[key].displayName + ':' : ''}</span>
            </Col>
            <Col key={`${index + 2}`} span={18}>
              <span className={Styles.rightClass}>{search[key].name} </span>
              ~
              <span className={Styles.rightClass}> {(!!search[`${eleId}_end`]) && search[`${eleId}_end`].name}</span>
            </Col>
          </Row>
        );
      }
    });
  };
  // 渲染条件集合
  getPopoverContent = () => {
    const { paramsList = [] } = this.state;
    if (!paramsList.length) return;
    return paramsList.map((item, index) => {
      const dom = this.renderDetial(item);
      return (
        <div key={index} className={Styles.detialContent}>
          <Row className={Styles.detialContentTitle} gutter={[8, 24]}>
            <Col span={12}><span className={Styles.popoverTitle}><FormattedMessage
              id="element.type.seniorFilterRecord"/>{index + 1}</span></Col>
            <Col span={12} className={Styles.colTitle}>
              <span onClick={() => this.doChoose(item)} className="custom-color">
                <FormattedMessage id="element.type.Screeningagain"/>
              </span>
            </Col>
          </Row>
          <div className={Styles.detialContentWrap}>{dom}</div>
        </div>
      );
    });
  };

  updateState = (itemObj, callback) => {
    this.setState({
      ...itemObj,
    }, () => {
      callback && callback();
    });
  };

  // 重置
  rest = () => {
    this.setState({ formData: {} });
    const { form } = this.detailFormRef && this.detailFormRef.props;
    form && form.resetFields();
  };

  render() {
    const { entryEleObj, tabInfo = {} } = this.props;
    const { showModal, drawerVisible, ...rest } = this.state;
    const footer = (
      <Fragment>
        <CButton onClick={() => this.rest()}>
          <FormattedMessage id="global.reset"/>
        </CButton>
        <CButton onClick={() => this.setState({ showModal: false })}>
          <FormattedMessage id="global.cancel"/>
        </CButton>
        <CButton
          type="primary"
          onClick={() => this.handleSearch()}
        >
          <FormattedMessage id="global.ok"/>
        </CButton>
      </Fragment>
    );
    const popoverContent = this.getPopoverContent();
    const title = (
      <Fragment>
        <FormattedMessage id="element.type.seniorFilter"/>
        <Tooltip title={<FormattedMessage id="element.type.seniorFilterLast"/>}>
          <i onClick={() => this.getParamsList()}
             className={`iconfont icon-last-filter custom-color ${Styles.toolStyles}`}/>
        </Tooltip>
      </Fragment>
    );
    return (
      <Fragment>
        <CButton onClick={this.handleOpenModal}>
          <i className="iconfont icon-high_filter custom-color"/>
          {entryEleObj.displayName}
        </CButton>
        <CreateModal
          title={title}
          visible={showModal}
          footer={footer}
          onCancel={() => this.setState({ showModal: false })}
          id="createInFilter"
        >
          <div className={Styles.contentWrap}>
            {drawerVisible && <Drawer
              visible={drawerVisible}
              getContainer={document.getElementById('createInFilter')} // 挂载的html节点
              onClose={() => this.setState({ drawerVisible: false })}
              className={Styles.drawerWrap}
              closable={false}
              placement="top"
              title={<FormattedMessage id="element.type.seniorFilterLastArr"/>}
            >
              {popoverContent}
            </Drawer>}
            <FilterForm
              {...rest}
              tabInfo={tabInfo}
              wrappedComponentRef={form => this.detailFormRef = form}
              updateState={this.updateState}
            />
          </div>
        </CreateModal>
      </Fragment>
    );
  }
}

export default SeniorFilter;
