import styles from '@/components/RoleManager/roleConfig.less';
import { Checkbox, Tooltip } from 'antd';
import { FormattedMessage } from 'react-intl';

/**
 * 获取pc端权限的表头
 * @param canmodify
 * @param pcObj
 * @param checkTypeAll
 * @param checkType
 * @param isUser
 * @returns {({dataIndex: string, width: string, title: *, key: string}|{dataIndex: string, width: string, title: *, filterMultiple: boolean, render: (function(*, *=): *), key: string}|{dataIndex: string, width: string, title: *, render: (function(*, *=): *), key: string}|{dataIndex: string, width: string, title: *, render: (function(*, *=): *), key: string}|{dataIndex: string, width: string, title: *, render: (function(*, *=): *), key: string})[]}
 */
export const getPcColumns = ({ canmodify, pcObj, checkTypeAll, checkType, isUser = false }) => {
  const pcColumns = [
    {
      title: <FormattedMessage id="role.table.function"/>,
      dataIndex: 'name',
      key: 'name',
      width: 304,
      fixed: true,
      render: (text) => {
        return <span title={text}>{text}</span>;
      },
    },
    {
      title: (
        <div><Checkbox disabled={!canmodify} checked={!!pcObj.canview} onChange={e => checkTypeAll(e, 'canview')}
                       className={styles.checkSty}/> <FormattedMessage
          id="role.table.look"/></div>),
      dataIndex: 'canview',
      key: 'canview',
      filterMultiple: true,
      width: '8%',
      render: (text, record) => {
        return (
          <div><Checkbox disabled={!canmodify} checked={record.attributes && record.attributes.canview ? true : false}
                         onChange={e => checkType(e, record, 'canview')}/></div>);
      },
    },
    {
      title: <div><Checkbox disabled={!canmodify} checked={!!pcObj.canadd}
                            onChange={e => checkTypeAll(e, 'canadd')}
                            className={styles.checkSty}/> <FormattedMessage id="role.table.add"/></div>,
      dataIndex: 'canadd',
      key: 'canadd',
      width: '8%',
      render: (text, record) => {
        return (
          <div><Checkbox disabled={!canmodify} checked={record.attributes && record.attributes.canadd ? true : false}
                         onChange={e => checkType(e, record, 'canadd')}/></div>);
      },
    },
    {
      title: (<div>
        <Checkbox
          disabled={!canmodify}
          checked={!!pcObj.canmodify}
          onChange={e => checkTypeAll(e, 'canmodify')}
          className={styles.checkSty}/> <FormattedMessage id="role.table.edit"/>
      </div>),
      dataIndex: 'canmodify',
      key: 'canmodify',
      width: '8%',
      render: (text, record) => {
        return (<div><Checkbox disabled={!canmodify}
                               checked={record.attributes && record.attributes.canmodify ? true : false}
                               onChange={e => checkType(e, record, 'canmodify')}/></div>);
      },
    },
    {
      title: (<div>
        <Checkbox
          disabled={!canmodify}
          checked={!!pcObj.candelete}
          onChange={e => checkTypeAll(e, 'candelete')}
          className={styles.checkSty}/> <FormattedMessage id="role.table.del"/>
      </div>),
      dataIndex: 'candelete',
      key: 'candelete',
      width: '8%',
      render: (text, record) => {
        return (<div><Checkbox disabled={!canmodify}
                               checked={record.attributes && record.attributes.candelete ? true : false}
                               onChange={e => checkType(e, record, 'candelete')}/></div>);
      },
    },
    {
      title: (<div>
        <Checkbox
          disabled={!canmodify}
          checked={!!pcObj.canprint}
          onChange={e => checkTypeAll(e, 'canprint')}
          className={styles.checkSty}/> <FormattedMessage id="role.table.print"/>
      </div>),
      dataIndex: 'canprint',
      key: 'canprint',
      width: '8%',
      render: (text, record) => {
        return (<div><Checkbox disabled={!canmodify}
                               checked={record.attributes && record.attributes.canprint ? true : false}
                               onChange={e => checkType(e, record, 'canprint')}/></div>);
      },
    },
    {
      title: (<div>
        <Checkbox
          disabled={!canmodify}
          checked={!!pcObj.candesign}
          onChange={e => checkTypeAll(e, 'candesign')}
          className={styles.checkSty}/> <FormattedMessage id="role.table.design"/>
      </div>),
      dataIndex: 'candesign',
      key: 'candesign',
      width: '8%',
      render: (text, record) => {
        return (<div><Checkbox disabled={!canmodify}
                               checked={record.attributes && record.attributes.candesign ? true : false}
                               onChange={e => checkType(e, record, 'candesign')}/></div>);
      },
    },
    {
      title: (<div>
        <Checkbox
          disabled={!canmodify}
          checked={!!pcObj.canAddFolder}
          onChange={e => checkTypeAll(e, 'canAddFolder')}
          className={styles.checkStyle}/> <Tooltip
        title={<FormattedMessage id="role.tooltip.add.folder"/>}><span><FormattedMessage
        id="role.table.add.folder"/></span></Tooltip>
      </div>),
      dataIndex: 'canAddFolder',
      key: 'canAddFolder',
      width: '16%',
      render: (text, record) => {
        return (<div><Checkbox disabled={!canmodify}
                               checked={record.attributes && record.attributes.canAddFolder ? true : false}
                               onChange={e => checkType(e, record, 'canAddFolder')}/></div>);
      },
    },
    {
      title: (<div>
        <Checkbox
          disabled={!canmodify}
          checked={!!pcObj.canUploadFile}
          onChange={e => checkTypeAll(e, 'canUploadFile')}
          className={styles.checkStyle}/> <Tooltip
        title={<FormattedMessage id="role.tooltip.upload.file"/>}><span><FormattedMessage
        id="role.table.upload.file"/></span></Tooltip>
      </div>),
      dataIndex: 'canUploadFile',
      key: 'canUploadFile',
      width: '16%',
      render: (text, record) => {
        return (<div><Checkbox disabled={!canmodify}
                               checked={record.attributes && record.attributes.canUploadFile ? true : false}
                               onChange={e => checkType(e, record, 'canUploadFile')}/></div>);
      },
    },
    {
      title: (
        <div>
          <Checkbox
            disabled={!canmodify}
            checked={!!pcObj.canRelation}
            onChange={e => checkTypeAll(e, 'canRelation')}
            className={styles.checkStyle}/> <Tooltip title={<FormattedMessage id="role.tooltip.relation.btn"/>}>
          <span><FormattedMessage id="role.table.relation.btn"/></span>
        </Tooltip>
        </div>
      ),
      dataIndex: 'canRelation',
      key: 'canRelation',
      width: '16%',
      render: (text, record) => {
        return (<div><Checkbox disabled={!canmodify}
                               checked={record.attributes && record.attributes.canRelation ? true : false}
                               onChange={e => checkType(e, record, 'canRelation')}/></div>);
      },
    },
    {
      title: (<div>
        <Checkbox
          disabled={!canmodify}
          checked={!!pcObj.canUpdateFolder}
          onChange={e => checkTypeAll(e, 'canUpdateFolder')}
          className={styles.checkStyle}/> <Tooltip
        title={<FormattedMessage id="role.tooltip.update.folder"/>}><span><FormattedMessage
        id="role.table.update.folder"/></span></Tooltip>
      </div>),
      dataIndex: 'canUpdateFolder',
      key: 'canUpdateFolder',
      width: '16%',
      render: (text, record) => {
        return (<div><Checkbox disabled={!canmodify}
                               checked={record.attributes && record.attributes.canUpdateFolder ? true : false}
                               onChange={e => checkType(e, record, 'canUpdateFolder')}/></div>);
      },
    },
    {
      title: (<div>
        <Checkbox
          disabled={!canmodify}
          checked={!!pcObj.canDelFolderFile}
          onChange={e => checkTypeAll(e, 'canDelFolderFile')}
          className={styles.checkStyle}/> <Tooltip
        title={<FormattedMessage id="role.tooltip.delete.fileOrFolder"/>}><span><FormattedMessage
        id="role.table.delete.fileOrFolder"/></span></Tooltip>
      </div>),
      dataIndex: 'canDelFolderFile',
      key: 'canDelFolderFile',
      width: '20%',
      render: (text, record) => {
        return (<div><Checkbox disabled={!canmodify}
                               checked={record.attributes && record.attributes.canDelFolderFile ? true : false}
                               onChange={e => checkType(e, record, 'canDelFolderFile')}/></div>);
      },
    },
    {
      title: (<div>
        <Checkbox
          checked={!!pcObj.all}
          disabled={!canmodify}
          onChange={e => checkTypeAll(e, 'all')}
          className={styles.checkSty}/> <FormattedMessage id="role.table.all"/>
      </div>),
      dataIndex: 'canexport1',
      key: 'canexport1',
      width: '8%',
      render: (text, record) => {
        let flag;
        if (!!record.attributes) {
          const {
            candesign = 0, canadd = 0, canmodify = 0, candelete = 0, canview = 0, canprint = 0, canAddFolder = 0,
            canUploadFile = 0,
            canRelation = 0,
            canUpdateFolder = 0,
            canDelFolderFile = 0,
          } = record.attributes && record.attributes;
          flag = canAddFolder && canUploadFile && canRelation && canUpdateFolder && canDelFolderFile && candesign && canadd && canmodify && candelete && canview && canprint ? true : false;
        } else {
          flag = false;
        }
        return (
          <div><Checkbox disabled={!canmodify} checked={flag} onChange={e => checkType(e, record, 'all')}/>
          </div>);
      },
    },
  ];
  if (isUser) {
    const caninherit = {
      title: (
        <div><Checkbox
          disabled={!canmodify}
          checked={!!pcObj.caninherit}
          onChange={e => checkTypeAll(e, 'caninherit')}
          className={styles.checkStyle}/> <FormattedMessage id="user.form.caninherit"/></div>),
      dataIndex: 'caninherit',
      key: 'caninherit',
      width: '8%',
      render: (text, record) => {
        return (<div><Checkbox disabled={!canmodify}
                               checked={record.attributes && record.attributes.caninherit ? true : false}
                               onChange={e => checkType(e, record, 'caninherit')}/></div>);
        // /></div>);
      },
    };
    pcColumns.splice(1, 0, caninherit);
  }
  return pcColumns;
};
/**
 * 获取app权限列表的表头
 * @param canmodify
 * @param appObj
 * @param checkAppAll
 * @param checkApp
 * @returns {({dataIndex: string, width: string, title: *, key: string}|{dataIndex: string, width: string, title: *, filterMultiple: boolean, render: (function(*, *=): *), key: string}|{dataIndex: string, width: string, title: *, render: (function(*, *=): *), key: string}|{dataIndex: string, width: string, title: *, render: (function(*, *=): *), key: string}|{dataIndex: string, width: string, title: *, render: (function(*, *=): *), key: string})[]}
 */
export const getAppColumns = ({ canmodify, appObj, checkAppAll, checkApp, isUser = false }) => {
  const appColumns = [
    {
      title: <FormattedMessage id="role.table.function"/>,
      dataIndex: 'name',
      key: 'name',
      width: '36%',
    },
    {
      title: (
        <div>
          <Checkbox disabled={!canmodify} checked={!!appObj.canview} onChange={e => checkAppAll(e, 'canview')}
                    className={styles.checkSty}/> <FormattedMessage
          id="role.table.look"/>
        </div>),
      dataIndex: 'canview',
      key: 'canview',
      filterMultiple: true,
      width: '8%',
      render: (text, record) => {
        return (<div>{record.isGroup ? null :
          <Checkbox disabled={!canmodify} checked={record.attributes && record.attributes.canview ? true : false}
                    onChange={e => checkApp(e, record, 'canview')}/>}</div>);
      },
    },
    {
      title: <div><Checkbox disabled={!canmodify} checked={!!appObj.canadd}
                            onChange={e => checkAppAll(e, 'canadd')}
                            className={styles.checkSty}/> <FormattedMessage id="role.table.add"/></div>,
      dataIndex: 'canadd',
      key: 'canadd',
      width: '8%',
      render: (text, record) => {
        return (<div>{record.isGroup || record.type === 'APP' ? null :
          <Checkbox disabled={!canmodify} checked={record.attributes && record.attributes.canadd ? true : false}
                    onChange={e => checkApp(e, record, 'canadd')}/>}</div>);
      },
    },
    {
      title: (<div>
        <Checkbox
          disabled={!canmodify}
          checked={!!appObj.canmodify}
          onChange={e => checkAppAll(e, 'canmodify')}
          className={styles.checkSty}/> <FormattedMessage id="role.table.edit"/>
      </div>),
      dataIndex: 'canmodify',
      key: 'canmodify',
      width: '8%',
      render: (text, record) => {
        return (<div>{record.isGroup || record.type === 'APP' ? null :
          <Checkbox disabled={!canmodify} checked={record.attributes && record.attributes.canmodify ? true : false}
                    onChange={e => checkApp(e, record, 'canmodify')}/>}</div>);
      },
    },
    {
      title: (<div>
        <Checkbox
          disabled={!canmodify}
          checked={!!appObj.candelete}
          onChange={e => checkAppAll(e, 'candelete')}
          className={styles.checkSty}/> <FormattedMessage id="role.table.del"/>
      </div>),
      dataIndex: 'candelete',
      key: 'candelete',
      width: '8%',
      render: (text, record) => {
        return (<div>{record.isGroup || record.type === 'APP' ? null :
          <Checkbox disabled={!canmodify} checked={record.attributes && record.attributes.candelete ? true : false}
                    onChange={e => checkApp(e, record, 'candelete')}/>}</div>);
      },
    },
    {
      title: (<div>
        <Checkbox
          disabled={!canmodify}
          checked={!!appObj.canprint}
          onChange={e => checkAppAll(e, 'canprint')}
          className={styles.checkSty}/> <FormattedMessage id="role.table.print"/>
      </div>),
      dataIndex: 'canprint',
      key: 'canprint',
      width: '8%',
      render: (text, record) => {
        return (<div>{record.isGroup || record.type === 'APP' ? null :
          <Checkbox disabled={!canmodify} checked={record.attributes && record.attributes.canprint ? true : false}
                    onChange={e => checkApp(e, record, 'canprint')}/>}</div>);
      },
    },
    {
      title: (<div>
        <Checkbox
          disabled={!canmodify}
          checked={!!appObj.candesign}
          onChange={e => checkAppAll(e, 'candesign')}
          className={styles.checkSty}/> <FormattedMessage id="role.table.design"/>
      </div>),
      dataIndex: 'candesign',
      key: 'candesign',
      width: '8%',
      render: (text, record) => {
        return (<div>{record.isGroup || record.type === 'APP' ? null :
          <Checkbox disabled={!canmodify} checked={record.attributes && record.attributes.candesign ? true : false}
                    onChange={e => checkApp(e, record, 'candesign')}/>}</div>);
      },
    },
    {
      title: (<div>
        <Checkbox
          disabled={!canmodify}
          checked={!!appObj.all}
          onChange={e => checkAppAll(e, 'all')}
          className={styles.checkSty}/> <FormattedMessage id="role.table.all"/>
      </div>),
      dataIndex: 'canexport1',
      key: 'canexport1',
      width: '8%',
      render: (text, record) => {
        let flag;
        if (!!record.attributes) {
          const { candesign = 0, canadd = 0, canmodify = 0, candelete = 0, canview = 0, canprint = 0 } = record.attributes && record.attributes;
          flag = candesign && canadd && canmodify && candelete && canview && canprint ? true : false;
        } else {
          flag = false;
        }
        return (
          <div>{record.isGroup || record.type === 'APP' ? null :
            <Checkbox disabled={!canmodify} checked={flag} onChange={e => checkApp(e, record, 'all')}/>}</div>);
      },
    },
  ];
  if (isUser) {
    const caninherit = {
      title: (
        <div><Checkbox disabled={!canmodify} checked={!!appObj.caninherit}
                       onChange={e => checkAppAll(e, 'caninherit')}
                       className={styles.checkSty}/> <FormattedMessage id="user.form.caninherit"/></div>),
      dataIndex: 'caninherit',
      key: 'caninherit',
      width: '8%',
      render: (text, record) => {
        return (<div>{record.isGroup ? null :
          <Checkbox disabled={!canmodify} checked={record.attributes && record.attributes.caninherit ? true : false}
                    onChange={e => checkApp(e, record, 'caninherit')}/>}</div>);
      },
    };
    appColumns.splice(1, 0, caninherit);
  }
  return appColumns;
};
