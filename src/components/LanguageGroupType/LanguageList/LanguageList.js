import React, { Component, Fragment } from 'react';
import { Modal } from 'antd';
import CInput from '@/components/common/BasicWidgets/Widgets/CInput/CInput';
import CTable from '@/components/common/BasicWidgets/Widgets/CTable/CTable';
import CButton from '@/components/common/BasicWidgets/Widgets/CButton/CButton';
import CreateModal from '@/components/common/CreateModal/CreateModal';
import RelationElementList from '../RelationElementList/RelationElementList';
import { BaseContext } from '@/constants/global';
import { FormattedMessage } from 'react-intl';
import { getLanguagesPage, doUpdateOrAdd, doBatchDelete, doBatchElement } from '@/services/language';
import Styles from './LanguageList.less';
import CMessage from '@/components/common/BasicWidgets/Widgets/CMessage/CMessage';
import { getDefaultConfirmProps } from '@/utils/common';
import ModalBox from '@/components/common/ReminderBox/ReminderBox';

class LanguageList extends Component {
  static contextType = BaseContext;

  constructor(props) {
    super();
    this.state = {
      list: [],
      loading: false,
      name: '',
      visible: false,
      selected: [], // 选中的数据
    };
  }

  componentWillReceiveProps(nextProps) {
    const { actionType, activeDetail } = nextProps;
    if (actionType === 'addElement') {
      this.setState({ loading: true });
      this.getLanguageList();
    } else if (actionType === 'editElement') {
      this.setState({
        name: activeDetail.name || '',
        list: activeDetail.list || [],
      });
    }
  }


  componentDidMount() {
    const { actionType, activeDetail } = this.props;
    if (actionType === 'addElement') {
      this.setState({ loading: true });
      this.getLanguageList();
    }
  }

  // 组装多语言数据
  getLanguageList = () => {
    getLanguagesPage({ pageSize: 999999, pageNum: 1 }).then(res => {
      const { activeTreeNodeDetail } = this.props;
      let orgList = res.list || [];
      let newList = orgList.map(item => {
        return {
          sno: item.sno,
          languagesConfigId: item.id,
          languagesConfigName: item.name,
          name: '',
        };
      });
      this.setState({
        list: newList || [],
        loading: false,
      });
    });
  };

  // 修改数据
  chanageValue = (e, index) => {
    const { list } = this.state;
    list[index].name = e.target.value;
    this.setState({
      list,
    });
  };
  // 修改名称
  changeTitle = (e) => {
    this.setState({
      name: e.target.value,
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
  // 进行解除关联关系
  ReleaseControlRelationship = () => {
    const { selected } = this.state;
    const { activeDetail } = this.props;
    const { langLib } = this.context;
    if (!selected.length) {
      CMessage(langLib['message.please.choose'], 'error');
      return;
    }
    let params = {
      typeids: ['1', '2', '3'],
      elements: selected,
      languagestemplateid: -1,
      languagestemplatename: activeDetail.name,
    };
    return new Promise((resolve, reject) => {
      let { close } = ModalBox.confirm({
        okText: langLib['confirm.ok'],
        cancelText: langLib['confirm.cancel'],
        title: langLib['confirm.del.Release'],
        onOk: () => {
          doBatchElement(params).then(res => {
            CMessage(langLib['message.check.success'], 'success');
            this.setState({
              selected: [],
            });
            closeModal();
            this.refs.RelationElementList && this.refs.RelationElementList.getList();
          });
        },
        onCancel: () => closeModal(),
      });
      const closeModal = () => {
        close();
      };
      // Modal.confirm({
      //   className: 'customConfirmColor',
      //   okText: langLib['confirm.ok'],
      //   cancelText: langLib['confirm.cancel'],
      //   title: langLib['confirm.del.Release'],
      //   onOk: () => {
      //     doBatchElement(params).then(res => {
      //       CMessage(langLib['message.check.success'], 'success');
      //       this.setState({
      //         selected: [],
      //       });
      //       this.refs.RelationElementList && this.refs.RelationElementList.getList();
      //     });
      //   },
      // });
    });
  };

  render() {
    const { list, loading, name, visible } = this.state;
    const { activeDetail, actionType, functionData } = this.props;
    const { canmodify, canadd, candelete } = functionData.attributes;
    const columns = [
      {
        title: <FormattedMessage id="menu.table.sno"/>,
        dataIndex: 'sno',
        width: 100,
      },
      {
        title: <FormattedMessage id="global.name"/>,
        dataIndex: 'languagesConfigName',
        width: 200,
      },
      {
        title: <FormattedMessage id="global.translate"/>,
        dataIndex: 'name',
        width: 250,
        render: (text, record, index) => {
          return <CInput value={record.name || ''} onChange={(e) => {
            this.chanageValue(e, index);
          }}/>;
        },
      },
    ];
    const footer = (
      <Fragment>
        <CButton onClick={() => {
          this.setState({ visible: false });
        }}>
          <FormattedMessage id="global.cancel"/>
        </CButton>
        {canmodify ? <CButton
          type="primary"
          onClick={() => this.ReleaseControlRelationship()}
        >
          <FormattedMessage id="language.update.template"/>
        </CButton> : null}
      </Fragment>
    );
    const modalProps = {
      visible,
      title: <FormattedMessage id="languages.title.relation"/>,
      size: 'large',
      onCancel: () => {
        this.setState({ visible: false, selected: [] });
      },
      footer,
    };
    return (<div className={Styles.content}>
      <div className={Styles.name}><FormattedMessage id="global.name"/>
        <CInput className={Styles.nameInput} value={name} onChange={(e) => {
          this.changeTitle(e);
        }}/>
        {actionType === 'addElement' ? null : <CButton onClick={() => {
          this.setState({
            visible: true,
          });
        }} className={Styles.btn}><FormattedMessage id="languages.relation.elements"/></CButton>}
      </div>
      <CTable
        className={Styles.table}
        columns={columns}
        rowKey={record => record.sno}
        dataSource={list}
        loading={loading}
        scroll={{ y: 'calc(100vh - 250px)' }}
        pagination={false}
      />
      <CreateModal {...modalProps}>
        <RelationElementList
          ref={'RelationElementList'}
          activeDetail={activeDetail}
          updateState={this.updateState}
        />
      </CreateModal>
    </div>);
  }
}

export default LanguageList;
