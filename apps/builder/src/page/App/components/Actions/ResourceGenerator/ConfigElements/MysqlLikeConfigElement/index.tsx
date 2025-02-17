import { TextLink } from "@illa-public/text-link"
import { isCloudVersion } from "@illa-public/utils"
import { FC, useMemo } from "react"
import { useFormContext } from "react-hook-form"
import { Trans, useTranslation } from "react-i18next"
import { useSelector } from "react-redux"
import {
  Alert,
  Button,
  ButtonGroup,
  Divider,
  PreviousIcon,
  getColor,
} from "@illa-design/react"
import {
  applyConfigItemLabelText,
  configItemTip,
  connectType,
  connectTypeStyle,
  container,
  divider,
  footerStyle,
  labelContainer,
  optionLabelStyle,
} from "@/page/App/components/Actions/styles"
import { ControlledElement } from "@/page/App/components/ControlledElement"
import {
  MysqlLikeResource,
  tiDBServertCertDefaultValue,
} from "@/redux/resource/mysqlLikeResource"
import { Resource } from "@/redux/resource/resourceState"
import { RootState } from "@/store"
import { isContainLocalPath, validate } from "@/utils/form"
import { handleLinkOpen } from "@/utils/navigate"
import { CreateButton } from "../ActionButtons/CreateButton"
import { TestConnectButton } from "../ActionButtons/TestConnectButton"
import { MysqlLikeConfigElementProps } from "./interface"

const getResourceDefaultPort = (resourceType: string) => {
  switch (resourceType) {
    case "hydra":
    case "postgresql":
    case "supabasedb":
      return "5432"
    case "mysql":
    case "mariadb":
      return "3306"
    case "tidb":
      return "4000"
    default:
      return "3306"
  }
}

const MysqlLikeConfigElement: FC<MysqlLikeConfigElementProps> = (props) => {
  const { onBack, resourceType, resourceID, hasFooter = true } = props

  const { t } = useTranslation()
  const { control, watch } = useFormContext()

  const resource = useSelector((state: RootState) => {
    return state.resource.find(
      (r) => r.resourceID === resourceID,
    ) as Resource<MysqlLikeResource>
  })

  const sslDefaultValue =
    resource?.content.ssl.ssl ??
    (resourceType === "tidb" || resourceType === "hydra")
  const serverCertDefaultValue =
    resource?.content.ssl.serverCert ??
    (resourceType === "tidb" || resourceType === "hydra"
      ? tiDBServertCertDefaultValue
      : "")

  const serverCertTip = useMemo(() => {
    return resourceType === "tidb" || resourceType === "hydra" ? (
      <Trans
        i18nKey="editor.action.form.tips.tidb.ca_certificate"
        t={t}
        components={[
          <TextLink
            key="ca-link"
            onClick={() => {
              if (resourceType === "tidb") {
                handleLinkOpen(
                  "https://docs.pingcap.com/tidbcloud/tidb-cloud-tls-connect-to-dedicated-tier",
                )
              } else if (resourceType === "hydra") {
                handleLinkOpen(
                  "https://docs.hydra.so/cloud-warehouse-operations/tls",
                )
              }
            }}
          />,
        ]}
      />
    ) : (
      ""
    )
  }, [resourceType, t])

  const hostValue = watch("host")
  const showAlert = isContainLocalPath(hostValue ?? "")
  const sslOpenWatch = watch("ssl", sslDefaultValue)

  const handleDocLinkClick = () =>
    handleLinkOpen("https://www.illacloud.com/docs/illa-cli")

  return (
    <>
      <div css={container}>
        <div css={divider} />
        <ControlledElement
          controlledType="input"
          isRequired
          title={t("editor.action.resource.db.label.name")}
          control={control}
          defaultValue={resource?.resourceName ?? ""}
          rules={[
            {
              validate,
            },
          ]}
          placeholders={[t("editor.action.resource.db.placeholder.name")]}
          name="resourceName"
          tips={t("editor.action.resource.restapi.tip.name")}
        />
        <Divider
          direction="horizontal"
          ml="24px"
          mr="24px"
          mt="8px"
          mb="8px"
          w="unset"
        />
        <div css={optionLabelStyle}>
          {t("editor.action.resource.db.title.general_option")}
        </div>
        <ControlledElement
          title={t("editor.action.resource.db.label.hostname_port")}
          defaultValue={[resource?.content.host, resource?.content.port]}
          name={["host", "port"]}
          controlledType={["input", "number"]}
          control={control}
          isRequired
          rules={[
            {
              validate,
            },
            {
              required: true,
            },
          ]}
          styles={[
            {
              flex: 4,
            },
            {
              flex: 1,
            },
          ]}
          placeholders={[
            t("editor.action.resource.db.placeholder.hostname"),
            getResourceDefaultPort(resourceType),
          ]}
        />
        {showAlert && (
          <ControlledElement
            defaultValue=""
            name=""
            title=""
            controlledType="none"
            control={control}
            tips={
              <Alert
                title={t("editor.action.form.tips.connect_to_local.title.tips")}
                closable={false}
                content={
                  isCloudVersion ? (
                    <Trans
                      i18nKey="editor.action.form.tips.connect_to_local.cloud"
                      t={t}
                      components={[
                        <TextLink
                          key="editor.action.form.tips.connect_to_local.cloud"
                          onClick={handleDocLinkClick}
                        />,
                      ]}
                    />
                  ) : (
                    t("editor.action.form.tips.connect_to_local.selfhost")
                  )
                }
              />
            }
          />
        )}
        <ControlledElement
          title={t("editor.action.resource.db.label.database")}
          defaultValue={resource?.content.databaseName}
          name="databaseName"
          controlledType="input"
          control={control}
          isRequired
          rules={[
            {
              validate,
            },
          ]}
          placeholders={[t("editor.action.resource.db.placeholder.database")]}
        />
        <ControlledElement
          title={t("editor.action.resource.db.label.username_password")}
          defaultValue={[
            resource?.content.databaseUsername,
            resource?.content.databasePassword,
          ]}
          name={["databaseUsername", "databasePassword"]}
          controlledType={["input", "password"]}
          control={control}
          isRequired
          rules={[
            {
              validate,
            },
            {
              required: true,
            },
          ]}
          placeholders={[
            t("editor.action.resource.db.placeholder.username"),
            t("editor.action.resource.db.placeholder.password"),
          ]}
        />
        {isCloudVersion && (
          <>
            <div css={configItemTip}>
              {t("editor.action.resource.db.tip.username_password")}
            </div>
            <div css={connectType}>
              <div css={labelContainer}>
                <span
                  css={applyConfigItemLabelText(getColor("grayBlue", "02"))}
                >
                  {t("editor.action.resource.db.label.connect_type")}
                </span>
              </div>
              <span css={connectTypeStyle}>
                {t("editor.action.resource.db.tip.connect_type")}
              </span>
            </div>
          </>
        )}
        <Divider
          direction="horizontal"
          ml="24px"
          mr="24px"
          mt="8px"
          mb="8px"
          w="unset"
        />
        <div css={optionLabelStyle}>
          {t("editor.action.resource.db.title.advanced_option")}
        </div>
        <ControlledElement
          controlledType={["switch"]}
          title={t("editor.action.resource.db.label.ssl_options")}
          control={control}
          defaultValue={sslDefaultValue}
          name="ssl"
          contentLabel={t("editor.action.resource.db.tip.ssl_options")}
        />
        {sslOpenWatch && (
          <>
            <ControlledElement
              controlledType={["textarea"]}
              title={t("editor.action.resource.db.label.ca_certificate")}
              isRequired
              rules={[
                {
                  validate,
                },
              ]}
              control={control}
              defaultValue={serverCertDefaultValue}
              name="serverCert"
              placeholders={[
                t("editor.action.resource.db.placeholder.certificate"),
              ]}
              tips={serverCertTip}
            />
            <ControlledElement
              controlledType={["textarea"]}
              title={t("editor.action.resource.db.label.client_key")}
              control={control}
              defaultValue={resource?.content.ssl.clientKey}
              name="clientKey"
              placeholders={[
                t("editor.action.resource.db.placeholder.certificate"),
              ]}
            />
            <ControlledElement
              controlledType={["textarea"]}
              title={t("editor.action.resource.db.label.client_certificate")}
              control={control}
              defaultValue={resource?.content.ssl.clientCert}
              name="clientCert"
              placeholders={[
                t("editor.action.resource.db.placeholder.certificate"),
              ]}
            />
          </>
        )}
      </div>
      {hasFooter && (
        <div css={footerStyle}>
          <Button
            leftIcon={<PreviousIcon />}
            variant="text"
            colorScheme="gray"
            type="button"
            onClick={onBack}
          >
            {t("back")}
          </Button>
          <ButtonGroup spacing="8px">
            <TestConnectButton resourceType={resourceType} />
            <CreateButton />
          </ButtonGroup>
        </div>
      )}
    </>
  )
}

MysqlLikeConfigElement.displayName = "MysqlConfigElement"
export default MysqlLikeConfigElement
