/*
 * @Author: Fus
 * @Date:   2019-08-14 09:50:25
 * @Last Modified by: Fus
 * @Last Modified time: 2019-08-24 14:44:36
 * @Desc: 面板配置中的头部信息（用于修改保存面板的基础信息）
 */
import { Component } from 'react';
import { Checkbox, Select } from 'antd';
import { FormattedMessage } from 'react-intl';
import { CSelect, SearchSelect, CInputNumber } from '@/components/common/BasicWidgets';
import FormItems from '@/components/common/FormItems/FormItems';
import { PAGE_TAB_TYPE } from '@/constants/pageConfig';
import styles from './HeaderForm.less';

const { Option } = Select;
// 面板类型下拉项
const pageTabTypeOptions = Object.keys(PAGE_TAB_TYPE).map(item => <Option key={`tabType-${item}`} value={item}><FormattedMessage id={PAGE_TAB_TYPE[item]} /></Option>);

class HeaderForm extends Component {
  // 更新当前面板信息
  setTabInfo = (key, value, isInTabPramDto) => {
    const { setTabItemData, tabData = {} } = this.props;
    const { tabPramDto = {} } = tabData;
    let newTabData = { ...tabData };
    if (isInTabPramDto) { // 更新tabPramDto中的数据
      newTabData = {
        ...newTabData,
        tabPramDto: {
          ...tabPramDto,
          [key]: value,
        },
      };
    } else { // 直接更新tabData层的数据
      newTabData = {
        ...tabData,
        [key]: value,
      };
    }
    setTabItemData({ tabData: newTabData });
  }
  // 生成表单配置项
  getFormItems = () => {
    const { tabData = {} } = this.props;
    const { tabPramDto = {} } = tabData;
    return [
      {
        key: 'visiabled',
        label: '',
        colSpan: 3,
        config: {
          initialValue: !!tabData.visiabled,
          valuePropName: 'checked',
        },
        component: (
          <Checkbox onChange={e => this.setTabInfo('visiabled', +e.target.checked, false)}>
            <FormattedMessage id="pageConfig.tab.visible" />
          </Checkbox>
        ),
      }, {
        key: 'basetype',
        label: <FormattedMessage id="pageConfig.tab.type" />,
        colSpan: 7,
        config: {
          initialValue: tabPramDto.basetype ? `${tabPramDto.basetype}` : '',
        },
        component: (
          <CSelect className={styles.select} onChange={val => this.setTabInfo('basetype', +val, true)}>
            {pageTabTypeOptions}
          </CSelect>
        ),
      }, {
        key: 'relationTableName',
        label: <FormattedMessage id="pageConfig.tab.originData" />,
        colSpan: 7,
        offset: 2,
        config: {
          initialValue: tabData.relationTableName,
        },
        component: (
          <SearchSelect
            modalContentType="relateTable"
            showType="list"
            setSelected={selectedRows => this.setTabInfo('relateTable', selectedRows[0].tableName, true)}
          />
        ),
      }, {
        key: 'sno',
        label: <FormattedMessage id="global.order" />,
        colSpan: 4,
        offset: 1,
        config: {
          initialValue: tabData.sno,
        },
        component: <CInputNumber onChange={val => this.setTabInfo('sno', val, false)} />,
      },
    ];
  }
  render() {
    const { form } = this.props;
    return (
      <div className={styles.wrap}>
        <FormItems
          form={form}
          formConfigs={this.getFormItems()}
          loading={false}
        />
      </div>
    );
  }
}
export default HeaderForm;