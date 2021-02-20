/*
 * @Author: Fus
 * @Date:   2019-09-24 14:08:55
 * @Desc: 多级关联条件
 */
import { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { CTable, SearchSelect, CButton, CInput, ColorPicker, CTextArea } from '@/components/common/BasicWidgets';
import styles from './MultiRelateTable.less';
import AddElement from '@/components/common/TabConfig/ElementList/CompositeControl/AddElement/AddElement';
import CreateModal from '@/components/common/CreateModal/CreateModal';
import { combinationInfo } from '@/services/pageConfig';

class CompositeControl extends Component {
  state = {
    visible: false,
    loading: false,
  };

  componentDidMount() {
    this.fetchData();
  }

  fetchData = () => {
    const { elementData } = this.props;
    const { id: elementId } = elementData;
    this.setState({ loading: true });
    combinationInfo({ elementId }).then(visibleList => {
      this.setState({
        loading: false,
      });
      this.props.setWrapState({ visibleList });
    }, err => this.setState({ loading: false }));
  };
  // 新增数据
  handleAddRow = () => {
    this.setState({ visible: true });
  };
  // 删除数据
  handleMinusRow = (index) => {
    const { visibleList } = this.props;
    const newList = [...visibleList];
    newList.splice(index, 1);
    this.props.setWrapState({ visibleList: newList });
  };
  // 更新数据
  setRowData = ({ key, value, index }) => {
    const { visibleList } = this.props;
    const newList = [...visibleList];
    newList[index] = {
      ...newList[index],
      [key]: value,
    };
    this.props.setWrapState({ visibleList: newList });
  };
  // 获取列名
  getColumns = () => {
    return [
      {
        title: <FormattedMessage id="global.index"/>,
        dataIndex: 'index',
      },
      {
        dataIndex: 'displayName',
        title: <FormattedMessage id="pageConfig.col.showName"/>,
        render: (text, record, index) => {
          return (<CInput value={text} onChange={(e) => {
            this.setRowData({
              key: 'displayName',
              value: e.target.value,
              index,
            });
          }}/>);
        },
      }, {
        dataIndex: 'colorCode',
        title: <FormattedMessage id="settingForm.colorCode"/>,
        render: (text, record, index) => (
          <ColorPicker
            placement="right"
            color={record.colorCode || ''}
            handleSaveColor={value => this.setRowData({
              key: 'colorCode',
              value,
              record,
              index,
            })}
          >
            <CInput
              value={record.colorCode || ''}
              onBlur={e => this.setRowData({
                key: 'colorCode',
                value: e.target.value,
                record,
                index,
              })}
            />
          </ColorPicker>
        ),
      }, {
        dataIndex: 'ignore-operator',
        title: <FormattedMessage id="global.operator"/>,
        render: (text, record, index) => (
          <div className={styles.operator}>
            <span
              onClick={() => this.handleMinusRow(index)}
              className="iconfont icon-minus-border custom-color"
            />
          </div>
        ),
      },
    ];
  };
  handleChoose = () => {
    const { visibleList, elementData } = this.props;
    const { selectedElement } = this.refs.AddElement && this.refs.AddElement.state;
    const { id: elementId } = elementData;
    const newList = selectedElement.map(item => {
      const { displayName, id, colorCode = '' } = item;
      return {
        elementId,
        relationElementId: id,
        displayName,
        colorCode,
      };
    });
    this.props.setWrapState({ visibleList: [...visibleList, ...newList] });
    this.setState({ visible: false });
  };

  render() {
    const { loading, visible } = this.state;
    const { visibleList = [], tabElementList, elementData } = this.props;
    const dataSource = visibleList.map((item, index) => {
      return { ...item, index: index + 1 };
    });
    return (
      <div className={styles.wrap}>
        <CButton className={styles.addBtn} onClick={this.handleAddRow}>
          <FormattedMessage id="global.addData"/>
        </CButton>
        <div className={styles.tableWrap}>
          <CTable
            columns={this.getColumns()}
            dataSource={dataSource}
            loading={loading}
            pagination={false}
            rowKey="relationElementId"
          />
        </div>
        <CreateModal  // 选择控件
          visible={visible}
          title={<FormattedMessage id="connect.element"/>}
          onCancel={() => this.setState({ visible: false })}
          onOk={this.handleChoose}
        >
          <AddElement
            ref="AddElement"
            tabElementList={tabElementList}
            elementData={elementData}
          />
        </CreateModal>
      </div>
    );
  }
}

export default CompositeControl;
