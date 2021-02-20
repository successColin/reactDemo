/*
 * @Author: jwk
 * @Date:   2020-07-18 11:32:39
 * @Last Modified by: jwk
 * @Last Modified time: 2020-01-06 10:14:01
 */

import { Component, Fragment } from 'react';
import classNames from 'classnames';
import { Resizable, ResizableBox } from 'react-resizable';
import { FormattedMessage } from 'react-intl';
import { Tag } from 'antd';
import { CSearch, CButton } from '@/components/common/BasicWidgets';
import CreateModal from '@/components/common/CreateModal/CreateModal';
import ModalContent from './ModalContent/ModalContent';
import { stringToArrayObject } from '@/utils/common';
import { BaseContext } from '@/constants/global';
import { getNormalSearchDetail, getCheckBoxSearchDetail } from '@/services/frame';
import styles from './CheckBoxSearchSelect.less';


class CheckBoxSearchSelect extends Component {
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
      keyName: 'tableName', // 选择的key字段名
    },
  };

  static getDerivedStateFromProps(props, state) {
    if (props.value !== state.inputVal && !(!props.value && !state.inputVal)) {
      // 设置已选的数据
      const { form, eleObj, value, valueObj } = props;
      let selectedRows = [], sourceSelectedRows = [];
      if (!!valueObj.id || !!valueObj.name) {
        selectedRows = stringToArrayObject(valueObj.id, valueObj.name);
        sourceSelectedRows = stringToArrayObject(valueObj.id, valueObj.name);
      }
      return {
        inputVal: props.value || '',
        selectedRows,
        sourceSelectedRows,
      };
    }
    if (state.type !== 'edit' && state.sourceSelectedRows.length && !state.selectedRows.length) { // 如果源数据有同时被勾选的数据没有，就赋值过去
      return {
        selectedRows: [...state.sourceSelectedRows],
      };
    }
    // 未设置过树、列表的需要根据控件信息判断
    if (!state.showType) {
      const { selectShowType } = props.eleObj;
      if (selectShowType === 1 || selectShowType === 3 || selectShowType === null) {
        return {
          showType: 'tree',
        };
      } else if (selectShowType === 2 || selectShowType === 3 || selectShowType === null) {
        return {
          showType: 'list',
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
    sourceSelectedRows: [], // 源数据
    headerKeywords: null, // 头部搜索内容
    loadingSave: false, // 保存按钮loading
    type: '', // 用于控制数据，如果type是edit类型的，数据删除完之后不允许恢复，是其他类型的允许
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
    let newSelectedRows = selectedRows.filter(item => !!item.id);
    if (!newSelectedRows.length) { // 如果选择的数据没有都没有id，择取消
      this.handleCancel();
      return;
    }
    // 取有id的数据进行回填
    this.setState({ loadingSave: true });
    getCheckBoxSearchDetail({
      tableName: eleObj.mainTableName,
      ids: newSelectedRows.map(item => item.id).join(','),
    }).then(res => {
      this.setState({ loadingSave: false });
      this.handleCancel(() => {
        this.props.setSelected(res);
      });
    }, err => this.setState({ loadingSave: false }));
  };
  // 点击取消
  handleCancel = (callback) => {
    const { selectShowType } = this.props.eleObj;
    this.setState({
      visible: false,
      showType: selectShowType === 1 || selectShowType === 3 || selectShowType === null ? 'tree' : 'list',
      selectedRows: [],
      type: '',
      headerKeywords: null,
    }, () => {
      callback && callback();
    });
  };
  // 点击清除
  handleClear = () => {
    this.props.setSelected([]);
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
  // 重新更新状态
  setWrapState = (itemObj, callback) => {
    this.setState(itemObj, () => callback && callback());
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
    let data = {
      id: idsArr.join(','),
      name: namesArr.join(','),
    };
    this.props.deleteTag(data);
  };
  // 渲染标签
  renderTagList = () => {
    const { sourceSelectedRows = [] } = this.state;
    const { eleObj } = this.props;
    const { readonly } = eleObj;
    return sourceSelectedRows.map((item, index) => <Tag key={item.id} closable={!readonly}
                                                        onClose={() => this.deleteTag(index)}>{item.name}</Tag>);
  };

  render() {
    const { multiple = false, eleObj, isReadOnly, rowKey, disabled, handleClickValue, filterMap, getGlobalVarValues, valueObj = {} } = this.props;
    let { visible, selectedRows = [], showType, inputVal, loadingSave, headerKeywords, treeNodeType, sourceSelectedRows } = this.state;
    const { displayName, relationTabId, mainTableName, readonly } = eleObj;
    const modalSearchCls = classNames({
      [styles.modalSearch]: true,
      [styles.showInput]: true,
    });
    // 标题
    const title = (
      <Fragment>
        <FormattedMessage id="normalSearchSelect.title" values={{ name: displayName }}/>
        {selectedRows.length && !multiple ? <span className={styles.subName}>
          （<FormattedMessage id="global.active.name" values={{ name: selectedRows[0].name }}/>）
        </span> : null}
        <CSearch
          allowClear={false}
          className={modalSearchCls}
          onSearch={this.handleSearch}
          onChange={e => !e.target.value && this.setState({ headerKeywords: null })}
        />
      </Fragment>
    );
    // 底部栏按钮
    const footer = (
      <Fragment>
        <CButton onClick={this.handleClear}>
          <FormattedMessage id="global.clear"/>
        </CButton>
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
      title,
      footer,
      className: styles.modal,
    };
    if (showType === 'tree') { // 数据处理，如果是展示树形的，就根据实体表和id拼接处nodeKey,用于数据直接在树上勾选
      selectedRows = selectedRows.map(item => {
        return { id: item.id, name: item.name, nodeKey: `${item.id}-${mainTableName.toUpperCase()}` };
      });
    }
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
      sourceSelectedRows,
      multiple,
      setWrapState: this.setWrapState,
    };
    return (
      <ResizableBox
        className={styles['custom-resizable-box']}
        axis="y"
        height={64}
        minheight={64}
        resizeHandles={['se']}
      >
        <div className={styles.searchWrap}>
          {!!readonly ? null :
            <CButton onClick={this.handleClickSearch} className={styles.cbutton} type="default" size="small">
              <span className={`${styles.addIcon} ${styles.addCommon}`}>+</span>
              <span className={styles.addCommon}><FormattedMessage id="global.add.more"/></span>
            </CButton>}
          {this.renderTagList()}
          {!!relationTabId && !!inputVal && <div className={styles.mask} onClick={handleClickValue}/>}
        </div>
        <CreateModal {...modalProps}>
          <ModalContent {...contentProps} />
        </CreateModal>
      </ResizableBox>
    );
  }
}

export default CheckBoxSearchSelect;
