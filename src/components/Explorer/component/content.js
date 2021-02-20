import React, { Component } from 'react';
import CTable from '@/components/common/BasicWidgets/Widgets/CTable/CTable';
import { FormattedMessage } from 'react-intl';
import Style from '../Explorer.less';


class TableContent extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const columns = [{
      title: <FormattedMessage id="global.index"/>,
      dataIndex: 'type',
      key: 'type',
    }, {
      title: <FormattedMessage id="explor.colums.keycode"/>,
      dataIndex: 'keycode',
      key: 'keycode',
      width: '150px',
    }, {
      title: <FormattedMessage id="explor.colums.name"/>,
      dataIndex: 'name',
      key: 'name',
    }, {
      title: <FormattedMessage id="explor.colums.status"/>,
      dataIndex: 'status',
      key: 'status',
    }, {
      title: <FormattedMessage id="explor.colums.base"/>,
      dataIndex: 'base',
      key: 'base',
      render: (text, record) => {
        return (record.base ? <span title={record.base} className={Style.base + ' iconfont iconWater'}></span> : null);
      },
    }, {
      title: <FormattedMessage id="explor.colums.word"/>,
      dataIndex: 'word',
      key: 'word',
      render: (text, record) => {
        return (record.word ? <span title={record.word} className={Style.word + ' iconfont iconWater'}></span> : null);
      },
    }, {
      title: <FormattedMessage id="explor.colums.falult"/>,
      dataIndex: 'falult',
      key: 'falult',
      render: (text, record) => {
        return (record.falult ?
          <span title={record.falult} className={Style.falult + ' iconfont iconWater'}></span> : null);
      },
    }, {
      title: <FormattedMessage id="explor.colums.plan"/>,
      dataIndex: 'plan',
      key: 'plan',
      render: (text, record) => {
        return (record.plan ? <span title={record.plan} className={Style.plan + ' iconfont iconWater'}></span> : null);
      },
    }, {
      title: <FormattedMessage id="explor.colums.preject"/>,
      dataIndex: 'preject',
      key: 'preject',
      render: (text, record) => {
        return (record.preject ?
          <span title={record.preject} className={Style.preject + ' iconfont iconWater'}></span> : null);
      },
    }, {
      title: <FormattedMessage id="explor.colums.history"/>,
      dataIndex: 'history',
      key: 'history',
      render: (text, record) => {
        return (record.history ?
          <span title={record.history} className={Style.history + ' iconfont iconWater'}></span> : null);
      },
    }, {
      title: <FormattedMessage id="explor.colums.inspection"/>,
      dataIndex: 'inspection',
      key: 'inspection',
      render: (text, record) => {
        return (record.inspection ?
          <span title={record.inspection} className={Style.inspection + ' iconfont iconWater'}></span> : null);
      },
    }, {
      title: <FormattedMessage id="explor.colums.spare"/>,
      dataIndex: 'spare',
      key: 'spare',
      render: (text, record) => {
        return (record.spare ?
          <span title={record.spare} className={Style.spare + ' iconfont iconWater'}></span> : null);
      },
    }];
    const dataSource = [
      {
        key: '1',
        name: '传动装置',
        type: 1,
        keycode: '10812490001-01',
        status: '正常',
        base: 1,
        word: 1,
        falult: 1,
        plan: 1,
        preject: 1,
        history: 1,
        inspection: 1,
        spare: 1,
      },
      {
        key: '2',
        name: '电机',
        type: 2,
        keycode: '106Z1231006-0101',
        status: '正常',
        base: 1,
        word: 0,
        falult: 0,
        plan: 1,
        preject: 0,
        history: 1,
        inspection: 1,
        spare: 1,
      },
      {
        key: '3',
        name: '油泵',
        type: 3,
        keycode: '106Z1231006-0101',
        status: '正常',
        base: 1,
        word: 0,
        falult: 0,
        plan: 1,
        preject: 0,
        history: 1,
        inspection: 1,
        spare: 1,
      },
      {
        key: '4',
        name: '密封',
        type: 4,
        keycode: '106Z1231006-0105',
        status: '错误',
        base: 1,
        word: 0,
        falult: 1,
        plan: 1,
        preject: 0,
        history: 1,
        inspection: 0,
        spare: 1,
      }
    ];
    return (
      <CTable
        columns={columns}
        dataSource={dataSource}
        pagination={false}
      >
      </CTable>
    );
  }
}

export default TableContent;
