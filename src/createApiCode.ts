import format from "./format";
import Typing from "./Typing";
import Groups from "./Groups";
import ParameterGroup from "./ParameterGroup";
import urlResolve from "./urlResolve";
import comment from "./comment";
import formdataCode from "./formdataCode";

interface Config {
  paths: Paths
  version?: 'ts' | 'js'
  baseURL?: string
  definitions?: Definitions
  customResponse?: string
  axiosFrom?: string
}

export default function (config: Config) {
  if (!config.version) config.version = 'js'
  const typingCodes: string[] = []
  if (config.definitions)
    typingCodes.push(...Typing(config.definitions, config.version))
  const groups = Groups(config.paths)
  const codes: string[] = []
  codes.push(`import axios from '${config.axiosFrom || 'axios'}'`, '')
  if(config.baseURL) codes.push(`axios.defaults.baseURL = '${config.baseURL}'`, '')
  codes.push('export default {')
  Object.entries(groups).forEach(([name, group], i, {length}) => {
    codes.push(`${name}: {`)
    Object.entries(group.apis).forEach(([apiName, ctx], i, {length}) => {
      const parameterGroup = ParameterGroup(ctx.parameters)
      const paramString = ParameterGroup.string(parameterGroup, config.version)
      codes.push(...comment([
        ctx.summary,
        ctx.description && `@explain ${ctx.description}`,
        ...config.version == 'js' ? ParameterGroup.jsdocObj(parameterGroup) : [],
      ]))
      const responseType = config.version === 'ts' && config.customResponse
        ? `: Promise<${config.customResponse}>` : ''
      codes.push(`${apiName}(${paramString})${responseType} {`)
      codes.push(`const method = '${ctx.method}'`)
      const axiosConfig = ParameterGroup.axiosConfig(parameterGroup)
      if(parameterGroup.formData) codes.push(...formdataCode(config.version))
      codes.push(`return axios(${urlResolve(ctx.path)}, { ${axiosConfig} })`)
      codes.push('}' + (length !== i+1 ? ',' : ''))
    })
    codes.push('}' + (length !== i+1 ? ',' : ''))
  }),
  codes.push('}\n')
  codes.push(...typingCodes, '')
  return format(codes)
}
