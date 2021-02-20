/*
 * @Author: Fus
 * @Date:   2019-07-01 08:52:39
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2019-12-12 15:45:01
 * @Desc: 【业务框架】中使用的【标准数据选择框】，由一个InputSearch和Modal组成
 */

import { Component, Fragment } from 'react';
import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';
import { Resizable, ResizableBox } from 'react-resizable';
import { CSearch, CButton } from '@/components/common/BasicWidgets';
import CreateModal from '@/components/common/CreateModal/CreateModal';
import ContentContainer from '../ContentContainer';
import { Tag } from 'antd';
import { BaseContext } from '@/constants/global';
import { getCheckBoxSearchDetail, getNormalSearchDetail } from '@/services/frame';
import styles from './NormalSearchSelect.less';
import checkStyles from '@/components/common/BasicWidgets/Widgets/CheckBoxSearchSelect/CheckBoxSearchSelect.less';
import ModalContent from '@/components/common/BasicWidgets/Widgets/CheckBoxSearchSelect/ModalContent/ModalContent';
import { stringToArrayObject } from '@/utils/common';


class NormalSearchSelect extends Component {
  static contextType = BaseContext;
  static defaultProps = {
    eleObj: {}, // 控件对象信息
    filterMap: {}, // 过滤器信息
    getGlobalVarValues: null, // 全局变量转值函数
    rowKey: 'id',
    disabled: false,
    handleClickValue: null, // 点击值时触发（默认用于点击打开弹出面板）
    selectConfig: { // 选择数据配置
      isMulti: false, // 是否多选
      keyName: 'tableName', // 选择的key字段名
    },
  };

  static getDerivedStateFromProps(props, state) {
    if (props.value !== state.inputVal && !(!props.value && !state.inputVal)) {
      // 设置已选的数据
      const { form, eleObj, value, valueObj, multiple } = props;
      const id = form.getFieldValue(eleObj.relationColumnName);
      let selectedRows = [];
      if (multiple && (!!valueObj.id || !!valueObj.name)) {
        selectedRows = stringToArrayObject(valueObj.id, valueObj.name);
      }
      if (!multiple) {
        selectedRows = [{ id, name: value }];
      }
      return {
        inputVal: props.value || '',
        selectedRows,
      };
    }
    return null;
  }

  state = {
    inputVal: '',
    showType: '', // 显示类型 list-列表 tree-树
    treeNodeType: 2, // 节点显示格式
    visible: false, // modal是否显示
    selectedRows: [], // 已选择的数据
    headerKeywords: null, // 头部搜索内容
    loadingSave: false, // 保存按钮loading
  };
  // 点击确定
  handleOk = () => {
    const { selectedRows } = this.state;
    const { eleObj, elementMap, multiple = false } = this.props;
    const { selectListTabId } = eleObj;
    const selectedList = elementMap[selectListTabId];
    const idEle = selectedList.find(item => item.relationColumnName === 'id');
    // 没有选择数据
    if (!this.detailFormRef.state.selected.length) {
      this.props.setSelected(selectedRows);
      this.handleCancel();
      return;
    }
    // 有选择数据的需要先走接口获取详情
    const id = this.detailFormRef.state.selected[0][idEle.id];
    if (!id) {
      this.handleCancel();
      return;
    }
    this.setState({ loadingSave: true });
    if (!multiple) {
      getNormalSearchDetail({
        tabSource: eleObj.mainTableName,
        id: JSON.parse(id).id,
      }).then(res => {
        this.setState({ loadingSave: false });
        this.props.setSelected([res]);
        this.handleCancel();
      }, err => this.setState({ loadingSave: false }));
    }
    if (multiple) {
      getCheckBoxSearchDetail({
        tableName: eleObj.mainTableName,
        ids: this.detailFormRef.state.selected.map(item => JSON.parse(item[idEle.id]).id).join(','),
      }).then(res => {
        this.setState({ loadingSave: false });
        this.handleCancel(() => {
          this.props.setSelected(res);
        });
      }, err => this.setState({ loadingSave: false }));
    }
  };
  // 删除标签
  deleteTag = (index) => {
    const { selectedRows = [] } = this.state;
    let newSelectedRows = [...selectedRows];
    newSelectedRows.splice(index, 1); // 将删掉的标签从数组中去除
    let idsArr = [], namesArr = [];
    newSelectedRows.forEach(item => {
      idsArr.push(item.id);
      namesArr.push(item.name);
    });// 重新组装数据更新到页面
    let data = newSelectedRows.length ? {
      id: idsArr.join(','),
      name: namesArr.join(','),
    } : {};
    this.props.deleteTag(data);
  };
  // 点击取消
  handleCancel = (callback) => {
    const { toggleEdit, eleObj } = this.props;
    const { selectShowType } = eleObj;
    this.setState({
      visible: false,
      showType: 'list',
      // selectedRows: [],
      headerKeywords: null,
    }, () => {
      toggleEdit && toggleEdit();
      callback && callback();
    });
  };
  // 点击搜索框，弹框出现前
  handleClickSearch = () => {
    const { isReadOnly, disabled, eleObj, tabList } = this.props;
    const { selectListTabId } = eleObj;
    if (!selectListTabId) return;
    this.setState({
      tabInfo: tabList.find(item => item.id === selectListTabId),
      visible: !isReadOnly && !disabled ? true : false,
    });
  };
  handleInputChange = (e) => {
    const inputVal = e.target.value;
    if (!('value' in this.props)) {
      this.setState({ inputVal });
    }
    this.triggerChange({ inputVal });
  };
  triggerChange = changedValue => {
    const { onChange } = this.props;
    if (onChange) {
      onChange(Object.assign({}, this.state, changedValue));
    }
  };
  // 搜索
  handleSearch = (headerKeywords) => {
    // 避免相同的关键字点击多次不会走接口
    // this.setState({ headerKeywords: '' }, () => {
    this.setState({ headerKeywords });
    // });
  };
  setWrapState = (itemObj, callback) => {
    this.setState(itemObj, () => callback && callback());
  };
  // 渲染标签
  renderTagList = () => {
    const { selectedRows = [] } = this.state;
    const { eleObj } = this.props;
    const { readonly } = eleObj;
    return selectedRows.map((item, index) => <Tag key={item.id + index} closable={!readonly}
                                                  onClose={() => this.deleteTag(index)}>{item.name}</Tag>);
  };

  render() {
    const { multiple = false, eleObj, isReadOnly, rowKey, disabled, handleClickValue, filterMap, getGlobalVarValues } = this.props;
    const { visible, selectedRows = [], showType, inputVal, loadingSave, headerKeywords, treeNodeType, tabInfo } = this.state;
    const { displayName, relationTabId } = eleObj;
    const modalSearchCls = classNames({
      [styles.modalSearch]: true,
      // [styles.showInput]: !!headerKeywords,
      [styles.showInput]: true,
    });
    // 底部栏按钮
    const footer = (
      <Fragment>
        <CButton onClick={() => this.handleCancel()}>
          <FormattedMessage id="global.cancel"/>
        </CButton>
        <CButton
          type="primary"
          onClick={this.handleOk}
          loading={loadingSave}
        >
          <FormattedMessage id="global.ok"/>
        </CButton>
      </Fragment>
    );
    const modalProps = {
      visible,
      onCancel: () => this.handleCancel(),
      title: (tabInfo && tabInfo.name) || '',
      footer,
      className: styles.modal,
      size: 'large',
    };
    const searchCls = classNames({
      [styles.search]: true,
      [styles.hasRelationTab]: !!relationTabId,
      [styles.readOnly]: !!isReadOnly,
      [styles.disabled]: disabled,
    });
    return (
      <div>
        {!multiple ? <div className={styles.searchWrap}>
          <CSearch
            value={inputVal}
            onSearch={this.handleClickSearch}
            onChange={this.handleInputChange}
            className={searchCls}
            allowClear={false}
            disabled
          />
          {relationTabId && inputVal && <div className={styles.mask} onClick={handleClickValue}/>}
        </div> : null}
        {multiple ? <ResizableBox
          className={checkStyles['custom-resizable-box']}
          axis="y"
          height={64}
          minHeight={64}
          resizeHandles={['se']}
        >
          <div className={checkStyles.searchWrap}>
            <CButton onClick={this.handleClickSearch} className={checkStyles.cbutton} type="default" size="small">
              <span className={`${checkStyles.addIcon} ${checkStyles.addCommon}`}>+</span>
              <span className={checkStyles.addCommon}><FormattedMessage id="global.add.more"/></span>
            </CButton>
            {this.renderTagList()}
            {relationTabId && inputVal && <div className={checkStyles.mask} onClick={handleClickValue}/>}
          </div>
        </ResizableBox> : null}
        <CreateModal {...modalProps}>
          <ContentContainer
            {...this.props}
            fromType='relation'
            checkboxType={multiple ? 'checkbox' : 'radio'}
            tabInfo={tabInfo}
            prevTabInfo={this.props.tabInfo}
            prevListRowData={this.props.tabData}
            wrappedComponentRef={list => this.detailFormRef = list}
          />
        </CreateModal>
      </div>
    );
  }
}

export default NormalSearchSelect;
