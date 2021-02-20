import React, { Component } from 'react';
import classNames from 'classnames';
import { connect } from 'dva';
import { Form, Input, Row, Col, message } from 'antd';
import themes from '@/themes';
import Styles from './PerfectPersonal.less';
import secret from '@/constants/secret';

import { perfectPersonalInfo } from '@/services/login';

import login_log from '@/assets/pcLoginLog.png';
import { CInput, CTextArea } from '@/components/common/BasicWidgets';
import SCheckbox from './SCheckbox';
import CButton from '@/components/common/BasicWidgets/Widgets/CButton/CButton';
import FormItems from '@/components/common/FormItems/FormItems';

@connect(state => ({
  theme: state.global.theme
}))
class PerfectPersonal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    }
  }
  componentWillMount () {

  }
  componentDidMount () {

  }

  getConfig = () => {
    const colSpan = 24,
      message = '必填';
    const plainOptions = ['故障报修', '设备保养', '设备点检', '库存管理', '设备状态监测', '知识库与人员技能'];
    return [{
      colSpan,
      key: 'companyName',
      label: '公司名称',
      component: <CInput placeholder="请输入公司名称" />,
      config: {
        rules: [{
          required: true, message
        }]
      },
    }, {
      colSpan,
      key: 'username',
      label: '您的姓名',
      component: <CInput placeholder="请输入您的姓名" />,
      config: {
        rules: [{
          required: true, message
        }]
      },
    }, {
      colSpan,
      key: 'password',
      label: '登录密码',
      component: <Input.Password placeholder="请输入登录密码" />,
      config: {
        rules: [{
          required: true, message
        }]
      },
    }, {
      colSpan,
      key: 'post',
      label: '您的职务',
      component: <CInput placeholder="请输入您的职务" />,
    }, {
      colSpan,
      key: 'email',
      label: '常用邮箱',
      component: <CInput placeholder="请输入常用邮箱" />,
    }, {
      colSpan,
      key: 'businessname',
      label: '业务类型',
      component: <SCheckbox options={plainOptions}></SCheckbox>
    }, {
      colSpan,
      key: 'businessmemo',
      label: '业务简述',
      component: <CTextArea placeholder="描述一下您的业务需求~" />,
    }]
  }

  prefectInfo = (e) => {//完善信息
    e.preventDefault();
    this.setState({ loading: true })
    this.props.form.validateFields((err, values) => {
      if (!err) {//如果没有验证问题需要进行登录注册
        const { perfectParams } = this.props,
          { loginMsg } = perfectParams,
          { id, token } = loginMsg
        let updateParam = { ...values }
        updateParam.id = id
        updateParam.whether = 1
        updateParam.businessname = updateParam.businessname && updateParam.businessname.join(",")
        updateParam.password = secret.encrypt(values.password) //如果为密码登录，对密码进行加密

        perfectPersonalInfo(updateParam, token).then(res => {
          let { whether } = updateParam
          message.success('信息完善成功，请重新登录！', 1, () => {
            this.props.setWhether(whether)
          })
        }).finally(() => {
          this.setState({ loading: false })
        })
      } else {
        this.setState({ loading: false })
      }
    })
  }
  render () {
    let { form, theme, perfectParams } = this.props

    //主题色
    const activeTheme = themes[theme],//当前的主题色
      wrapCls = `theme-${theme}`;
    const wrapLayoutCls = classNames({
      [activeTheme[wrapCls]]: true,
      [Styles.perfectPersonal]: true
    })
    const loading = false

    //登录页轮播logo
    const pcLoginLogo = perfectParams.pcLoginLogo || login_log
    return (
      <div className={wrapLayoutCls}>
        <header className={Styles.header}>
          <img src={pcLoginLogo} alt="" />
          <div className={Styles.header_title}>欢迎体验APIoT系统</div>
        </header>
        <div className={Styles.content}>
          <div className={Styles.info}>
            <div className={Styles.title}>完善信息</div>
            <div className={Styles.prefectInfo}>
              <Form>
                <FormItems
                  formConfigs={this.getConfig()}
                  form={form}
                  loading={loading}
                />
                <Form.Item className={Styles.footer}>
                  <Row>
                    <Col span={24} className="prefectPersonalBtn custom-color">
                      <CButton htmlType="submit" onClick={this.prefectInfo} loading={this.state.loading}>完善信息</CButton>
                    </Col>
                  </Row>
                </Form.Item>
              </Form>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Form.create()(PerfectPersonal);