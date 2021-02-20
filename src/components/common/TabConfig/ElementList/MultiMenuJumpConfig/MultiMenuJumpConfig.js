/*
 * @Author: jwk
 * @Date:   2020-06-30 16:48:55
 * @Desc: 多菜单跳转配置
 */
import { Component, Fragment } from 'react';
import { FormattedMessage } from 'react-intl';
import { Tooltip, Icon, Select } from 'antd';
import copy from 'copy-to-clipboard';
import { CTable, CTextArea, CButton, CMessage, SearchSelect, CSelect } from '@/components/common/BasicWidgets';
import { BaseContext } from '@/constants/global';
import { getMoreFileList } from '@/services/pageConfig';
import styles from './MultiMenuJumpConfig.less';
import { JSON_TEMPLATE, JSON_TEMPLATE_FILE } from '@/constants/triggerState';

const { Option } = Select;

class MultiMenuJumpConfig extends Component {
  static contextType = BaseContext;
  state = {
    loading: false,
  };

  componentDidMount() {
    this.fetchData();
  }

  fetchData = () => {
    const { elementData } = this.props;
    const { id: elementId } = elementData;
    this.setState({ loading: true });
    getMoreFileList({ elementId }).then(multiMenuList => {
      this.setState({
        loading: false,
      });
      this.props.setWrapState({ multiMenuList });
    }, err => this.setState({ loading: false }));
  };
  // 新增数据
  handleAddRow = () => {
    const { multiMenuList, elementData } = this.props;
    const newList = [...multiMenuList];
    newList.push({
      sno: multiMenuList.length + 1,
      elementId: elementData.id,
    });
    this.props.setWrapState({ multiMenuList: newList });
  };
  // 删除数据
  handleMinusRow = (index) => {
    const { multiMenuList } = this.props;
    const newList = [...multiMenuList];
    newList.splice(index, 1);
    this.props.setWrapState({ multiMenuList: newList });
  };
  // 更新数据
  setRowData = ({ key, value, index, subKey, subValue }) => {
    const { multiMenuList } = this.props;
    const newList = [...multiMenuList];
    newList[index] = {
      ...newList[index],
      [key]: value,
      [subKey]: subValue,
    };
    this.props.setWrapState({ multiMenuList: newList });
  };
  // 复制模板
  handleCopyTemplate = (template) => {
    const { langLib } = this.context;
    if (copy(template)) {
      CMessage(langLib['message.copy.success']);
    } else {
      CMessage(langLib['message.copy.error']);
    }
  };
  // 关联菜单表头
  getMenuColumns = () => {
    const { isPC } = this.props;
    return [
      {
        dataIndex: 'preconditions',
        title: <Fragment>
          <Tooltip
            title={(
              <Fragment>
                <FormattedMessage id="global.template"/>
                <span className={styles.copyEntry} onClick={() => this.handleCopyTemplate(JSON_TEMPLATE)}>
                  <FormattedMessage id="global.clickToCopy"/>
                </span>
                {JSON_TEMPLATE}
              </Fragment>
            )}
          >
            <div>
              <FormattedMessage id="framePage.form.jumpMune.param.config"/>
              <Icon type="question-circle" className={styles.tip}/>
            </div>
          </Tooltip>
        </Fragment>,
        width: '35%',
        render: (text, record, index) => {
          return <CTextArea value={text} onChange={(e) => {
            this.setRowData({
              key: 'preconditions',
              value: e.target.value,
              index,
            });
          }}></CTextArea>;
        },
      }, {
        dataIndex: isPC ? 'functionName' : 'bundleName',
        title: isPC ? <FormattedMessage id="settingForm.functionId"/> : <FormattedMessage id="settingForm.bundleId"/>,
        width: 180,
        render: (text, record, index) => {
          return (isPC ? <SearchSelect
            value={text}
            modalContentType="function"
            showType="tree"
            setSelected={(selectedRows = []) => {
              let selectData = selectedRows[0] || {};
              this.setRowData({
                key: 'functionName',
                subKey: 'jumpFunctionId',
                value: selectData.name || '',
                subValue: selectData.id || '',
                index,
              });
            }}
          /> : <SearchSelect
            value={text}
            modalContentType="bundle"
            showType="tree"
            setSelected={(selectedRows = []) => {
              let selectData = selectedRows[0] || {};
              this.setRowData({
                key: 'bundleName',
                subKey: 'jumpBundleId',
                value: selectData.name || '',
                subValue: selectData.id || '',
                index,
              });
            }}
          />);
        },
      }, {
        dataIndex: 'passParam',
        title: <Fragment>
          <Tooltip
            title={(
              <Fragment>
                <FormattedMessage id="global.template"/>
                <span className={styles.copyEntry} onClick={() => this.handleCopyTemplate(JSON_TEMPLATE_FILE)}>
                  <FormattedMessage id="global.clickToCopy"/>
                </span>
                {JSON_TEMPLATE_FILE}
              </Fragment>
            )}
          >
            <div>
              <FormattedMessage id="settingForm.file.relation.data"/>
              <Icon className={styles.tip} type="question-circle"/>
            </div>
          </Tooltip>
        </Fragment>,
        width: '35%',
        render: (text, record, index) => {
          return <CTextArea value={text} onChange={(e) => {
            this.setRowData({
              key: 'passParam',
              value: e.target.value,
              index,
            });
          }}></CTextArea>;
        },
      }, {
        dataIndex: 'ignore-operator',
        title: <FormattedMessage id="global.operator"/>,
        render: (text, record, index) => (
          <div className={styles.operator}>
            {/* <span
              onClick={() => this.handleAddRow(index)}
              className="iconfont icon-add-border custom-color"
            /> */}
            {/* {multiRelateList.length > 1 && ( */}
            <span
              onClick={() => this.handleMinusRow(index)}
              className="iconfont icon-minus-border custom-color"
            />
            {/* )} */}
          </div>
        ),
      },
    ];
  };
  // 关联面板表头
  getTabColumns = () => {
    const { elementData, tabList, isPC } = this.props;
    let keyName = isPC ? 'tabId' : 'mobileTabId';
    const tabOptions = tabList.map(item => {
      if (item.id !== elementData[keyName]) {
        return <Option value={item.id} key={item.id}> {item.name} </Option>;
      }
    });
    return [
      {
        dataIndex: 'preconditions',
        title: <Fragment>
          <Tooltip
            title={(
              <Fragment>
                <FormattedMessage id="global.template"/>
                <span className={styles.copyEntry} onClick={() => this.handleCopyTemplate(JSON_TEMPLATE)}>
                  <FormattedMessage id="global.clickToCopy"/>
                </span>
                {JSON_TEMPLATE}
              </Fragment>
            )}
          >
            <div>
              <FormattedMessage id="framePage.form.jumpTab.param.config"/>
              <Icon type="question-circle" className={styles.tip}/>
            </div>
          </Tooltip>
        </Fragment>,
        width: '60%',
        render: (text, record, index) => {
          return <CTextArea value={text} onChange={(e) => {
            this.setRowData({
              key: 'preconditions',
              value: e.target.value,
              index,
            });
          }}></CTextArea>;
        },
      }, {
        dataIndex: isPC ? 'jumpTabId' : 'jumpMobileTabId',
        title: <FormattedMessage id="framePage.form.relation.tab.config"/>,
        width: 200,
        render: (text, record, index) => {
          return <CSelect className={styles.cselect}
                          value={record[isPC ? 'jumpTabId' : 'jumpMobileTabId']}
                          onChange={value => this.setRowData({
                            key: isPC ? 'jumpTabId' : 'jumpMobileTabId',
                            value,
                            index,
                          })}
          >
            <Option value={null}><FormattedMessage id="global.null"/></Option>
            {tabOptions}
          </CSelect>;
        },
      }, {
        dataIndex: 'ignore-operator',
        title: <FormattedMessage id="global.operator"/>,
        render: (text, record, index) => (
          <div className={styles.operator}>
            {/* <span
              onClick={() => this.handleAddRow(index)}
              className="iconfont icon-add-border custom-color"
            /> */}
            {/* {multiRelateList.length > 1 && ( */}
            <span
              onClick={() => this.handleMinusRow(index)}
              className="iconfont icon-minus-border custom-color"
            />
            {/* )} */}
          </div>
        ),
      },
    ];
  };
  // 获取列名
  getColumns = () => {
    const { basetype } = this.props.elementData;
    switch (basetype) {
      case 43:
        return this.getMenuColumns();  // 关联菜单表头
      case 44:
        return this.getTabColumns(); // 关联面板表头
      default:
        return this.getMenuColumns();  // 关联菜单表头
    }
  };

  render() {
    const { loading } = this.state;
    const { multiMenuList } = this.props;
    return (
      <div className={styles.wrap}>
        <CButton className={styles.addBtn} onClick={this.handleAddRow}>
          <FormattedMessage id="global.addData"/>
        </CButton>
        <div className={styles.tableWrap}>
          <CTable
            columns={this.getColumns()}
            dataSource={multiMenuList}
            loading={loading}
            pagination={false}
            rowKey="sno"
          />
        </div>
      </div>
    );
  }
}

export default MultiMenuJumpConfig;
