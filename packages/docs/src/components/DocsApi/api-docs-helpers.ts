import { DefineComponent, ComponentOptions } from 'vue'
import { kebabCase, camelCase } from 'lodash'
import { te as translationExists } from '../../helpers/I18nHelper'

import { ManualPropApiOptions, ManualApiOptions, ManualSlotApiOptions, ManualMethodApiOptions } from './ManualApiOptions'
import { compileComponentOptions, CompiledComponentOptions } from './component-options-compiler'
import { ApiEventRowOptions, ApiMethodRowOptions, ApiPropRowOptions, ApiSlotRowOptions, ApiTableData } from './ApiTableData'

function getComponentOptions (component: DefineComponent): ComponentOptions {
  if (component.options) {
    return component.options
  }

  if (component.__vccOpts || component.__b) {
    return { ...component.__vccOpts, ...component.__b }
  }

  return component
}

function getTranslation (type: string, name: string, componentName: string, custom?: string): string {
  const nameCamel = camelCase(name)
  if (custom && translationExists(custom)) { return custom }

  const componentTranslation = `api.${componentName}.${type}.${nameCamel}`

  if (translationExists(componentTranslation)) {
    return componentTranslation
  }

  const allTranslation = `api.all.${type}.${nameCamel}`
  if (translationExists(allTranslation)) {
    return allTranslation
  }

  return ''
}

const keysToKebabCase = <T>(obj: Record<string, T>) => {
  return Object.keys(obj).reduce((acc, o: string) => {
    acc[kebabCase(o)] = obj[o]
    return acc
  }, {} as Record<string, T>)
}

const getApiTableProps = (
  componentName: string,
  compiledComponentOptions: CompiledComponentOptions,
  manualOptions: ManualApiOptions = {},
) => {
  const api = {} as Record<string, ApiPropRowOptions>
  const manualProps = manualOptions.props ? keysToKebabCase(manualOptions.props) : {}
  const merged = { ...compiledComponentOptions.props, ...manualProps }

  for (const propName in merged) {
    const prop = compiledComponentOptions.props[propName]
    const manualPropOptions: ManualPropApiOptions = manualProps[propName] || {}

    if (manualPropOptions.hidden) { continue }

    api[propName] = {
      ...prop,
      name: kebabCase(propName),
      version: manualPropOptions.version || manualOptions.version || '',
      description: getTranslation('props', propName, componentName, manualPropOptions.translation),
      types: manualPropOptions.types
        ? `\`${manualPropOptions.types}\``
        : prop.types
          .map(type => `\`${type}\``)
          .join(' | '),
    }
  }

  return api
}

const getApiTableEvents = (
  componentName: string,
  compiledComponentOptions: CompiledComponentOptions,
  manualOptions: ManualApiOptions = {},
) => {
  const api = {} as Record<string, ApiEventRowOptions>
  const manualEvents = manualOptions.events ? keysToKebabCase(manualOptions.events) : {}
  const merged = { ...compiledComponentOptions.emits, ...manualEvents }

  for (const eventName in merged) {
    const event = merged[eventName]

    if (event.hidden) { continue }

    api[eventName] = {
      version: event.version || manualOptions.version || '',
      name: kebabCase(eventName),
      types: event.types,
      description: getTranslation('events', eventName, componentName, event.translation),
    }
  }

  return api
}

const getApiTableSlots = (
  componentName: string,
  compiledComponentOptions: CompiledComponentOptions,
  manualOptions: ManualApiOptions = {},
) => {
  const api = {} as Record<string, ApiSlotRowOptions>
  const manualSlots = manualOptions.slots ? keysToKebabCase(manualOptions.slots) : {}

  for (const slotName in manualSlots) {
    const manualSlotOptions: ManualSlotApiOptions = manualSlots[slotName] || {}

    api[slotName] = {
      version: manualSlotOptions.version || manualOptions.version || '',
      description: getTranslation('slots', slotName, componentName, manualSlotOptions.translation),
      name: kebabCase(slotName),
    }
  }

  return api
}

const getApiTableMethods = (
  componentName: string,
  compiledComponentOptions: CompiledComponentOptions,
  manualOptions: ManualApiOptions = {},
) => {
  const api = {} as Record<string, ApiMethodRowOptions>
  const manualMethods = manualOptions.methods ? keysToKebabCase(manualOptions.methods) : {}

  for (const methodName in manualMethods) {
    const manualMethodOptions: ManualMethodApiOptions = manualMethods[methodName] || {}
    api[methodName] = {
      version: manualMethodOptions.version || manualOptions.version || '',
      description: getTranslation('methods', methodName, componentName, manualMethodOptions.translation),
      name: kebabCase(methodName),
      types: manualMethodOptions.types,
    }
  }

  return api
}

export const getApiTableData = (component: any, manualApiOptions: ManualApiOptions = {}): ApiTableData => {
  const componentOptions: ComponentOptions = getComponentOptions(component as DefineComponent)
  const compiledComponentOptions = compileComponentOptions(componentOptions)
  const componentName = componentOptions.name as string

  const apiTableData: ApiTableData = {
    name: componentName,
    props: getApiTableProps(componentName, compiledComponentOptions, manualApiOptions),
    slots: getApiTableSlots(componentName, compiledComponentOptions, manualApiOptions),
    events: getApiTableEvents(componentName, compiledComponentOptions, manualApiOptions),
    methods: getApiTableMethods(componentName, compiledComponentOptions, manualApiOptions),
  }

  return apiTableData
}
