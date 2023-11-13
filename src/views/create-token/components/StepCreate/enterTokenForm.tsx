import { Form, Input, Upload, message } from 'antd'
import type { RcFile, UploadChangeParam, UploadFile } from 'antd/lib/upload'
import React, { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { LoadingOutlined } from '@ant-design/icons'
import styles from './index.module.less'
import { getBase64, verifyNumber, verifyNumberLen } from '@/utils/common'

const EnterTokenForm: React.FC<{
  propRef: React.Ref<any>
  visible: boolean
  showMore: boolean
  onMainCompleteChange: (v: { total_supply?: number; symbol?: string; url: string }) => any
}> = ({ propRef, visible, showMore, onMainCompleteChange }) => {
  const [loading, setLoading] = useState(false)
  const [url, setUrl] = useState('')
  const [fileList, setFileList] = useState([])
  const [mainComplete, setMainComplete] = useState<{ total_supply?: number; symbol?: string } | null>(null)
  const [isNameActiveModification, setIsNameActiveModification] = useState(false)

  const [form] = Form.useForm()
  const [messageApi, contextHolder] = message.useMessage()
  const isImgOk = useRef(false)

  useEffect(() => {
    form.setFieldValue('decimals', 18)
  }, [])

  useEffect(() => {
    onMainCompleteChange({ ...mainComplete, url })
  }, [mainComplete, url])

  const getFormData = useCallback(() => {
    return {
      ...form.getFieldsValue(),
      imgSrc: url,
    }
  }, [url])

  const clear = () => {
    form.resetFields()
    setFileList([])
  }

  useImperativeHandle(propRef, () => ({
    getFormData,
    clear,
  }))

  const beforeUpload = (file: RcFile) => {
    const isLt2M = file.size / 1024 / 1024 < 0.08

    isImgOk.current = isLt2M

    return isImgOk.current
  }

  const handleChange = (info: UploadChangeParam<UploadFile<any>>) => {
    setLoading(true)

    if (!isImgOk.current) {
      messageApi.error('Image must smaller than 80KB! and You can only upload JPG/PNG file!')
      setLoading(false)
      return
    }

    if (!info.file.originFileObj) {
      messageApi.error('Image acquisition error')
      return
    }

    getBase64(info.file.originFileObj, (url: string) => {
      setLoading(false)
      if (!url) {
        messageApi.error('Image acquisition error')
        return
      }
      setUrl(url)

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      setFileList(info.fileList?.map(el => ({ ...el, status: 'done' })))
    })
  }

  const handleRequest = (info: any) => {
    return info.file
  }

  const handleSupplyChange = (e: any) => {
    const v = verifyNumberLen(e.target.value, '99999999999999999', 17)
    form.setFieldValue('total_supply', v)
    setMainComplete({ ...mainComplete, total_supply: Number(v) })
  }

  const handleSymbolChange = (e: any) => {
    const v = e.target.value

    setMainComplete({ ...mainComplete, symbol: v })

    if (isNameActiveModification)
      return

    form.setFieldValue('name', v)
  }

  const handleNameFocused = () => {
    setIsNameActiveModification(true)
  }

  const handleDecimalsChange = (e: any) => {
    form.setFieldValue('decimals', verifyNumber(e.target.value, 18))
  }

  const labelRender = useCallback((num: number, text: string, tip?: string) => (<div className={ styles.label }>
    <span className={ styles.num }>{ num ? `0${num}` : '' }</span>
    <span className={ styles.text }>{ text }</span>
    <span className={ styles.tip }>{ tip }</span>
  </div>), [])

  return (
    <>
      { contextHolder }

      <Form
        form={ form }
        layout="vertical"
        className={ visible ? '' : styles.opacity }
      >
        <div className={ styles['enter-token-form'] }>
          <Form.Item label={ labelRender(0, 'Token Symbol') } name="symbol">
            <Input maxLength={ 16 } placeholder="1-16 Character" autoComplete="off" onChange={ handleSymbolChange } />
          </Form.Item>
          <Form.Item label={ labelRender(0, 'Token Supply') } name="total_supply">
            <Input placeholder="1-99,999,999,999,999,999" autoComplete="off" onChange={ handleSupplyChange } />
          </Form.Item>
          {
            showMore && <Form.Item label={ labelRender(0, 'Token Full Name') } name="name">
              <Input placeholder="1-64 Characters" autoComplete="off" onFocus={ handleNameFocused } />
            </Form.Item>
          }
          {
            showMore && <Form.Item label={ labelRender(0, 'Decimals') } name="decimals">
              <Input onChange={ handleDecimalsChange } placeholder="1-18" autoComplete="off" />
            </Form.Item>
          }
          <Form.Item label={ labelRender(0, 'Token Logo Src', '(Recommended size 48px * 48px)') } name="logo">
            <div className={ styles['upload-box'] }>
              <Upload
                name="logo"
                listType="picture-card"
                className={ styles['avatar-uploader'] }
                showUploadList={{ showPreviewIcon: false, showRemoveIcon: true }}
                fileList={ fileList }
                maxCount={ 1 }
                accept=".jpg,.png"
            // customRequest={ handleShamRequest }
                beforeUpload={ beforeUpload }
                onChange={ handleChange }
                customRequest={ handleRequest }
        >
                {
            fileList?.length < 1 && <div>
              { loading ? <LoadingOutlined /> : null }
              <div className={ styles.upload }>
                <div>+</div>
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            </div>
          }

              </Upload>
            </div>
          </Form.Item>
        </div>
      </Form>
    </>
  )
}

export default EnterTokenForm
