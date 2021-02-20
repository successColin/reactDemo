/*
 * @Author: Fus
 * @Date:   2019-07-01 08:52:39
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2020-01-06 10:14:01
 * @Desc: 【业务框架】中使用的【标准数据选择框】，由一个InputSearch和Modal组成
 */

import { Component, Fragment } from 'react';
import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';
import { CSearch, CButton } from '@/components/common/BasicWidgets';
import CreateModal from '@/components/common/CreateModal/CreateModal';
import ModalContent from './ModalContent/ModalContent';
import { BaseContext } from '@/constants/global';
import { getNormalSearchDetail } from '@/services/frame';
import styles from './NormalSearchSelect.less';


class NormalSearchSelect extends Component {
  static contextType = BaseContext;
  static defaultProps = {
    eleObj: {}, // 控件对象信息
    filterMap: {}, // 过滤器信息
    getGlobalVarValues: null, // 全局变量转值函数
    rowKey: 'id',
    disabled: false,
    handleClickValue: null, // 点击值时触发（默认用于点击打开弹出面板）
    onOpen: null, // 点击搜索打开modal
    valueObj: {}, // 表单该字段值对象{id: '', name: ''}
    selectConfig: { // 选择数据配置
      isMulti: false, // 是否多选
      keyName: 'tableName', // 选择的key字段名
    },
  };

  static getDerivedStateFromProps(props, state) {
    if (props.value !== state.inputVal && !(!props.value && !state.inputVal)) {
      // 设置已选的数据
      const { form, eleObj, value, valueObj } = props;
      const id = form.getFieldValue(eleObj.relationColumnName) || valueObj.id;
      const selectedRows = [{ id, name: value }];
      return {
        inputVal: props.value || '',
        selectedRows,
      };
    }
    // 未设置过树、列表的需要根据控件信息判断
    if (!state.showType) {
      const { selectShowType } = props.eleObj;
      if (selectShowType === 2 || selectShowType === 3 || selectShowType === null) {
        return {
          showType: 'list',
        };
      } else if (selectShowType === 1 || selectShowType === 3 || selectShowType === null) {
        return {
          showType: 'tree',
        };
      }
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
    const { eleObj } = this.props;
    // 没有选择数据
    if (!selectedRows.length) {
      this.props.setSelected(selectedRows);
      this.handleCancel();
      return;
    }
    // 有选择数据的需要先走接口获取详情
    const { id } = selectedRows[0];
    if (!id) {
      this.handleCancel();
      return;
    }
    this.setState({ loadingSave: true });
    getNormalSearchDetail({
      tabSource: eleObj.mainTableName,
      id,
    }).then(res => {
      this.handleCancel();
      this.setState({ loadingSave: false });
      this.props.setSelected([res]);
    }, err => this.setState({ loadingSave: false }));
  };
  // 点击取消
  handleCancel = () => {
    const { toggleEdit } = this.props;
    const { selectShowType } = this.props.eleObj;
    this.setState({
      visible: false,
      showType: selectShowType === 2 || selectShowType === 3 || selectShowType === null ? 'list' : 'tree',
      selectedRows: [],
      inputVal: '',
      headerKeywords: null,
    }, () => {
      toggleEdit && toggleEdit(); // 如果有改方法，就执行
    });
  };
  // 点击清除
  handleClear = () => {
    const { toggleEdit } = this.props;
    this.setState({ selectedRows: [] }, () => {
      this.handleOk();
    });
  };
  // 点击搜索框，弹框出现前
  handleClickSearch = () => {
    const { isReadOnly, disabled, onOpen } = this.props;
    if (!isReadOnly && !disabled) {
      if (onOpen) {
        onOpen();
        return;
      }
      this.setState({ visible: true });
    }
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

  render() {
    const { eleObj, isReadOnly, rowKey, disabled, handleClickValue, filterMap, getGlobalVarValues, valueObj = {}, toggleEdit } = this.props;
    const { visible, selectedRows = [], showType, inputVal, loadingSave, headerKeywords, treeNodeType } = this.state;
    const { displayName, relationTabId, jumpType, jumpMenuList = [] } = eleObj;
    const modalSearchCls = classNames({
      [styles.modalSearch]: true,
      // [styles.showInput]: !!headerKeywords,
      [styles.showInput]: true,
    });
    // 标题
    const title = (
      <Fragment>
        <FormattedMessage id="normalSearchSelect.title" values={{ name: displayName }}/>
        {selectedRows.length ? <span className={styles.subName}>
          （<FormattedMessage id="global.active.name" values={{ name: selectedRows[0].name }}/>）
        </span> : null}
        <CSearch
          allowClear={false}
          className={modalSearchCls}
          onSearch={this.handleSearch}
          onChange={e => !e.target.value && this.setState({ headerKeywords: null })}
        />
        {/* <span className={`${styles.split} split-line`}>|</span> */}
      </Fragment>
    );
    // 底部栏按钮
    const footer = (
      <Fragment>
        <CButton onClick={this.handleClear}>
          <FormattedMessage id="global.clear"/>
        </CButton>
        <CButton onClick={this.handleCancel}>
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
      onCancel: this.handleCancel,
      title,
      footer,
      className: styles.modal,
    };
    const contentProps = {
      showType,
      eleObj,
      rowKey,
      valueObj,
      selectedRows,
      treeNodeType,
      headerKeywords,
      filterMap,
      getGlobalVarValues,
      setWrapState: this.setWrapState,
    };
    const hasColor = ((relationTabId && (jumpType === 1 || !jumpType)) || (jumpType === 2 && jumpMenuList.length));
    const searchCls = classNames({
      [styles.search]: true,
      [styles.hasRelationTab]: hasColor,
      [styles.readOnly]: !!isReadOnly,
      [styles.disabled]: disabled,
    });
    const searchWrap = classNames({
      [styles.searchWrap]: true,
      [this.props.className]: true,
    });
    return (
      <div onMouseLeave={() => {
        toggleEdit && toggleEdit();
      }}>
        <div className={searchWrap}>
          <CSearch
            value={inputVal}
            onSearch={this.handleClickSearch}
            onChange={this.handleInputChange}
            className={searchCls}
            allowClear={false}
            disabled
          />
          {!!hasColor && inputVal &&
          <div className={styles.mask} onClick={handleClickValue}/>}
        </div>
        <CreateModal {...modalProps}>
          <ModalContent {...contentProps} />
        </CreateModal>
      </div>
    );
  }
}

export default NormalSearchSelect;
