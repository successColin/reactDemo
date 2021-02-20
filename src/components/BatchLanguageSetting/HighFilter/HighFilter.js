import react, { Component } from 'react';
import { Select,Radio } from 'antd';
import { FormattedMessage } from 'react-intl';
import FormItems from '@/components/common/FormItems/FormItems';
import { CTextArea, CSelect, CInput, SearchSelect, SplitLine, CAutoComplete } from '@/components/common/BasicWidgets';

const { Option } = Select;

class HighFilter extends Component {
  constructor(props) {
    super();
  }

  getFormConfigs = () => {
    const { highFilter } = this.props;
    const publicConfig = [{
      key: 'type',
      colon: false,
      colSpan: 12,
      label: <FormattedMessage id="langauges.terminus"/>,
      config: {
        requre: false,
        initialValue: highFilter.type || '',
      },
      component:
      (<Radio.Group>
        <Radio value={'PC'}>PC</Radio>
        <Radio value={'APP'}>APP</Radio>
      </Radio.Group>),
    }, {
      key: 'functionname',
      colon: false,
      colSpan: 12,
      label: <FormattedMessage id="langauges.functionname"/>,
      config: {
        requre: false,
        initialValue: highFilter.functionname || '',
      },
      component: <CInput/>,
    }, {
      key: 'userdesignername',
      colon: false,
      colSpan: 12,
      label: <FormattedMessage id="langauges.design"/>,
      config: {
        requre: false,
        initialValue: highFilter.userdesignername || '',
      },
      component: <CInput/>,
    }, {
      key: 'tabname',
      colon: false,
      colSpan: 12,
      label: <FormattedMessage id="langauges.tab"/>,
      config: {
        requre: false,
        initialValue: highFilter.tabname || '',
      },
      component: <CInput/>,
    }, {
      key: 'displayname',
      colon: false,
      colSpan: 12,
      label: <FormattedMessage id="pageConfig.col.showName"/>,
      config: {
        requre: false,
        initialValue: highFilter.displayname || '',
      },
      component: <CInput/>,
    }];
    return publicConfig;
  };

  render() {
    const { form } = this.props;
    return (<FormItems
      formConfigs={this.getFormConfigs()}
      form={form}
      loading={false}
    />);
  }
}

export default HighFilter;
